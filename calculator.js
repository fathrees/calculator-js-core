var keys = document.getElementsByTagName("td");
var showNum = document.getElementById("number");
var showHint = document.getElementById("hint");
var numStr = "";
var sequence = "";
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
				sequence = "";
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
	if (!sequence || isPending(sequence)) {
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
	sequence = "";
}

function changeSign() {
	numStr = showNum.innerHTML;
	numStr *= -1; 
	showNum.innerHTML = numStr;
	numStr = "0";
	if (sequence && !isPending(sequence)) { //also change sign of first operand in sequence of last result of calculation if it was done 
		sequence = -1 * sequence.slice(0, sequence.lastIndexOf(lastOperation(sequence))) + lastOperation(sequence);
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
		sequence = "";
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
		sequence = "";
	} else {
		error(0);
	}
}

function calculate(key) {
	if (sequence) {
		if (isPending(sequence)) { // if sequence ends with operator
			sequence += isNegative(showNum.innerHTML);
		}
		if (key && !previousOperator) { // if operator pressed after "="
			sequence = sequence.slice(0, sequence.lastIndexOf(lastOperation(sequence))) + key;// remove saved last operation from sequence
			previousOperator = key;
			showHint.innerHTML = sequence;
			return;
		}
		showHint.innerHTML = sequence;
		numStr = eval(sequence);
		if (isError(numStr)) return;
		showNum.innerHTML = (numStr + "").indexOf(".") > -1 ? +numStr.toFixed(maxLength - (Math.round(+numStr) + "").length) : numStr;
		//fix mistake in calculations of float
	}
	if (key) {
		sequence = +showNum.innerHTML + key;
	} else if (sequence) {
		sequence = +showNum.innerHTML + lastOperation(sequence); // create new sequence with last operation for second pressing "="
	}
	previousOperator = key;
	numStr = "0";
}

function lastOperation(sequence) {
	var operatorIndex;
	operatorIndex = sequence.indexOf("(");
	if (operatorIndex > -1) {
		 operatorIndex--;
	} else {
		operators.split("").some(function(item) {
			operatorIndex = sequence.lastIndexOf(item);
			return operatorIndex > -1;
		});
	}
	return sequence.slice(operatorIndex);
}

function isNegative(numStr) {
	if (+numStr < 0) {
		return "(" + numStr + ")";
	}
	return numStr;
}

function isPending(sequence) {
	return operators.split("").some(function(item) {
		return sequence.lastIndexOf(item) == sequence.length - 1;
	});
}

function isError(numStr) {
	numStr += ""; 
	if (!isFinite(numStr)) {
		error(0);
		return true;
	}
	if ((numStr.length > maxLength + 1 && !~numStr.indexOf(".")) || ~numStr.indexOf("e")) {
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


