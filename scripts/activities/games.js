const { weeklyVocab, vocabWords } = require("./dictionary");
const { isExercisesChannel, isTestChannel } = require("./../utilities");

/* ____________ Main Typing Game Function ____________ */

function typingGame(message, client) {
	if (!isExercisesChannel(message.channel) && !isTestChannel(message.channel)) {
		sendWrongChannelMessage(client, channel);
		return;
	}

	try {
		// Creates Global Typing Game object
		global.typingGame = global.typingGame || {};

		// Checks if waiting to receive input from users
		if (typeof global.typingGame.listenerFlag === "undefined" || global.typingGame.listenerFlag) {
			endTypingGame(message);
		}

		// Sets flag showing game is in play to true
		global.typingFlag = true;

		/* Immediately sets listener flag to true at the start of each round */
		global.typingGame.listenerFlag = true;
		
		wordList = getWordList();
		key = getWordFromList(wordList);
		definition = wordList[key];

		if (!global.tgFirstRoundStarted) {
			setTimeout(() => message.channel.send(`So you're professor fasty fast. :smirk:\nWell let's see you type this word in Korean then!`), 1000);
			setTimeout(
				() =>
					message.channel.send("I'll give you the first word in **5**").then((msg) => {
						setTimeout(() => msg.edit("I'll give you the first word in **4**"), 1000);
						setTimeout(() => msg.edit("I'll give you the first word in **3**"), 2000);
						setTimeout(() => msg.edit("I'll give you the first word in **2**"), 3000);
						setTimeout(() => msg.edit("I'll give you the first word in **1**"), 4000);
						setTimeout(() => msg.edit("Quick, type the **Korean** word below!"), 5000);
					}),
				2000
			);

			// Send Korean vocab word to chat
			global.typingGameTimeout = setTimeout(() => {
				message.channel.send(`**${key}** - (${definition})`);
				// 500 ms to approximately account for slight latency
				global.typingGame.startTime = Date.now() + 500;
			}, 7200);
		} else {
			message.channel.send(`**${key}** - (${definition})`);
			global.typingGame.startTime = Date.now() + 500;
		}

		// Sets flag showing first round started to true
		global.tgFirstRoundStarted = true;
		global.typingGameKey = key;
	} catch (error) {
		console.log(error);
		return;
	}
}
/* ------------------------------------------- */

function sendWrongChannelMessage(client, message) {
	client.channels.fetch(process.env.EXERCISES_CHANNEL).then((exerciseChannel) => {
		message.reply(`Psst...I think you meant to send this in the ${exerciseChannel} channel.\nBut don't worry, no one noticed!`);
	});
}

function getWordList() {
	chanceOfGettingOldWord = 0.25;
	if (Math.random() < chanceOfGettingOldWord) {
		return vocabWords;
	}
	return weeklyVocab;
}

function getWordFromList(wordList) {
	max = Object.keys(wordList).length;
	seed = Math.floor(Math.random() * Math.floor(max));
	return Object.keys(wordList)[seed];
}

/* _________________ Listens for messages from participants ___________________ */

function typingGameListener(message, client) {
	try {
		if (message.content === global.typingGameKey) {
			/* Sets listener flag to false when user gives the correct answer */
			global.typingGame.listenerFlag = false;
			global.typingGameKey = undefined;

			// Creates round counter and increases count
			global.typingGame.roundCount = global.typingGame.roundCount + 1 || 1;

			author = message.author;

			//Creates list of winners
			global.typingGame.winners = global.typingGame.winners || {};

			// Keeps track of how many times a user has won in the round
			global.typingGame.winners[author] = global.typingGame.winners[author] + 1 || 1;

			// Calculates time elapsed
			global.typingGame.endTime = Date.now();
			global.typingGame.elapsed = global.typingGame.endTime - global.typingGame.startTime;
			inSeconds = (global.typingGame.elapsed / 1000).toFixed(2);
			global.typingGame.fullTime = global.typingGame.fullTime || 0;
			unroundedNum = parseFloat(global.typingGame.fullTime) + parseFloat(inSeconds);
			global.typingGame.fullTime = unroundedNum.toFixed(2);

			message.channel.send(`Manomanoman, you sure are good at this!\n**${author} won round ${global.typingGame.roundCount}!**\nI wasn't really counting or anything, but it took you **${inSeconds} seconds**.`);

			if (global.typingGame.roundCount < 5) {
				setTimeout(
					() =>
						message.channel.send(`Round ${global.typingGame.roundCount + 1} starts in **5**`).then((msg) => {
							setTimeout(() => msg.edit(`Round ${global.typingGame.roundCount + 1} starts in **4**`), 1000);
							setTimeout(() => msg.edit(`Round ${global.typingGame.roundCount + 1} starts in **3**`), 2000);
							setTimeout(() => msg.edit(`Round ${global.typingGame.roundCount + 1} starts in **2**`), 3000);
							setTimeout(() => msg.edit(`Round ${global.typingGame.roundCount + 1} starts in **1**`), 4000);
							setTimeout(() => msg.edit("Quick, type the Korean word below!"), 5000);
							setTimeout(() => typingGame(message, client), 5000);
						}),
					1000
				);
			} else {
				winners = global.typingGame.winners;
				fullTime = global.typingGame.fullTime;
				setTimeout(() => message.channel.send("I'm going to have to bring my A-game next time."), 1000);
				setTimeout(() => message.channel.send(`__Here are this exercise's **results**__:`), 1250);
				setTimeout(() => message.channel.send(`You got through the entire thing in a total of **${fullTime}** seconds.`), 1500);
				Object.keys(winners).forEach((winner) => {
					setTimeout(() => message.channel.send(`${winner}: ${winners[winner]} wins`), 1600);
				});
				// Ends game
				global.typingGame.listenerFlag = false;
				global.typingFlag = false;
				endTypingGame(message, false);
			}
		}
	} catch (error) {
		console.log(error);
		return;
	}
}
/* -------------------------------------------------- */

/* ____________________ Ends Typing Game __________________ */

function endTypingGame(message, wroteStopFlag) {
	if (wroteStopFlag) {
		if (global.typingFlag) {
			message.channel.send('Fine, just don\'t ask me to call you "professor fasty fast" anymore.');
		} else {
			message.channel.send("We weren't doing any exercises, silly.");
		}
	} else if (global.typingFlag) {
		message.channel.send('Okay, let\'s restart the exercise then, "professor fasty fast".');
	}
	clearTimeout(global.typingGameTimeout);
	global.typingGame = {};
	// Sets flag showing game is in play to false
	global.typingFlag = false;
	global.tgFirstRoundStarted = false;
}
/* -------------------------------------------------- */

/* ___________________ Sends Game Explanation Message _________________ */
function gameExplanation(message) {
	// Sends typing game explanation
	if (isExercisesChannel(message.channel) || isTestChannel(message.channel)) {
		clearTimeout(global.noResponseTimeout);

		//Ignores messages from the bot unless it's a message signaling end of game
		if (message.author.bot && !text.includes("wins")) {
			clearTimeout(global.explanationTimeout);
			// Ignores typing game explanation message
			// But sends explanation when game timeout runs out
			if (!text.includes("!t")) {
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
		}, 10000);
	}
	function sendResponse(message) {
		message.channel.send("...uhh,\n\nAhem... If you would like to start the typing exercise, you can type:\n\n<@!784522323755663411> `typing`\n- ***OR*** -\n`!t`\n\nIf you would like to start the translating exercise, you can type:\n\n<@!784522323755663411> `translating`\n- ***OR*** -\n`!tr`");
	}
}
/* ------------------------------------------------- */

/* ____________ Main Translating Game Function ____________ */

function translatingGame(message, client) {
	if (!isExercisesChannel(message.channel) && !isTestChannel(message.channel)) {
		sendWrongChannelMessage(client, channel);
		return;
	}

	try {
		// Creates Global Translating Game object
		global.translatingGame = global.translatingGame || {};

		// Checks if waiting to receive input from users
		if (typeof global.translatingGame.listenerFlag === "undefined" || !global.translatingGame.listenerFlag) {
			endTypingGame(message, false);
		}

		// Sets flag showing game is in play to true
		global.translatingFlag = true;

		wordList = getWordList();
		hangulWord = getWordFromList(wordList);
		definition = wordList[hangulWord];

		if (!global.translatingGameFirstRoundStarted) {
			setTimeout(() => message.channel.send(`So you're professor fasty fast. :smirk:\nWell let's see you type this in Korean then!`), 1000);
			setTimeout(
				() =>
					message.channel.send("I'll give you the first challenge in **5**").then((msg) => {
						setTimeout(() => msg.edit("I'll give you the first challenge in **4**"), 1000);
						setTimeout(() => msg.edit("I'll give you the first challenge in **3**"), 2000);
						setTimeout(() => msg.edit("I'll give you the first challenge in **2**"), 3000);
						setTimeout(() => msg.edit("I'll give you the first challenge in **1**"), 4000);
						setTimeout(() => msg.edit("Quick, translate this into **Korean** below!"), 5000);
					}),
				2000
			);

			// Send Korean vocab word to chat
			global.translatingGameTimeout = setTimeout(() => {
				message.channel.send(`${definition}`);
				// 500 ms to approximately account for slight latency
				global.translatingGame.startTime = Date.now() + 500;
			}, 7200);
		} else {
			message.channel.send(`${definition}`);
			global.translatingGame.startTime = Date.now() + 500;
		}

		// Sets flag showing first round started to true
		global.translatingGameFirstRoundStarted = true;
		global.translatingGameAnswer = hangulWord;
	} catch (error) {
		console.log(error);
		return;
	}
}
/* ------------------------------------------- */

function translatingGameListener(message, client) {
	global.translatingGame.listenerFlag = true;
	try {
		if (message.content === global.translatingGameAnswer) {
			global.translatingGameAnswer = undefined;

			// Creates round counter and increases count
			global.translatingGame.roundCount = global.translatingGame.roundCount + 1 || 1;

			author = message.author;

			//Creates list of winners
			global.translatingGame.winners = global.translatingGame.winners || {};

			// Keeps track of how many times a user has won in the round
			global.translatingGame.winners[author] = global.translatingGame.winners[author] + 1 || 1;

			// Calculates time elapsed
			global.translatingGame.endTime = Date.now();
			global.translatingGame.elapsed = global.translatingGame.endTime - global.translatingGame.startTime;
			inSeconds = (global.translatingGame.elapsed / 1000).toFixed(2);
			global.translatingGame.fullTime = global.translatingGame.fullTime || 0;
			unroundedNum = parseFloat(global.translatingGame.fullTime) + parseFloat(inSeconds);
			global.translatingGame.fullTime = unroundedNum.toFixed(2);

			message.channel.send(`Manomanoman, you sure are good at this!\n**${author} won round ${global.translatingGame.roundCount}!**\nI wasn't really counting or anything, but it took you **${inSeconds} seconds**.`);

			if (global.translatingGame.roundCount < 5) {
				setTimeout(
					() =>
						message.channel.send(`Round ${global.translatingGame.roundCount + 1} starts in **5**`).then((msg) => {
							setTimeout(() => msg.edit(`Round ${global.translatingGame.roundCount + 1} starts in **4**`), 1000);
							setTimeout(() => msg.edit(`Round ${global.translatingGame.roundCount + 1} starts in **3**`), 2000);
							setTimeout(() => msg.edit(`Round ${global.translatingGame.roundCount + 1} starts in **2**`), 3000);
							setTimeout(() => msg.edit(`Round ${global.translatingGame.roundCount + 1} starts in **1**`), 4000);
							setTimeout(() => msg.edit("Quick, translate this into Korean below!"), 5000);
							setTimeout(() => translatingGame(message, client), 5000);
						}),
					1000
				);
			} else {
				winners = global.translatingGame.winners;
				fullTime = global.translatingGame.fullTime;
				setTimeout(() => message.channel.send("I'm going to have to bring my A-game next time."), 1000);
				setTimeout(() => message.channel.send(`__Here are this exercise's **results**__:`), 1250);
				setTimeout(() => message.channel.send(`You got through the entire thing in a total of **${fullTime}** seconds.`), 1500);
				Object.keys(winners).forEach((winner) => {
					setTimeout(() => message.channel.send(`${winner}: ${winners[winner]} wins`), 1600);
				});
				// Ends game
				global.translatingGame.listenerFlag = false;
				global.translatingFlag = false;
				endTypingGame(message, false);
			}
		}
	} catch (error) {
		console.log(error);
		return;
	}
}
/* -------------------------------------------------- */

/* ____________________ Ends Translating Game __________________ */

function endTranslatingGame(message, wroteStopFlag) {
	if (wroteStopFlag) {
		if (global.translatingFlag) {
			message.channel.send('Fine, just don\'t ask me to call you "professor fasty fast" anymore.');
		} else {
			message.channel.send("We weren't doing any exercises, silly.");
		}
	} else if (global.translatingFlag) {
		message.channel.send('Okay, let\'s restart the exercise then, "professor fasty fast".');
	}
	clearTimeout(global.translatingGameTimeout);
	global.translatingGame = {};
	// Sets flag showing game is in play to false
	global.translatingFlag = false;
	global.translatingGameFirstRoundStarted = false;
}
/* -------------------------------------------------- */

module.exports = { typingGame, typingGameListener, endTypingGame, translatingGame, translatingGameListener, endTranslatingGame, gameExplanation };
