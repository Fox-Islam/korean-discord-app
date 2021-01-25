class Discord {

}

class Channel {
    constructor(id) {
        this.id = id;
        this.messages = [];
    }

    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }

    send(messageContent) {
        var message = new Message(this, 'Author', messageContent);
        this.messages.push(message);
        return new Promise(function (callback) {
            return callback(message);
        });
    }
}

class Message {
    constructor(channel, author, content) {
        this.channel = channel;
        this.content = content;
        this.author = author;
    }

    edit(content) {
        this.content = content;
        return new Promise(function (callback) {
            return callback(this);
        });
        // return this;
    }
}

module.exports = { Discord, Channel, Message };
