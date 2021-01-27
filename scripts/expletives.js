const Tesseract = require("tesseract.js");
const { logMessageDate } = require("./utilities");

// List of Expletives
const expletives = {
	fuck: "phlewflaff",
	pussy: "phloomance",
	pussie: "phloomancers",
	dick: "phloopdie",
	bitch: "phliminal",
	nigger: "phloshious",
	titties: "phlophinums",
	titty: "phlophinum",
	shit: "phloopy",
	fuk: "phlewflaff",
	cunt: "phlomingous",
	choad: "phlomoninom",
	twat: "phlololonum",
	wank: "phlonominium",
	bich: "plinimal",
	cock: "phloopdie",
	slut: "phliminustrim",
};
const strictExpletives = {
	hoe: "phloshdradomous",
	chink: "phlomingoromous",
	fk: "phlwflff",
	시발: "힝나삐짐",
};

// Expletive Filter
async function explicitWordFilter(message) {
	if (await checkImage(message)) {
		message.delete();
		message.reply(`\nHey! \nI said no bad words, even in images! If you don't want to play nice, I'm taking my ball and going home!`);
		return;
	}
	if (check(message)) {
		logMessageDate();
		message.delete();
		message.channel.send(`${message.author} wrote: "${global.newMessage}"`);
		console.log(`Edited ${message.content} to ${global.newMessage}`);
		message.reply("\nHey! \nI said no bad words! If you don't want to play nice, I'm taking my ball and going home!");
	}
}

async function checkImage(message) {
	if (message.attachments.size === 0) {
		return false;
	}
	let attachment = message.attachments.first();
	if (attachment.url.indexOf(".png") === -1 && attachment.url.indexOf(".jpeg") === -1) {
		return false;
	}
	return Tesseract.recognize(
		attachment.url,
		'eng'
	).then(({ data: { text } }) => {
		return check({
			content: text.toLowerCase()
		})
	});
}

/* Checks if message has expletives */
function check(message) {
	global.contentArray = message.content.split(/([^\w])/);
	// Filters out null indexes of array.
	noNulls = global.contentArray.filter(Boolean);

	foundExpletive = false;
	noNulls.forEach((word, index) => {
		/* Filters out any string that includes expletive */
		Object.keys(expletives).forEach((key, v) => {
			if (word.includes(key)) {
				foundExpletive = true;
				noNulls[index] = expletives[key];
			}
		});
		/* Only filters out exact matches for strictExpletives */
		Object.keys(strictExpletives).forEach((key, v) => {
			if (word === key) {
				foundExpletive = true;
				noNulls[index] = strictExpletives[key];
			}
		});
	});
	global.newMessage = noNulls.join("");
	return foundExpletive;
}

/* ----------------- TO DO ----------------- */
/* Make Korean Filter */
// function checkKorean() {
// 	global.contentArray = message.content.split(/([^\w])/);
// 	// Filters out null indexes of array.
// 	noNulls = global.contentArray.filter(Boolean);

// 	console.log(`CONTENT ARRAY: ${noNulls}`);
// 	foundExpletive = false;
// 	noNulls.forEach((word, index) => {
// 		Object.keys(expletives).forEach((key, v) => {
// 			if (word.includes(key)) {
// 				foundExpletive = true;
// 				noNulls[index] = expletives[key];
// 			}
// 		});
// 		Object.keys(strictExpletives).forEach((key, v) => {
// 			if (word === key) {
// 				foundExpletive = true;
// 				noNulls[index] = strictExpletives[key];
// 			}
// 		});
// 	});
// 	global.newMessage = noNulls.join("");
// 	return foundExpletive;
// }
/* ------------------------------------------------ */

module.exports = { explicitWordFilter };
