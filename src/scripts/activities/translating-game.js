const { weeklyVocab, vocabWords } = require("./dictionary");

const IDENTIFIER = "translatingGame";

function setUp() {
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
}

function startGame(message) {
	try {
		const wordList = getWordList();
		const hangulWord = getWordFromList(wordList);
		const definition = wordList[hangulWord];
		global.gameVariables.answer = hangulWord;

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

function getWordList() {
	const chanceOfGettingOldWord = 0.25;
	if (Math.random() < chanceOfGettingOldWord) {
		return vocabWords;
	}
	return weeklyVocab;
}

function getWordFromList(wordList) {
	const max = Object.keys(wordList).length;
	const seed = Math.floor(Math.random() * Math.floor(max));
	return Object.keys(wordList)[seed];
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
	correctAnswer = global.gameVariables.answer;
	content = message.content;

	// Make an "is this korean" function in a utility file probably
	koreanRegEx = /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g;
	if (!koreanRegEx.test(content)) {
		message.channel.send("Some sort of 'That's not Korean at all' message");
		return;
	}

	searchVocabList = weeklyVocab[content] || vocabWords[content];
	if (searchVocabList) {
		message.channel.send("Some sort of 'Not quite! " + content + " means '*" + searchVocabList + "*'' message");
		return;
	}

	formattedAnswer = '';
	anyMatches = false;
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
		message.channel.send("Some sort of 'Close! It's " + formattedAnswer + "' message");
		return;
	}
	if (vocabWords[correctAnswer]) {
		message.channel.send("Some sort of 'This was a review word, check the past vocab words' message with a link");
		return;
	}
	message.channel.send("Some sort of 'Check the weekly vocab' message with a link");
}

module.exports = { setUp, startGame, handleResponse, IDENTIFIER };
