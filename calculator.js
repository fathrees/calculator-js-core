var keys = document.getElementsByTagName("td");
var showNum = document.getElementById("number");
var showHint = document.getElementById("hint");
var numStr = "";
var sequence;
var maxLength = 15;
var operators = "+*/-";
var err = false;
var previousOperator;

for (var i = 0; i < keys.length; i++) {
	keys[i].addEventListener("mousedown", mouseDownStyle);
	keys[i].addEventListener("mouseup", mouseUpStyle);
	keys[i].addEventListener("mouseout", mouseUpStyle);
	keys[i].addEventListener("click", e => { if (e.target.innerHTML == "C" || !err) return operate(e);});// this way of binding event to all the keys makes posible replacing, adding and removing them
}

function mouseDownStyle(e) {
	e.preventDefault();
	e.target.style.border = "1px solid #fff";
	e.target.style.borderTop = "2px solid #666";
	e.target.style.borderLeft = "2px solid #666";
}

function mouseUpStyle(e) {
	e.target.style.border = "2px solid #666";
	e.target.style.borderTop = "1px solid #fff";
	e.target.style.borderLeft = "1px solid #fff";
}

function operate(e) {
	let key = e.target.innerHTML;
	if (key == "C") {resetAll(); return}
	if ((numStr.length < maxLength) && (+key || (key == 0 && numStr.length > 0) || (key == "." && !~numStr.indexOf(".") && numStr.length <= (maxLength - 2)))) {
		createNum(key);	//create operand
		if (!previousOperator) {
			sequence = null;
			showHint.innerHTML = "\xA0";
		}
		return;
	}
	if (showNum.innerHTML != "0") {
		if (key == "\u2190" && (!sequence || !sequence.secondArg)) {backspace(); return}
		if (key == "CE") {resetOperand(); return}
		if (key == "\xB1") {changeSign(); return}
		if (key == "\u221A") {squareRoot(); return}		
	}
	if (key == "rand") {getRandom(); return}
	if (key == "1/x") {oneDivideX(); return}
	if (~operators.indexOf(key)) {calculate(key); return}
	if (key == "=") {calculate(); return}
}

function createNum(key) {
	if (numStr == "0" || numStr == "-0") {
		numStr = "";
	}
	numStr = !numStr && key == "." ? "0." : numStr + key;
	showNum.innerHTML = numStr;
}

function backspace() {
	numStr = showNum.innerHTML;
	numStr = numStr.slice(0, -1);
	showNum.innerHTML = !numStr.length ? 0 : numStr;
}

function resetOperand() {
	numStr = "";
	showNum.innerHTML = 0;
}

function resetAll() {
	err = false;
	numStr = "";
	showNum.innerHTML = 0;
	showHint.innerHTML = "\xA0";
	sequence = null;
}

function changeSign() {
	showNum.innerHTML = -1 * showNum.innerHTML;
	numStr = "0";
	if (sequence && sequence.secondArg) { //also change sign of first operand in sequence of last result of calculation if it was done 
		sequence.firstArg = -1 * sequence.firstArg + "";
	}
}

function getRandom() {
	let randomMax = "";
	for (let i = 0; i < maxLength; i++) {
		randomMax += "9";
	}
	randomMax = +randomMax.slice(0, Math.floor((Math.random() * maxLength) + 1));
	let randomInt = Math.floor((Math.random() * randomMax) + 1);
	let randomFloat = randomInt + Math.random().toFixed(Math.floor((Math.random() * maxLength) + 1));
	let randomArr = [,randomInt, -randomInt, +randomFloat, -randomFloat];
	showNum.innerHTML = randomArr[Math.floor((Math.random() * (randomArr.length - 1)) + 1)];
}

function squareRoot() {
	numStr = +showNum.innerHTML;
	if (numStr > 0) {
		showNum.innerHTML = Math.sqrt(numStr);
		showHint.innerHTML = "\u221A" + numStr;
		numStr = "0";
		sequence = null;
	} else {
		error(1);
	}
}

function oneDivideX() {
	numStr = showNum.innerHTML; 
	if (+numStr) {
		showNum.innerHTML = fixFloat(eval(isFloat("1", "/", numStr)));// DOESN"T WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		showHint.innerHTML = "1 / " + numStr;
		numStr = "0";
		sequence = null;
	} else {
		error(0);
	}
}

function calculate(key) {
	if (sequence) {
		if (!sequence.secondArg) {
			sequence.secondArg = showNum.innerHTML;
		}
		if (key && !previousOperator) { // if operator pressed after "="
			sequence.secondArg = ""; //
			sequence.operator = key; // remove saved last operation from sequence
			previousOperator = key;
			showHint.innerHTML = sequence.getString();
			return;
		}
		showHint.innerHTML = sequence.getString();
		numStr = sequence.result();
		if (!isFinite(numStr)) {
			error(0);
			return;
		}
		showNum.innerHTML = numStr;
	}
	if (key) {
		sequence = new Sequence(showNum.innerHTML, key);
	} else if (sequence) {
		sequence.firstArg = showNum.innerHTML; // create new sequence with last operation for second pressing "="
	}
	previousOperator = key;
	numStr = "0";
}

function error(num) {
	err = true;
	let errors = ["x/0 or Infinity", "can't \u221A-x"];
	showNum.innerHTML = "Error: " + errors[num];
	showHint.innerHTML = "Press 'C' to clear";
}

function Sequence(firstArg, operator, secondArg) {
	let self = this;
	self.firstArg = firstArg;
	self.operator = operator;
	self.secondArg = secondArg;
	self.getString = () => self.firstArg + " " + self.operator + " " + isNegative(self.secondArg);
	self.result = () => {
		if (~self.firstArg.indexOf(".") || ~self.secondArg.indexOf(".")) {
			return fixFloat(eval(isFloat(self.firstArg, self.operator, self.secondArg)));
		}
		return eval(self.getString());
	};
}

function isNegative(numStr) {
	return +numStr < 0 ? "(" + numStr + ")" : numStr;
}

function isFloat(arg1, operator, arg2) {
	let fraction = [arg1.indexOf(".") + 1, arg2.indexOf(".") + 1];
	let fractionLength = Math.max(arg1.slice(fraction[0]).length, arg2.slice(fraction[1]).length);
	let factor = "1";
	for (let i = 0; i < fractionLength; i++) {
		factor += "0";
	}
	let sequence =  "(" + ((arg1 * factor) + operator + (isNegative(arg2 * factor))) + ")/" + factor;
	if (operator == "/" || operator == "*") {
		sequence +=	"/" + factor;
	}
	return sequence;
}

function fixFloat(num) {
	let result = num + "";
	fraction = result.indexOf(".") + 1;
	if (fraction && result.length > maxLength + 1) {
		let resultInt = result.slice(0, fraction - 1);
		result =  resultInt.length >= maxLength ? (+result).toFixed(0) : (+result).toFixed(maxLength - resultInt.length);
	}
	return +result;
}