const { isExercisesChannel } = require("./../utilities");

const {
	setUp: setUpTypingGame,
	startGame: startTypingGame,
	handleResponse: handleResponseForTypingGame,
	IDENTIFIER: TYPING_GAME_IDENTIFIER
} = require("./typing-game");
const {
	setUp: setUpTranslatingGame,
	startGame: startTranslatingGame,
	handleResponse: handleResponseForTranslatingGame,
	IDENTIFIER: TRANSLATING_GAME_IDENTIFIER
} = require("./translating-game");

const GAMES = {
	[TYPING_GAME_IDENTIFIER]: {
		commands: {
			long: "typing",
			short: "!t",
			hangul: "!ㅌ"
		},
		setUp: setUpTypingGame,
		startGame: startTypingGame,
		handleResponse: handleResponseForTypingGame
	},
	[TRANSLATING_GAME_IDENTIFIER]: {
		commands: {
			long: "translating",
			short: "!tr"
		},
		setUp: setUpTranslatingGame,
		startGame: startTranslatingGame,
		handleResponse: handleResponseForTranslatingGame
	}
}

/* ___________________ Sends Game Explanation Message _________________ */
function gameExplanation(message) {
	// Sends typing game explanation
	if (isExercisesChannel(message.channel)) {
		clearTimeout(global.noResponseTimeout);

		//Ignores messages from the bot unless it's a message signaling end of game
		if (message.author.bot && !message.content.includes("wins")) {
			clearTimeout(global.explanationTimeout);
			// Ignores typing game explanation message
			// But sends explanation when game timeout runs out
			if (!message.content.includes("!t")) {
				global.noResponseTimeout = setTimeout(() => {
					sendResponse(message);
				}, 30000);
			}
			return;
		}
		//Clears timeout and starts new timeout for game explanation
		clearTimeout(global.explanationTimeout);
		global.explanationTimeout = setTimeout(() => {
			sendResponse(message);
		}, 25000);
	}
}
/* ------------------------------------------------- */

function sendResponse(message) {
	message.channel.send(
		"...uhh,\n\nAhem... If you would like to start the typing exercise, " +
		"you can type:\n\n<@!" + process.env.CLIENT_ID + "> `" + GAMES[TYPING_GAME_IDENTIFIER].commands.long +
		"`\n- ***OR*** -\n`" + GAMES[TYPING_GAME_IDENTIFIER].commands.short + "` or `" + GAMES[TYPING_GAME_IDENTIFIER].commands.hangul + "`" +
		"\n\nIf you would like to start the translating exercise, " +
		"you can type:\n\n<@!" + process.env.CLIENT_ID + "> `" + GAMES[TRANSLATING_GAME_IDENTIFIER].commands.long +
		"`\n- ***OR*** -\n`" + GAMES[TRANSLATING_GAME_IDENTIFIER].commands.short + "`"
	);
	if (gameIsRunning()) {
		global.currentGame = null;
		endGame(message);
	}
}

function shouldStartGame(message, client) {
	if (!isExercisesChannel(message.channel)) {
		sendWrongChannelMessage(client, message);
		return false;
	}
	for (let gameIdentifier in GAMES) {
		if (containsCommandForGame(message.content, gameIdentifier)) {
			return true;
		}
	}
	return false;
}

function sendWrongChannelMessage(client, message) {
	client.channels.fetch(process.env.EXERCISES_CHANNEL).then((exerciseChannel) => {
		message.reply(`Psst...I think you meant to send this in the ${exerciseChannel} channel.\nBut don't worry, no one noticed!`);
	});
}

function containsCommandForGame(messageContent, gameIdentifier) {
	if (messageContent.includes(process.env.CLIENT_ID) && messageContent.includes(GAMES[gameIdentifier].commands.long)) {
		return true;
	}
	if (messageContent.endsWith(GAMES[gameIdentifier].commands.short)) {
		return true;
	}
	return false;
}

function startGame(message) {
	if (gameIsRunning()) {
		endGame(message);
	}

	setUpCurrentGame(message.content).then(() => {
		GAMES[global.currentGame].startGame(message);
	});
}

function gameIsRunning() {
	return Boolean(global.currentGame);
}

function endGame(message, wroteStopFlag) {
	handleEndGameMessage(message, wroteStopFlag);
	clearTimeout(global.gameVariables.gameTimeout);
	global.currentGame = null;
	global.gameVariables = {};
}

function handleEndGameMessage(message, wroteStopFlag) {
	if (wroteStopFlag) {
		if (gameIsRunning()) {
			message.channel.send('Fine, just don\'t ask me to call you "professor fasty fast" anymore.');
			return;
		}
		message.channel.send("We weren't doing any exercises, silly.");
		return;
	}

	if (gameIsRunning()) {
		message.channel.send('Okay, let\'s restart the exercise then, "professor fasty fast".');
		return;
	}
}

async function setUpCurrentGame(messageContent) {
	setGame(messageContent);
	return await GAMES[global.currentGame].setUp();
}

function setGame(messageContent) {
	for (let gameIdentifier in GAMES) {
		if (containsCommandForGame(messageContent, gameIdentifier)) {
			global.currentGame = gameIdentifier;
			return;
		}
	}
}

function gameListener(message) {
	GAMES[global.currentGame].handleResponse(message);
	if (!gameIsRunning()) {
		// If the last round has finished for a game, the currentGame variable is nulled
		endGame(message, false);
	}
}

module.exports = { gameExplanation, shouldStartGame, startGame, endGame, gameIsRunning, gameListener };
