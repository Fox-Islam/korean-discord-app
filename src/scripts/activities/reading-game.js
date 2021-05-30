const GoogleSheets = require("../../connections/google-sheets-conn");
const speechSdk = require("microsoft-cognitiveservices-speech-sdk");

const speechConfig = speechSdk.SpeechConfig.fromSubscription(process.env.AZURE_SUBSCRIPTION_ID, process.env.AZURE_REGION);
speechConfig.speechRecognitionLanguage = "ko-KR";
let connection = null;
let messageMember = null;
let messageChannel = null;
let gameMessage = null;
let audio = null;
let recogniser = null;

const IDENTIFIER = "readingGame";
let weeklyVocab = {};
let vocabWords = {};

let roundCount = 0;
let skipTimeout = null;
let timeoutSkips = 0;
let attempts = 0;
let answers = [];
let wins = 0;

async function setUp() {
	global.currentGame = IDENTIFIER;
	vocabWords = await GoogleSheets.fetchVocab("Old Vocab!A2:B");
	weeklyVocab = await GoogleSheets.fetchVocab("Weekly Vocab!A2:B");
	resetGameVariables();
	answers = getAnswers();
}

function resetGameVariables() {
	roundCount = 0;
	skipTimeout = null;
	timeoutSkips = 0;
	attempts = 0;
	answers = [];
	wins = 0;
}

function getAnswers() {
	const numberOfRounds = 5;
	let answers = [];
	while (answers.length < numberOfRounds) {
		answers.push(getOneVocabWord());
	}
	return answers;
}

function getOneVocabWord() {
	let vocabWord = null;
	const oldOrNewVocab = Math.floor(Math.random() * 4);
	const vocabList = oldOrNewVocab < 1 ? vocabWords : weeklyVocab;
	do {
		const seed = Math.floor(Math.random() * vocabList.length);
		vocabWord = vocabList[seed];
	} while (vocabWordAlreadyUsed(vocabWord))

	return vocabWord;
}

function vocabWordAlreadyUsed(vocabWord) {
	answers.some((answerObject) => {
		return answerObject.word === vocabWord.word;
	});
}

async function startGame(message) {
	try {
		if (!message.member.voice.channel || message.member.voice.channel.id !== process.env.VOICE_EXERCISE_CHANNEL) {
			return;
		}
		messageChannel = message.channel;
		messageMember = message.member;
		connection = await messageMember.voice.channel.join();
		setUpRecognition();

		messageChannel.send(null, {
			embed: {
				title: `Say this word in Korean!`
			}
		}).then((message) => {
			gameMessage = message;
			sendChallenge()
		});
	} catch (error) {
		console.log(error);
		return;
	}
}

function setUpRecognition() {
	audio = connection.receiver.createStream(messageMember, { mode: 'pcm', end: 'silence' });
	recogniser = createRecogniser();
	createRecognitionListeners();
	startRecognition();
}

function createRecogniser() {
	let pushStream = speechSdk.AudioInputStream.createPushStream(speechSdk.AudioStreamFormat.getWaveFormatPCM(48000, 16, 2));

	audio.on('data', function (arrayBuffer) {
		pushStream.write(arrayBuffer.slice());
	}).on('end', function () {
		pushStream.close();
	});

	let audioConfig = speechSdk.AudioConfig.fromStreamInput(pushStream);
	return new speechSdk.SpeechRecognizer(speechConfig, audioConfig);
}

function createRecognitionListeners() {
	if (!recogniser) {
		// throw error
	}

	recogniser.recognized = (s, e) => {
		if (e.result.text) {
			handleSpeech(e.result.text);
		}
	};

	recogniser.canceled = (s, e) => {
		if (e.reason !== 1) {
			console.log(`CANCELED: Reason=${e.reason}`);
			stopRecognition();
		}
	};
}

function startRecognition() {
	if (!recogniser) {
		// throw error
	}
	recogniser.startContinuousRecognitionAsync();
}

function stopRecognition() {
	if (!recogniser) {
		// throw error
	}
	recogniser.stopContinuousRecognitionAsync();
}

function sendChallenge() {
	const { word, definition } = answers[roundCount];

	gameMessage.edit(gameMessage.content, {
		description: `**${word}** - (${definition})`,
	})

	messageChannel.send(`**${word}** - (${definition})`).then(() => {
		skipTimeout = setTimeout(skipRoundForTimeout, 15000);
	});
}

function skipRoundForTimeout() {
	roundCount = roundCount + 1;
	timeoutSkips = timeoutSkips + 1;
	if (timeoutSkips > 2 || roundCount > 5) {
		messageChannel.send("Let's try again some other time");
		endGame();
		return;
	}
	messageChannel.send("Let's try a different one");
	sendChallenge();
}

function handleSpeech(speechToTextOutput) {
	try {
		clearTimeout(skipTimeout);
		skipTimeout = setTimeout(skipRoundForTimeout, 15000);
		messageChannel.send(`I think I heard you say ${speechToTextOutput}`);

		if (!answerIsCorrect(speechToTextOutput)) {
			setUpRecognition();
			attempts = attempts + 1;
			if (attempts > 3) {
				skipRoundForAttempts();
			}
			return;
		}

		roundCount = roundCount + 1;
		wins = wins + 1 || 1;

		messageChannel.send(`Manomanoman, you sure are good at this!`);

		if (roundCount < 5) {
			setUpRecognition();
			messageChannel.send(`Round ${roundCount + 1}! Say this word in Korean!`).then(sendChallenge);
			return
		}

		// Clear the current game variable to trigger the endGame function
		global.currentGame = null;
	} catch (error) {
		console.log(error);
		return;
	}
}

function answerIsCorrect(providedAnswer) {
	if (!answers[roundCount]) {
		return false;
	}
	return providedAnswer && providedAnswer.includes(answers[roundCount].word);
}

function skipRoundForAttempts() {
	roundCount = roundCount + 1;
	if (roundCount > 5) {
		endGame();
		return;
	}
	messageChannel.send("Let's try a different one");
	sendChallenge();
}

function endGame() {
	messageChannel.send(`I was able to recognise what you said **${wins}** out of ${roundCount} times!`);

	global.currentGame = null;
	clearTimeout(skipTimeout);
	resetGameVariables();
	if (recogniser) {
		recogniser.stopContinuousRecognitionAsync();
	}
	if (connection) {
		connection.disconnect();
	}
}

function handleResponse() {
	//
}

module.exports = { setUp, startGame, handleResponse, endGame, IDENTIFIER };
