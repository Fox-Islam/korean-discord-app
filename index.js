/* ___________ REQUIRE CORE DEPENDENCIES AND CONFIG FILES ___________ */

const Discord = require("discord.js");
require("dotenv").config();
/* ------------------------------------------------------- */

/* ________________ REQUIRE CUSTOM FUNCTIONS ________________ */

const { explicitWordFilter } = require("./scripts/expletives");
const { koreanObserver } = require("./scripts/korean-channel");
const { resourcesObserver } = require("./scripts/resource-channels");
const { manualUnMute } = require("./scripts/users/permissions");
const { regularQualifyCheck } = require("./scripts/users/user-utilities");
const { unPin50thMsg, getAllChannels, logMessageDate, ping, isKoreanChannel, isLinksChannel, isTestChannel } = require("./scripts/utilities");
const { gameExplanation, shouldStartGame, startGame, endGame, gameIsRunning, gameListener  } = require("./scripts/activities/games");
/* ------------------------------------------------------ */

/* ________________ DECLARE MAIN VARIABLES ________________ */

const client = new Discord.Client();
const counter = {}; // Message counter object for users
/* -------------------------------------------------------- */

/* ________________ INITIATING FUNCTION ________________ */

client.on("ready", () => {
	console.log("\nLittle LyonHeart ♡ is online.\n");
	client.guilds
		.fetch(process.env.SERVER_ID) //server ID
		.then((guild) => {
			global.guild = guild;
		})
		.catch(console.error);
	getAllChannels(client);
});
/* --------------------------------------------- */

/* ________________ MAIN MESSAGE LISTENER ________________ */

client.on("message", (message) => {
	if (!message.guild) return; // Ignores DMs
	text = message.content.toLowerCase();
	regularQualifyCheck(message);

	// Sends typing game explanation to exercise channel
	gameExplanation(message);

	if (message.author.bot) {
		if (message.type === "PINS_ADD") message.delete();
		return; // Ignores messages from bots
	}
	if (message.type === "PINS_ADD") return; // Ignores PIN messages
	if (text.includes("http")) return; // Ignores all links
	if (text.includes("wake up") && text.includes(process.env.CLIENT_ID)) {
		// Bot's ID
		ping(message);
		return;
	}
	if (text.includes("unmute everyone") && text.includes(process.env.CLIENT_ID)) {
		unMuteAll(message);
		return;
	}
	if (text.includes("copy") && text.includes("pins") && text.includes(process.env.CLIENT_ID)) {
		getPinned(message);
		return;
	}
	if (text.includes("paste") && text.includes("pins") && text.includes(process.env.CLIENT_ID)) {
		movePinned(message, global.pinnedMessages);
		return;
	}

	// --- EXERCISES ---
	switch (true) {
		case shouldStartGame(message, client):
			startGame(message);
			break;
		case text.includes(process.env.CLIENT_ID) && text.includes("stop"):
			endGame(message, true);
			break;
		case gameIsRunning():
			gameListener(message);
			break;
	}

	// Filters Explicit Words
	explicitWordFilter(message);

	// Manual unmute
	if (text.includes("unmute <@!") || text.includes("unmute @")) {
		try {
			userId = text.split(" ")[1];
			userId = userId.match(/\d/g).join("");
			manualUnMute(message, userId, client);
		} catch (e) {
			console.log(e);
		}
	}

	// Ensure long conversations in English aren't being had in Korean Channel
	channel = message.channel;
	if (isKoreanChannel(channel) || isTestChannel(channel)) {
		koreanObserver(message, counter, client);
	}

	// Ensure long conversations aren't being had in Resource Channel
	if (isLinksChannel(channel)) {
		resourcesObserver(message, counter, client);
	}
});
/* --------------------------------------------------- */

/* ________________ MANAGE PINNED MESSAGES ________________ */
client.on("channelPinsUpdate", (channel) => {
	channel.messages
		.fetchPinned()
		.then((messages) => {
			// Discord only allows 50 pinned messages at once
			if (messages.size === 50) unPin50thMsg(channel);
		})
		.catch(console.error);
});
/* ------------------------------------------------- */

/* _____________ SENDS MESSAGE TO NEW MEMBERS ADDED TO THE 선배 ROLE _____________*/
client.on("guildMemberUpdate", (oldMember, newMember) => {
	oldRole = [...oldMember.roles.cache][0][1];
	newRole = [...newMember.roles.cache][0][1];
	if (oldRole.id === newRole.id) return;
	console.log(`${newMember.user.username}\n  Old Role:\n     ${oldRole.name} \n  New Role:\n     ${newRole.name}`);
	if (newRole.id === process.env.MODERATORS) {
		client.channels.fetch(process.env.LINKS_CHANNEL).then((resources) => {
			client.channels.fetch(process.env.MOD_CHANNEL).then((seniorChannel) => {
				newMember.user.send(`Hey! \nChris just added you to the 선배 (Senior Classmates) role. Thanks for helping people out in the study group! :smiley: \n\nYou'll notice that you now have access to the ${seniorChannel}. It's a way for us to communicate with each other and make sure the group is running smoothly.\nYou now have the ability to pin messages in the ${resources} channel. :pushpin: \n\nThere are also a few other things you can do now as well. You can head over to the ${seniorChannel} and check out the pinned messages!`);
			});
		});
	}
});
/* ------------------------------------------------- */

/* ________________ FINALLY LOG IN TO DISCORD ________________ */

client.login(process.env.ACCESS_TOKEN);
/* ---------------------------------------------------- */
