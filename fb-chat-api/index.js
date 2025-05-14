"use strict";

const utils = require("./utils");
const log = require("npmlog");
const fs = require("fs");

let checkVerified = null;

const defaultLogRecordSize = 100;
log.maxRecordSize = defaultLogRecordSize;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setOptions(globalOptions, options) {
  Object.keys(options).map(function (key) {
    switch (key) {
      case 'online':
        globalOptions.online = Boolean(options.online);
        break;
      case 'logLevel':
        log.level = options.logLevel;
        globalOptions.logLevel = options.logLevel;
        break;
      case 'logRecordSize':
        log.maxRecordSize = options.logRecordSize;
        globalOptions.logRecordSize = options.logRecordSize;
        break;
      case 'selfListen':
        globalOptions.selfListen = Boolean(options.selfListen);
        break;
      case 'selfListenEvent':
        globalOptions.selfListenEvent = options.selfListenEvent;
        break;
      case 'listenEvents':
        globalOptions.listenEvents = Boolean(options.listenEvents);
        break;
      case 'pageID':
        globalOptions.pageID = options.pageID.toString();
        break;
      case 'updatePresence':
        globalOptions.updatePresence = Boolean(options.updatePresence);
        break;
      case 'forceLogin':
        globalOptions.forceLogin = Boolean(options.forceLogin);
        break;
      case 'userAgent':
        globalOptions.userAgent = options.userAgent;
        break;
      case 'autoMarkDelivery':
        globalOptions.autoMarkDelivery = Boolean(options.autoMarkDelivery);
        break;
      case 'autoMarkRead':
        globalOptions.autoMarkRead = Boolean(options.autoMarkRead);
        break;
      case 'listenTyping':
        globalOptions.listenTyping = Boolean(options.listenTyping);
        break;
      case 'proxy':
        if (typeof options.proxy != "string") {
          delete globalOptions.proxy;
          utils.setProxy();
        } else {
          globalOptions.proxy = options.proxy;
          utils.setProxy(globalOptions.proxy);
        }
        break;
      case 'autoReconnect':
        globalOptions.autoReconnect = Boolean(options.autoReconnect);
        break;
      case 'emitReady':
        globalOptions.emitReady = Boolean(options.emitReady);
        break;
      default:
        log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
        break;
    }
  });
}

function buildAPI(globalOptions, html, jar) {
  const maybeCookie = jar.getCookies("https://www.facebook.com").filter(val => val.cookieString().split("=")[0] === "c_user");
  const objCookie = jar.getCookies("https://www.facebook.com").reduce((obj, val) => {
    obj[val.cookieString().split("=")[0]] = val.cookieString().split("=")[1];
    return obj;
  }, {});

  if (maybeCookie.length === 0) {
    throw { error: "Error retrieving userID. Possibly blocked by Facebook." };
  }

  const userID = maybeCookie[0].cookieString().split("=")[1].toString();
  const i_userID = objCookie.i_user || null;
  log.info("login", `Logged in as ${userID}`);

  try {
    clearInterval(checkVerified);
  } catch (_) {}

  const clientID = (Math.random() * 2147483648 | 0).toString(16);

  let mqttEndpoint, region, fb_dtsg;
  try {
    const endpointMatch = html.match(/"endpoint":"([^\"]+)"/);
    if (endpointMatch) {
      mqttEndpoint = endpointMatch[1].replace(/\\\//g, '/');
      const url = new URL(mqttEndpoint);
      region = url.searchParams.get('region')?.toUpperCase() || "PRN";
    }
    log.info('login', `Server region: ${region}`);
  } catch (e) {
    log.warn('login', 'No MQTT endpoint found.');
  }

  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  if (tokenMatch) {
    fb_dtsg = tokenMatch[1];
  }

  const ctx = {
    userID, i_userID, jar, clientID, globalOptions, loggedIn: true,
    access_token: 'NONE', clientMutationId: 0, mqttClient: undefined,
    mqttEndpoint, region, fb_dtsg, wsReqNumber: 0, wsTaskNumber: 0,
    reqCallbacks: {}, firstListen: true
  };

  const api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState: () => utils.getAppState(jar)
  };

  const defaultFuncs = utils.makeDefaults(html, i_userID || userID, ctx);
  fs.readdirSync(__dirname + '/src/').filter(v => v.endsWith('.js')).map(v => {
    api[v.replace('.js', '')] = require('./src/' + v)(defaultFuncs, api, ctx);
  });
  api.listen = api.listenMqtt;

  return [ctx, defaultFuncs, api];
}

function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
  const jar = utils.getJar();
  let mainPromise;

  if (appState) {
    if (typeof appState === 'string') {
      const arrayAppState = [];
      appState.split(';').forEach(c => {
        const [key, value] = c.split('=');
        arrayAppState.push({
          key: key.trim(),
          value: value.trim(),
          domain: "facebook.com",
          path: "/",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2)
        });
      });
      appState = arrayAppState;
    }

    appState.forEach(c => {
      const str = `${c.key}=${c.value}; domain=${c.domain}; path=${c.path}; expires=${new Date(c.expires).toUTCString()}`;
      jar.setCookie(str, `https://${c.domain}`);
    });

    mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
      .then(async res => {
        await delay(1500);
        return utils.saveCookies(jar)(res);
      });
  } else {
    throw { error: "No appState provided. Email/password login is unsupported." };
  }

  let ctx, _defaultFuncs, api;

  mainPromise = mainPromise
    .then(res => {
      const html = res.body;
      [ctx, _defaultFuncs, api] = buildAPI(globalOptions, html, jar);
      return res;
    })
    .then(() => {
      if (globalOptions.pageID) {
        return utils.get(`https://www.facebook.com/${ctx.globalOptions.pageID}/messages/`, ctx.jar, null, globalOptions);
      }
    })
    .then(() => callback(null, api))
    .catch(e => {
      log.error("login", e.error || e);
      callback(e);
    });
}

function login(loginData, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const globalOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: false,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: true,
    autoMarkRead: false,
    autoReconnect: true,
    logRecordSize: defaultLogRecordSize,
    online: true,
    emitReady: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  };

  setOptions(globalOptions, options);

  if (typeof callback !== 'function') {
    return new Promise((resolve, reject) => {
      loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, (err, api) => {
        if (err) return reject(err);
        resolve(api);
      });
    });
  }

  loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback);
}

module.exports = login;
	    
