// Pretty much all of this was taken from https://github.com/smmnloes/koreannumbertrainer
const numbersWrittenKorean = {
    "units": {
        "0": "",
        "1": "하나",
        "2": "둘",
        "3": "셋",
        "4": "넷",
        "5": "다섯",
        "6": "여섯",
        "7": "일곱",
        "8": "여덟",
        "9": "아홉"
    },
    "tens": {
        "1": "열",
        "2": "스물",
        "3": "서른",
        "4": "마흔",
        "5": "쉰",
        "6": "예순",
        "7": "일흔",
        "8": "여든",
        "9": "아흔"
    }
};

function getNumberWrittenKorean(number) {
    const numberAsStringReversed = reverseString(number.toString());

    var output = "";
    output = numbersWrittenKorean.units[numberAsStringReversed.charAt(0)] + output;
    if (numberAsStringReversed.charAt(1)) {
        output = numbersWrittenKorean.tens[numberAsStringReversed.charAt(1)] + output;
    }
    return output;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

const numbersWrittenChinese = {
    0: {
        "0": "",
        "1": "일",
        "2": "이",
        "3": "삼",
        "4": "사",
        "5": "오",
        "6": "육",
        "7": "칠",
        "8": "팔",
        "9": "구"
    },
    1: "십",
    2: "백",
    3: "천",
    4: "만",
    5: "십",
    6: "백",
    7: "천",
    8: "억",
    9: "십",
    10: "백",
    11: "천",
    12: "조",
    13: "십",
    14: "백",
    15: "천",
    16: "경",
    17: "십",
    18: "백",
    19: "천"
};

function getNumberWrittenChinese(number) {
    const numberAsStringReversed = reverseString(number.toString());

    let output = "";

    let currentChar = numberAsStringReversed.charAt(0);
    output = (currentChar > 0 ? numbersWrittenChinese[0][currentChar] : "") + output;

    for (let i = 1; i < numberAsStringReversed.length; i++) {
        let currentChar = numberAsStringReversed.charAt(i);
        const isBreakPoint = [4, 8, 12, 16].includes(i);
        if (isBreakPoint) {
            output = " " + output;
        }
        //// 10^X-part, e.g. the 백 in 이백삼
        let new10XPart = (
            // If we are 0, then we don't want the 10^X part. (e.g. second digit in 100)
            currentChar > 0 ||
            // But if we have a break-point (e.g. 만 or 억), we need it even if it is zero: 10 0000 is 십만
            (isBreakPoint &&
                // But only if we did not also reach the next bigger break point and we have only zeros in the next
                // four digits:
                // 1 0000 0000 is 일억, no 만 here, but:  1 0010 0000 is 일억백만, here we need the 만
                nextFourDigitsHaveNonZero(i, numberAsStringReversed))) ? numbersWrittenChinese[i] : "";

        // Prepend new part
        output = new10XPart + output;

        //// Multiplier for the 10^X-part, e.g. the 이 in 이백십
        let new10XMultiplierPart = (currentChar > 1
            // If we are at a special breakpoint and there are
            // non-zero values in the next 4 digits to the left, or
            // we are at the terminal digit and we are at a bigger breakpoint than 만,
            // we need the multiplier even if it is 1:
            //
            || ([8, 12, 16].includes(i) && (numberAsStringReversed.length - 1 === i))
            || (isBreakPoint && nextFourDigitsHaveNonZero(i, numberAsStringReversed))
        ) ? numbersWrittenChinese[0][currentChar] : "";

        output = new10XMultiplierPart + output;
    }
    return output.trim();
}

function nextFourDigitsHaveNonZero(index, inputString) {
    for (let j = index + 1; j <= index + 3; j++) {
        if (j < inputString.length && inputString.charAt(j) !== "0") {
            return true;
        }
    }
    return false;
}

module.exports = {
    getNumberWrittenChinese,
    getNumberWrittenKorean
}
