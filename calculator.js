var keys = document.getElementsByTagName("td");
var showNum = document.getElementById("number");
var showHint = document.getElementById("hint");
var numStr = "";
var sequence = "";
var maxLength = 15;
var operators = "+-*/";
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
			createNum(key);//create operand
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
	numStr = showNum.innerHTML;
	numStr = numStr.slice(0, -1);
	if (!numStr.length) {
		showNum.innerHTML = 0;
	} else {
		showNum.innerHTML = numStr;
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
	numStr = (-1 * numStr).toString(); 
	showNum.innerHTML = numStr;
	numStr = "0";
}

function squareRoot() {
	numStr = showNum.innerHTML;
	if (+numStr > 0) {
		numStr = shorter(Math.sqrt(1 * numStr));
		showNum.innerHTML = numStr;
		numStr = "0";
	} else {
		error(1);
	}
}

function oneDivideX() {
	numStr = showNum.innerHTML;
	if (+numStr) {
		numStr = shorter((1/numStr));
		showNum.innerHTML = numStr;
		numStr = "0";
	} else {
		error(0);
	}
}

function calculate(key) {
	if (sequence) {
		if (operators.split("").some(function(item) {return sequence.lastIndexOf(item) == sequence.length - 1})){ // if sequence ends with some of operators
			sequence += isNegative(showNum.innerHTML);
		}
		if (key && !previousOperator) {
			sequence = sequence.slice(0, sequence.lastIndexOf(lastOperation(sequence))) + key;
			previousOperator = key;
			return;
		}
		showHint.innerHTML = sequence;
		numStr = shorter(eval(sequence));
		if (numStr == "NaN" || numStr == Infinity || numStr == -Infinity) {
			error(0);
			numStr = "0";
			return;
		}
		showNum.innerHTML = numStr;
	}
	if (key) {
		sequence = +showNum.innerHTML + key;
	} else if (sequence) {
		sequence = +showNum.innerHTML + lastOperation(sequence);
	}
	previousOperator = key;
	numStr = "0";
}

function shorter(num) {
	var numStr = num.toString();
	if (numStr.length > maxLength) {
		numStr = numStr.slice(0, maxLength - numStr.length);
	}
	return numStr;
}

function error(num) {
	err = true;
	var errors = ["can't x/0", "can't \u221A-x"];
	showNum.innerHTML = "Error: " + errors[num];
	showHint.innerHTML = "Push 'C' to clear";
}

function lastOperation(sequence) {
	var operatorIndex;
	operators.split("").some(function(item) {
		operatorIndex = sequence.lastIndexOf(item);
		return operatorIndex > -1;
	});
	return sequence.slice(operatorIndex);
}

function isNegative(numStr) {
	if (+numStr < 0) {
		return "(" + numStr + ")";
	}
	return numStr;
}

//TODO long numbers
//check wrong js work with float
//"="
//"%"
//open in sized window
//listen keyboard
