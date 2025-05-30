//Modified by NEXXO ☠️

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
  Object.keys(options).map(key => {
    switch (key) {
      case 'online':
      case 'selfListen':
      case 'selfListenEvent':
      case 'listenEvents':
      case 'updatePresence':
      case 'autoMarkDelivery':
      case 'autoMarkRead':
      case 'listenTyping':
      case 'autoReconnect':
      case 'emitReady':
        globalOptions[key] = Boolean(options[key]);
        break;
      case 'logLevel':
        log.level = options.logLevel;
        globalOptions.logLevel = options.logLevel;
        break;
      case 'logRecordSize':
        log.maxRecordSize = options.logRecordSize;
        globalOptions.logRecordSize = options.logRecordSize;
        break;
      case 'pageID':
        globalOptions.pageID = options.pageID.toString();
        break;
      case 'userAgent':
        globalOptions.userAgent = options.userAgent || globalOptions.userAgent;
        break;
      case 'proxy':
        if (typeof options.proxy !== "string") {
          delete globalOptions.proxy;
          utils.setProxy();
        } else {
          globalOptions.proxy = options.proxy;
          utils.setProxy(globalOptions.proxy);
        }
        break;
      case 'forceLogin':
        globalOptions.forceLogin = false; // 🔒 Always false to avoid suspicious login
        break;
      default:
        log.warn("setOptions", "Unrecognized option: " + key);
        break;
    }
  });
}

function buildAPI(globalOptions, html, jar) {
  const cookieMap = jar.getCookies("https://www.facebook.com").reduce((acc, c) => {
    acc[c.key] = c.value;
    return acc;
  }, {});

  const userID = cookieMap.c_user;
  const i_userID = cookieMap.i_user || null;

  if (!userID) throw { error: "❌ Login failed: Missing c_user. Cookie may be invalid or blocked by Facebook." };

  clearInterval(checkVerified);

  const clientID = (Math.random() * 2147483648 | 0).toString(16);

  let mqttEndpoint, region, fb_dtsg;
  const endpointMatch = html.match(/"endpoint":"(.*?)"/);
  if (endpointMatch) {
    mqttEndpoint = endpointMatch[1].replace(/\\\//g, '/');
    const url = new URL(mqttEndpoint);
    region = url.searchParams.get('region')?.toUpperCase() || "PRN";
    log.info('login', `🌐 Facebook region: ${region}`);
  }

  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  fb_dtsg = tokenMatch?.[1] || null;

  const ctx = {
    userID, i_userID, jar, clientID, globalOptions, loggedIn: true,
    access_token: 'NONE', clientMutationId: 0,
    mqttClient: undefined, mqttEndpoint, region, fb_dtsg,
    wsReqNumber: 0, wsTaskNumber: 0, reqCallbacks: {}, firstListen: true
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

function loginHelper(appState, email, password, globalOptions, callback) {
  const jar = utils.getJar();
  let mainPromise;

  if (appState) {
    if (typeof appState === 'string') {
      appState = appState.split(';').map(c => {
        const [key, value] = c.split('=');
        return {
          key: key.trim(), value: value.trim(),
          domain: "facebook.com", path: "/",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2)
        };
      });
    }

    appState.forEach(c => {
      const str = `${c.key}=${c.value}; domain=${c.domain}; path=${c.path}; expires=${new Date(c.expires).toUTCString()}`;
      jar.setCookie(str, `https://${c.domain}`);
    });

    mainPromise = utils.get("https://www.facebook.com/", jar, null, globalOptions, { noRef: true })
      .then(async res => {
        await delay(1500); // 🔒 delay to avoid rate limit
        return utils.saveCookies(jar)(res);
      });
  } else {
    throw { error: "⚠️ AppState is required. Email/password login is unsupported." };
  }

  mainPromise
    .then(res => {
      const html = res.body;
      const [ctx, _defaultFuncs, api] = buildAPI(globalOptions, html, jar);
      return callback(null, api);
    })
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
    forceLogin: false, // 🔒 Disable force login
    autoMarkDelivery: true,
    autoMarkRead: false,
    autoReconnect: true,
    logRecordSize: defaultLogRecordSize,
    online: true,
    emitReady: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
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

module.exports = login;//⚠️ Don't change credits
