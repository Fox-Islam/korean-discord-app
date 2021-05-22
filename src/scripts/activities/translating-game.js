const GoogleSheets = require("../../connections/google-sheets-conn");

const IDENTIFIER = "translatingGame";
let weeklyVocab = {};
let vocabWords = {};

async function setUp() {
	global.currentGame = IDENTIFIER;
	global.gameVariables = {
		roundCount: 0,
		gameTimeout: null,
		startTime: null,
		endTime: null,
		elapsed: null,
		fullTime: null,
		answer: null,
		winners: {}
	}
	vocabWords = await GoogleSheets.fetchVocab("Old Vocab!A2:B");
	weeklyVocab = await GoogleSheets.fetchVocab("Weekly Vocab!A2:B");
}

async function startGame(message) {
	try {
		const { word, definition } = getVocab(message);
		global.gameVariables.answer = word;

		if (global.gameVariables.roundCount === 0) {
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
			global.gameVariables.gameTimeout = setTimeout(() => {
				sendChallenge(message, definition);
			}, 7200);
		} else {
			sendChallenge(message, definition);
		}
	} catch (error) {
		console.log(error);
		return;
	}
}
/* ------------------------------------------- */

function getVocab(message) {
	// Pulls random word from vocabWords
	const oldOrNewVocab = Math.floor(Math.random() * 4); //Determines whether user gets old or new vocab
	const vocabList = oldOrNewVocab < 1 ? vocabWords : weeklyVocab;
	if (!vocabList) {
		message.channel.send("I couldn't get the vocab for some reason. Ugh, my makers are useless.\nMaybe we should try again?")
		endTypingGame(message, false, true);
		return;
	}
	const seed = Math.floor(Math.random() * vocabList.length);
	return vocabList[seed];
}

function sendChallenge(message, definition) {
	message.channel.send(`${definition}`);
	// 500 ms to approximately account for slight latency
	global.gameVariables.startTime = Date.now() + 500;
}

function handleResponse(message) {
	try {
		if (message.content !== global.gameVariables.answer) {
			handleIncorrectness(message);
			return;
		}
		if (message.content === global.gameVariables.answer) {
			global.gameVariables.roundCount = global.gameVariables.roundCount + 1;

			// Keeps track of how many times a user has won in the round
			const author = message.author;
			global.gameVariables.winners[author] = global.gameVariables.winners[author] + 1 || 1;

			// Calculates time elapsed
			global.gameVariables.endTime = Date.now();
			global.gameVariables.elapsed = global.gameVariables.endTime - global.gameVariables.startTime;
			const inSeconds = (global.gameVariables.elapsed / 1000).toFixed(2);
			global.gameVariables.fullTime = global.gameVariables.fullTime || 0;
			const unroundedNum = parseFloat(global.gameVariables.fullTime) + parseFloat(inSeconds);
			global.gameVariables.fullTime = unroundedNum.toFixed(2);

			message.channel.send(`Manomanoman, you sure are good at this!\n**${author} won round ${global.gameVariables.roundCount}!**\nI wasn't really counting or anything, but it took you **${inSeconds} seconds**.`);

			if (global.gameVariables.roundCount < 5) {
				setTimeout(
					() =>
						message.channel.send(`Round ${global.gameVariables.roundCount + 1} starts in **5**`).then((msg) => {
							setTimeout(() => msg.edit(`Round ${global.gameVariables.roundCount + 1} starts in **4**`), 1000);
							setTimeout(() => msg.edit(`Round ${global.gameVariables.roundCount + 1} starts in **3**`), 2000);
							setTimeout(() => msg.edit(`Round ${global.gameVariables.roundCount + 1} starts in **2**`), 3000);
							setTimeout(() => msg.edit(`Round ${global.gameVariables.roundCount + 1} starts in **1**`), 4000);
							setTimeout(() => msg.edit("Quick, translate this into Korean below!"), 5000);
							setTimeout(() => startGame(message), 5000);
						}),
					1000
				);
			} else {
				const winners = global.gameVariables.winners;
				const fullTime = global.gameVariables.fullTime;
				setTimeout(() => message.channel.send("I'm going to have to bring my A-game next time."), 1000);
				setTimeout(() => message.channel.send(`__Here are this exercise's **results**__:`), 1250);
				setTimeout(() => message.channel.send(`You got through the entire thing in a total of **${fullTime}** seconds.`), 1500);
				Object.keys(winners).forEach((winner) => {
					setTimeout(() => message.channel.send(`${winner}: ${winners[winner]} wins`), 1600);
				});
				// Clear the current game variable to trigger the endGame function
				global.currentGame = null;
			}
		}
	} catch (error) {
		console.log(error);
		return;
	}
}

function handleIncorrectness(message) {
	const correctAnswer = global.gameVariables.answer;
	const content = message.content;

	// Make an "is this korean" function in a utility file probably
	const koreanRegEx = /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g;
	if (!koreanRegEx.test(content)) {
		message.reply("That's not Korean at all!");
		return;
	}

	const searchVocabList = weeklyVocab[content] || vocabWords[content];
	if (searchVocabList) {
		message.reply("Not quite! " + content + " means '*" + searchVocabList + "*'");
		return;
	}

	let formattedAnswer = '';
	let anyMatches = false;
	correctAnswer.split('').forEach((character) => {
		if (!content.includes(character)) {
			// Make anything that doesn't match bold
			formattedAnswer = formattedAnswer + '**' + character + '**';
			return;
		}

		formattedAnswer = formattedAnswer + character;
		anyMatches = true;
	});

	if (anyMatches) {
		// Remove any set of 4 consecutive asterisks since Discord parses '****' as italicised '**'
		formattedAnswer = formattedAnswer.replace(/\*\*\*\*/g, "");
		message.reply("Close! It's " + formattedAnswer);
		return;
	}

	if (vocabWords[correctAnswer]) {
		message.reply("This was a review word, check the past vocab words!");
		return;
	}
	message.reply("Not quite! Check out the weekly vocab");
}

module.exports = { setUp, startGame, handleResponse, IDENTIFIER };
