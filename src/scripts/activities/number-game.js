const { getNumberWrittenKorean, getNumberWrittenChinese } = require('./../../utils/numbers');

const gameName = "numberGame";
const commands = {
    long: "number",
    short: "!n"
};
const numberOfRounds = 5;
const sinoKoreanSystemName = 'sino';
const nativeKoreanSystemName = 'native';

let gameInProgress = false;
let roundCount = 0;
let gameTimeout = null;
let startTime = null;
let endTime = null;
let elapsed = null;
let fullTime = null;
let answers = [];
let winners = {};
let min = 1;
let max = 10;
let system = nativeKoreanSystemName;

async function setUp(messageContent) {
    resetGameVariables();
    parseOptions(messageContent);
    getAnswers();
}

function resetGameVariables() {
    gameInProgress = false;
    roundCount = 0;
    gameTimeout = null;
    startTime = null;
    endTime = null;
    elapsed = null;
    fullTime = null;
    winners = {};
    answers = [];
    min = 1;
    max = 10;
    system = 'native';
}

function getAnswers() {
    while (answers.length < numberOfRounds) {
        answers.push(getNumber());
    }
}

function getNumber() {
    return min + Math.floor(Math.random() * (max + 1 - min));
}

function parseOptions(messageContent) {
    setSystem(messageContent);
    setRange(messageContent);
}

function setRange(messageContent) {
    const rangeRegex = /(?<min>\d+)\-(?<max>\d+)/;
    const range = rangeRegex.exec(messageContent)?.groups ?? {};
    if (!range.min || !range.max) {
        return;
    }
    if (range.min >= range.max) {
        return;
    }
    if (range.min < 1) {
        return;
    }
    if (system === 'native' && range.max > 99) {
        max = 99;
        return;
    }
    if (system === sinoKoreanSystemName && range.max > 9999999999999999999) {
        max = 9999999999999999999;
        return;
    }
    min = Number(range.min);
    max = Number(range.max);
}

function setSystem(messageContent) {
    if (messageContent.includes('sk') || messageContent.includes('sino')) {
        system = sinoKoreanSystemName;
    }
}

async function startGame(message) {
    try {
        gameInProgress = true;
        sendChallenge(message);
    } catch (error) {
        console.log(error);
        return;
    }
}

function sendChallenge(message) {
    const number = answers[roundCount];

    if (system === sinoKoreanSystemName) {
        console.log(getNumberWrittenChinese(answers[roundCount]));
    } else {
        console.log(getNumberWrittenKorean(answers[roundCount]));
    }
    const systemName = getSystemName();
    message.channel.send(`**${number}** (${systemName})`).then(() => {
        startTime = Date.now();
    });
}

function getSystemName() {
    if (system === sinoKoreanSystemName) {
        return 'Sino Korean';
    }
    return 'Native Korean';
}

function handleMessageDuringGame(message) {
    try {
        if (isCorrectAnswer(message.content)) {
            roundCount = roundCount + 1;

            // Keeps track of how many times a user has won in the round
            const author = message.author;
            winners[author] = winners[author] + 1 || 1;

            // Calculates time elapsed
            endTime = Date.now();
            elapsed = endTime - startTime;
            const inSeconds = (elapsed / 1000).toFixed(2);
            fullTime = fullTime || 0;
            const unroundedNum = parseFloat(fullTime) + parseFloat(inSeconds);
            fullTime = unroundedNum.toFixed(2);

            message.channel.send(`Manomanoman, you sure are good at this!\n**${author} won round ${roundCount}!**\nI wasn't really counting or anything, but it took you **${inSeconds} seconds**.`);

            if (roundCount < numberOfRounds) {
                startGame(message);
            } else {
                setTimeout(() => message.channel.send("I'm going to have to bring my A-game next time."), 1000);
                setTimeout(() => message.channel.send(`__Here are this exercise's **results**__:`), 1250);
                setTimeout(() => message.channel.send(`You got through the entire thing in a total of **${fullTime}** seconds.`), 1500);
                Object.keys(winners).forEach((winner) => {
                    setTimeout(() => message.channel.send(`${winner}: ${winners[winner]} wins`), 1600);
                });

                // Clear the current game variable to trigger the endGame function
                gameInProgress = false;
            }
        }
    } catch (error) {
        console.log(error);
        return;
    }
}

function isCorrectAnswer(messageContent) {
    if (system === sinoKoreanSystemName) {
        return messageContent === getNumberWrittenChinese(answers[roundCount]);
    }
    return messageContent === getNumberWrittenKorean(answers[roundCount]);
}

function endGame() {
    resetGameVariables();
    clearTimeout(gameTimeout);
}

function gameIsInProgress() {
    return gameInProgress;
}

module.exports = { gameName, commands, setUp, startGame, handleMessageDuringGame, endGame, gameIsInProgress };
