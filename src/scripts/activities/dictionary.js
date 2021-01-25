const fs = require('fs');
const { google } = require('googleapis');
const SPREADSHEET_ID = '1D91HvWatjUco237bmL9-_Ccgqm4xL60JVq9ViYu-zTE';
const WEEKLY_VOCAB_SHEET_NAME = 'Weekly Vocab';
const REVIEW_VOCAB_SHEET_NAME = 'Vocab Words';

const weeklyVocab = {
	여권: "Passport",
	비행기: "Airplane",
	공항: "Airport",
	지하철: "Subway / Metro",
	택시: "Taxi",
	지도: "Map",
	숙소: "Lodging",
	탑승: "Boarding",
	대기: "Stand-by / Wait",
	신분증: "ID",
};

const vocabWordsFallback = {
	나: "I / Me",
	회사원: "Employee of a company",
	너무: "Too / Very",
	바쁘다: "To be busy",
	우리: "We / Our",
	보통: "Usually / Usual / Regular",
	주말: "Weekend",
	만나다: "To meet",
	영화: "Movie",
	카페: "Cafe",
	매일: "Everyday",
	일찍: "Early",
	일어나다: "To get up / To wake up",
	물: "Water",
	마시다: "To drink",
	세수하다: "To wash your face",
	옷: "Clothes",
	입다: "To wear / To put on (clothes)",
	화장: "Make-up",
	회사: "Company",
	시험: "Test / Exam",
	의자: "Chair",
	책상: "Desk",
	더럽다: "Dirty",
	위: "Up / Top / Above",
	청소: "Cleaning",
	청소하다: "To clean",
	깨끗하다: "To be clean",
	공책: "Notebook",
	필통: "Pencil Case",
	시작하다: "To begin / To start",
	연락하다: "To contact (someone)",
	타다: "To ride (a bus/subway/car)",
	나오다: "To come out",
	나가다: "To go out",
	들어오다: "To come in",
	들어가다: "To go in",
	사진: "A photograph",
	찍다: "To take (a picture)",
	올해: "This year",
	상황: "A situation",
	한가하다: "To be free / To have time",
	받다: "To receive / To get (something)",
	주다: "To give (something)",
	머리: "Head / Hair",
	허리: "Back / Waist",
	목: "Neck",
	손: "Hand",
	팔: "Arm",
	다리: "Leg",
	발: "Foot",
	배: "Stomach",
	배고프다: "To be hungry",
	배부르다: "To be full",
	다치다: "To get hurt",
	아프다: "To hurt / be sick",
	신발: "Shoe",
	"목이 마르다": "To be thirsty",
	빵: "Bread",
	음료수: "Beverage",
	"좋은 아침이에요": "Good morning",
	아까: "Earlier",
	아침: "Morning (Breakfast)",
	점심: "Lunch",
	저녁: "Evening (Dinner)",
	"잘 자다": "To sleep well",
	"잘 먹겠습니다": "I will eat well",
	먹다: "To eat",
	피곤하다: "To be tired, exhausted",
	아름답다: "To be beautiful",
	덥다: "To be hot (regarding weather)",
	나무: "Tree",
	춥다: "To be cold",
	산: "Mountain",
	강: "River",
	산책하다: "To take a walk, stroll",
	"해가 뜨다": "To rise (sunrise)",
	"해가 지다": "To set (sunset)",
	과일: "Fruits",
	무지개: "Rainbow",
	생선: "Fish (that we eat)",
	회색: "Grey",
	버섯: "Mushroom",
	빨간색: "Red",
	치즈: "Cheese",
	노란색: "Yellow",
	샐러드: "Salad",
	녹색: "Green",
};

async function getWeeklyVocab() {
	let request = getSpreadsheetData(WEEKLY_VOCAB_SHEET_NAME);
	return request.then((responseData) => {
		vocab = getVocabFromSpreadsheetData(responseData);
		return vocab || weeklyVocabFallback;
	}).catch((error) => {
		console.log('The API returned an error: \n' + error);
		return weeklyVocabFallback;
	});
}

async function getSpreadsheetData(vocabSet) {
	let client = getAuthorisedClient();
	const sheets = google.sheets({ version: 'v4', auth: client });
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: SPREADSHEET_ID,
		range: vocabSet,
	});
	return response.data;
}

function getAuthorisedClient() {
	content = fs.readFileSync('./credentials.json', 'utf8');
	return authorize(JSON.parse(content));
}

function authorize(credentials) {
	const { client_email, private_key } = credentials;
	return new google.auth.JWT(client_email, null, private_key, [
		"https://www.googleapis.com/auth/spreadsheets",
	]);
}

function getVocabFromSpreadsheetData(spreadsheetData) {
	let rows = spreadsheetData.values;
	if (rows.length) {
		let vocab = {};
		rows.map((row) => {
			vocab[row[0]] = row[1];
		});
		return vocab;
	}
	console.log('No data found.');
}

async function getVocabWords() {
	let request = getSpreadsheetData(REVIEW_VOCAB_SHEET_NAME);
	return request.then((responseData) => {
		vocab = getVocabFromSpreadsheetData(responseData);
		return vocab || vocabWordsFallback;
	}).catch((error) => {
		console.log('The API returned an error: \n' + error);
		return vocabWordsFallback;
	});
}

module.exports = {
	getWeeklyVocab,
	getVocabWords
}
