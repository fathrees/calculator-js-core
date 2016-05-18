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
	keys[i].addEventListener("click", operate);// this way of binding event to all the keys makes posible replacing, adding and removing them
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
	var key = e.target.innerHTML;
	if (!err) {
		if ((numStr.length < maxLength) && (+key || (key == 0 && numStr.length > 0) || (key == "." && !~numStr.indexOf(".") && numStr.length <= (maxLength - 2)))) {
			createNum(key);	//create operand
			if (!previousOperator) {
				sequence = null;
				showHint.innerHTML = "\xA0";
			}
			return;
		}
		if (showNum.innerHTML != "0") {
			if (key == "\u2190") {backspace(); return}
			if (key == "CE") {resetOperand(); return}
			if (key == "\xB1") {changeSign(); return}
			if (key == "\u221A") {squareRoot(); return}		
		}
		if (key == "rand") {getRandom(); return}
		if (key == "1/x") {oneDivideX(); return}
		if (~operators.indexOf(key)) {calculate(key); return}
		if (key == "=") {calculate(); return}
	}
	if (key == "C") {resetAll(); return}
}

function createNum(key) {
	if (numStr == "0" || numStr == "-0") {
		numStr = "";
	}
	if (!numStr && key == ".") {
		numStr = "0.";
	} else {
		numStr += key;
	}
	showNum.innerHTML = numStr;
}

function backspace() {
	if (!sequence || !sequence.secondArg) {
		numStr = showNum.innerHTML;
		numStr = numStr.slice(0, -1);
		if (!numStr.length) {
			showNum.innerHTML = 0;
		} else {
			showNum.innerHTML = numStr;
		}
	}
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
	numStr = showNum.innerHTML;
	numStr *= -1; 
	showNum.innerHTML = numStr;
	numStr = "0";
	if (sequence.secondArg) { //also change sign of first operand in sequence of last result of calculation if it was done 
		sequence.firstArg *= -1;
	}
}

function getRandom() {
	var randomMax = "";
	for (var i = 0; i < maxLength; i++) {
		randomMax += "9";
	}
	randomMax = +randomMax.slice(0, Math.floor((Math.random() * maxLength) + 1));
	var randomInt = Math.floor((Math.random() * randomMax) + 1);
	var randomFloat = randomInt + Math.random().toFixed(Math.floor((Math.random() * maxLength) + 1));
	var randomArr = [,randomInt, -randomInt, +randomFloat, -randomFloat];
	showNum.innerHTML = randomArr[Math.floor((Math.random() * (randomArr.length - 1)) + 1)];
	showHint.innerHTML = "random";
}

function squareRoot() {
	numStr = showNum.innerHTML;
	showHint.innerHTML = "\u221A" + numStr;
	if (+numStr > 0) {
		numStr = Math.sqrt(1 * numStr);
		showNum.innerHTML = numStr;
		numStr = "0";
		sequence = null;
	} else {
		error(1);
	}
}

function oneDivideX() {
	numStr = showNum.innerHTML;
	if (+numStr) {
		numStr = (1/numStr);
		if (isError(numStr)) return;
		showNum.innerHTML = numStr;
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
		if (isError(numStr)) return;
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

function isError(numStr) {
	numStr += ""; 
	if (!isFinite(numStr)) {
		error(0);
		return true;
	}
	if ((numStr.length > maxLength) && !~numStr.indexOf(".")) {
		showHint.innerHTML = "Too long number for accuracy. Press 'C'";
		showNum.innerHTML = numStr;
		err = true;
		return true;
	}
}

function error(num) {
	err = true;
	var errors = ["can't x/0", "can't \u221A-x"];
	showNum.innerHTML = "Error: " + errors[num];
	showHint.innerHTML = "Press 'C' to clear";
}

function Sequence(firstArg, operator, secondArg) {
	this.firstArg = firstArg;
	this.operator = operator;
	this.secondArg = secondArg;
	this.getString = function() {
		return this.firstArg + " " + this.operator + " " + isNegative(this.secondArg);
	};
	this.result = function() {
		if (~this.firstArg.indexOf(".") || ~this.secondArg.indexOf(".")) {
			return isFloat(this.firstArg, this.operator, this.secondArg);
		}
		return eval(this.getString());
	}
	
	function isFloat(arg1, operator, arg2) {
		var fraction = [arg1.indexOf(".") + 1, arg2.indexOf(".") + 1];
		var fractionLength = fraction[0] || fraction[1] ? Math.max(arg1.slice(fraction[0]).length, arg2.slice(fraction[1]).length) : null;
		var factor = 1;
		for (var i = 0; i < fractionLength; i++) {
			factor += "0";
		}
		var sequence = (operator == "+" || operator == "-") ? "(" + ((arg1 * factor) + operator + (isNegative(arg2 * factor))) + ")/" + factor : 
			"(" + ((arg1 * factor) + operator + (isNegative(arg2))) + ")/" + factor;
		var result = eval(sequence) + "";
		fraction = result.indexOf(".") + 1;
		if (fraction && result.length > maxLength + 1) {
			result = (+result).toFixed(maxLength + 1 - result.slice(0, fraction).length);
		}
		return +result;
	}
	
	function isNegative(numStr) {
		if (+numStr < 0) {
			return "(" + numStr + ")";
		}
		return numStr;
	}
}
