var translatingGame = require('../../../src/scripts/activities/translating-game'),
    { weeklyVocab, vocabWords } = require("./../../../src/scripts/activities/dictionary"),
    { Channel } = require('../../test-utils/discord-dummy'),
    chai = require('chai'),
    COUNTDOWN_END_TIME = 8100,
    expect,
    channel;

expect = chai.expect;

describe('When playing the translating game', function () {
    this.timeout(10000);

    beforeEach(function () {
        channel = new Channel(process.env.EXERCISES_CHANNEL);
        channel.send("!tr");
        translatingGame.setUp();
    });

    it('should count down correctly at the start of a game', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("So you're professor fasty fast. :smirk:\nWell let's see you type this in Korean then!");
        }, 1100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("I'll give you the first challenge in **5**");
        }, 2100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("I'll give you the first challenge in **4**");
        }, 3100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("I'll give you the first challenge in **3**");
        }, 4100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("I'll give you the first challenge in **2**");
        }, 5100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("I'll give you the first challenge in **1**");
        }, 6100);
        setTimeout(() => {
            expect(channel.getLastMessage().content).to.eql("Quick, translate this into **Korean** below!");
            done();
        }, 7100);
    });

    it('should correctly display the challenge to the user', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        expect(global.gameVariables.answer).to.not.be.a('null');
        expect(global.gameVariables.answer).to.not.be.an('undefined');
        setTimeout(() => {
            definition = weeklyVocab[global.gameVariables.answer] || vocabWords[global.gameVariables.answer];
            expect(channel.getLastMessage().content).to.eql(definition);
            done();
        }, COUNTDOWN_END_TIME);
    });

    it('Should accept a correct answer', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            answer = global.gameVariables.answer;
            channel.send(answer);
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("Manomanoman, you sure are good at this!");
            expect(channel.getLastMessage().content).to
                .include("won round 1!");
            expect(channel.getLastMessage().content).to
                .include("I wasn't really counting or anything, but it took you");
            done();
        }, COUNTDOWN_END_TIME);
    });

    it('Should not accept an answer if it\'s not in Korean', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            channel.send("An answer which is in English");
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("That's not Korean at all");
            done();
        }, COUNTDOWN_END_TIME);
    });

    it.skip('Should not accept an answer if it\'s partially correct', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            answer = global.gameVariables.answer;
            channel.send("An answer which is partially correct");
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("That's not Korean at all");
            done();
        }, COUNTDOWN_END_TIME);
    });

    it.skip('Should not accept an answer if it\'s incorrect and means a different word', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            answer = global.gameVariables.answer;
            channel.send("An answer which is incorrect but a good attempt");
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("That's not Korean at all");
            done();
        }, COUNTDOWN_END_TIME);
    });

    it.skip('Should not accept an answer if it\'s incorrect and correct answer was in the weekly vocab', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            answer = global.gameVariables.answer;
            channel.send("An answer which is very incorrect");
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("That's not Korean at all");
            done();
        }, COUNTDOWN_END_TIME);
    });

    it.skip('Should not accept an answer if it\'s incorrect and correct answer was a review word', function (done) {
        var message = channel.getLastMessage();
        translatingGame.startGame(message);
        setTimeout(() => {
            answer = global.gameVariables.answer;
            channel.send("An answer which is incorrect");
            message = channel.getLastMessage();
            translatingGame.handleResponse(message);
            expect(channel.getLastMessage().content).to
                .include("That's not Korean at all");
            done();
        }, COUNTDOWN_END_TIME);
    });

    afterEach(function () {
        global.currentGame = null;
        clearTimeout(global.gameVariables.gameTimeout);
        global.gameVariables = {};
    });
});
