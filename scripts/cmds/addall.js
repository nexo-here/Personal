module.exports = {
  config: {
    name: "addall",
    version: "1.0",
    author: "NEXXO",
    role: 2, // Only bot owner or admin
    shortDescription: {
      en: "Add all users from current group to another group"
    },
    longDescription: {
      en: "Add all users from the current group into another group using its thread ID"
    },
    category: "admin",
    guide: {
      en: "{pn} <targetThreadID>"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("Please provide the target group thread ID.\nExample: !addall 1234567890", event.threadID);

    const targetThreadID = args[0];
    const sourceThreadID = event.threadID;

    try {
      const threadInfo = await api.getThreadInfo(sourceThreadID);
      const memberIDs = threadInfo.participantIDs;

      for (let uid of memberIDs) {
        // Delay to avoid rate limit (optional)
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          await api.addUserToGroup(uid, targetThreadID);
        } catch (e) {
          console.log(`Failed to add user ${uid}: ${e.message}`);
        }
      }

      api.sendMessage(`Attempted to add all members to group ID ${targetThreadID}`, sourceThreadID);
    } catch (err) {
      api.sendMessage(`Error: ${err.message}`, event.threadID);
    }
 
  }
};