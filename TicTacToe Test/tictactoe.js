"use strict";

/*

A SIMPLE TIC-TAC-TOE GAME IN JAVASCRIPT

The game grid is represented in the array Grid.cells as follows:

[0] [1] [2]
[3] [4] [5]
[6] [7] [8]

The cells (array elements) hold the following numeric values:
0 if not occupied, 1 for x, 3 for o.
This allows us to quickly get an overview of the game state:
if the sum of all the cells in a row is 9, the o wins,
if it is 3 and all the cells are occupied, the human x wins,
etc.

*/

//==================================
// EVENT BINDINGS
//==================================

// When the user clicks anywhere outside of the modal dialog, close it
window.onclick = function (evt) {
	var modal = document.getElementsByClassName("modal")[0];
	if (evt.target === modal) {
		closeModal("winAnnounce");
	}
};

//==================================
// HELPER FUNCTIONS
//==================================
function sumArray(array) {
	var sum = 0,
		i = 0;
	for (i = 0; i < array.length; i++) {
		sum += array[i];
	}
	return sum;
}

// GLOBAL VARIABLES
var moves = 0,
	winner = 0,
	x = 1,
	o = 3,
	whoseTurn = x,
	gameOver = false,
	xText = "<span class=\"x\">&times;</class>",
	oText = "<span class=\"o\">o</class>",
	myGrid = null,
	evaluating = false,
	treeTable = `
		<table id="tree_table_game">
			<tr><td class="ttd_game"><div id="cell0" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell1" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell2" onclick="cellClicked(this.id)" class="tree_cell"></div></td></tr>
			<tr><td class="ttd_game"><div id="cell3" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell4" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell5" onclick="cellClicked(this.id)" class="tree_cell"></div></td></tr>
			<tr><td class="ttd_game"><div id="cell6" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell7" onclick="cellClicked(this.id)" class="tree_cell"></div></td><td class="ttd_game"><div id="cell8" onclick="cellClicked(this.id)" class="tree_cell"></div></td></tr>
		</table>
		`;

//==================================
// GRID OBJECT
//==================================

// Grid constructor
//=================
function Grid() {
	this.cells = new Array(9);
}

// Grid methods
//=============

// Get free cells in an array.
// Returns an array of indices in the original Grid.cells array, not the values of the array elements.
// Their values can be accessed as Grid.cells[index].
Grid.prototype.getFreeCellIndices = function () {
	var i = 0,
		resultArray = [];
	for (i = 0; i < this.cells.length; i++) {
		if (this.cells[i] === 0) {
			resultArray.push(i);
		}
	}

	return resultArray;
};

// Get a row (accepts 0, 1, or 2 as argument).
// Returns the values of the elements.
Grid.prototype.getRowValues = function (index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error("Wrong arg for getRowValues!");
		return undefined;
	}
	var i = index * 3;
	return this.cells.slice(i, i + 3);
};

// Get a row (accepts 0, 1, or 2 as argument).
// Returns an array with the indices, not their values.
Grid.prototype.getRowIndices = function (index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error("Wrong arg for getRowIndices!");
		return undefined;
	}
	var row = [];
	index = index * 3;
	row.push(index);
	row.push(index + 1);
	row.push(index + 2);
	return row;
};

// get a column (values)
Grid.prototype.getColumnValues = function (index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error("Wrong arg for getColumnValues!");
		return undefined;
	}
	var i, column = [];
	for (i = index; i < this.cells.length; i += 3) {
		column.push(this.cells[i]);
	}
	return column;
};

// get a column (indices)
Grid.prototype.getColumnIndices = function (index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error("Wrong arg for getColumnIndices!");
		return undefined;
	}
	var i, column = [];
	for (i = index; i < this.cells.length; i += 3) {
		column.push(i);
	}
	return column;
};

// get diagonal cells
// arg 0: from top-left
// arg 1: from top-right
Grid.prototype.getDiagValues = function (arg) {
	var cells = [];
	if (arg !== 1 && arg !== 0) {
		console.error("Wrong arg for getDiagValues!");
		return undefined;
	} else if (arg === 0) {
		cells.push(this.cells[0]);
		cells.push(this.cells[4]);
		cells.push(this.cells[8]);
	} else {
		cells.push(this.cells[2]);
		cells.push(this.cells[4]);
		cells.push(this.cells[6]);
	}
	return cells;
};

// get diagonal cells
// arg 0: from top-left
// arg 1: from top-right
Grid.prototype.getDiagIndices = function (arg) {
	if (arg !== 1 && arg !== 0) {
		console.error("Wrong arg for getDiagIndices!");
		return undefined;
	} else if (arg === 0) {
		return [0, 4, 8];
	} else {
		return [2, 4, 6];
	}
};


Grid.prototype.reset = function () {
	for (var i = 0; i < this.cells.length; i++) {
		this.cells[i] = 0;
	}
	return true;
};

//==================================
// MAIN FUNCTIONS
//==================================

// executed when the page loads
function initialize() {
	myGrid = new Grid();
	moves = 0;
	winner = 0;
	gameOver = false;
	whoseTurn = x; // default, this may change
	for (var i = 0; i <= myGrid.cells.length - 1; i++) {
		myGrid.cells[i] = 0;
	}
}

// executed when the user clicks one of the table cells
function cellClicked(id) {
	// The last character of the id corresponds to the numeric index in Grid.cells:
	var idName = id.toString();
	var cell = parseInt(idName[idName.length - 1]);
	if (myGrid.cells[cell] > 0 || gameOver || evaluating) {
		// cell is already occupied or something else is wrong
		return false;
	}
	moves += 1;

	if (whoseTurn == x) {
		document.getElementById(id).innerHTML = xText;
		myGrid.cells[cell] = x;
		whoseTurn = o;
	} else {
		document.getElementById(id).innerHTML = oText;
		myGrid.cells[cell] = o;
		whoseTurn = x;
	}

	document.getElementById(id).style.cursor = "default";

	// Test if we have a winner:
	if (moves >= 5) {
		winner = checkWin();
	}

	document.getElementById("gameTree").innerHTML += treeTable;

	return true;
}

// Executed when x hits restart button.
// ask should be true if we should ask users if they want to play as X or O
function restartGame() {
	gameOver = false;
	moves = 0;
	winner = 0;
	whoseTurn = x;
	myGrid.reset();
	for (var i = 0; i <= 8; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).innerHTML = "";
		document.getElementById(id).style.cursor = "pointer";
		document.getElementById(id).classList.remove("win-color");
	}
	document.getElementById("gameTree").innerHTML = "";
	evaluating = false;
}

// Check if the game is over and determine winner
function checkWin() {
	evaluating = true;
	winner = 0;

	// rows
	for (var i = 0; i <= 2; i++) {
		var row = myGrid.getRowValues(i);
		if (row[0] > 0 && row[0] == row[1] && row[0] == row[2]) {
			if (row[0] == o) {
				winner = o;
			} else {
				winner = x;
			}
			// Give the winning row/column/diagonal a different bg-color
			var tmpAr = myGrid.getRowIndices(i);
			for (var j = 0; j < tmpAr.length; j++) {
				var str = "cell" + tmpAr[j];
				document.getElementById(str).classList.add("win-color");
			}
			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// columns
	for (i = 0; i <= 2; i++) {
		var col = myGrid.getColumnValues(i);
		if (col[0] > 0 && col[0] == col[1] && col[0] == col[2]) {
			if (col[0] == o) {
				winner = o;
			} else {
				winner = x;
			}
			// Give the winning row/column/diagonal a different bg-color
			var tmpAr = myGrid.getColumnIndices(i);
			for (var j = 0; j < tmpAr.length; j++) {
				var str = "cell" + tmpAr[j];
				document.getElementById(str).classList.add("win-color");
			}
			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// diagonals
	for (i = 0; i <= 1; i++) {
		var diagonal = myGrid.getDiagValues(i);
		if (diagonal[0] > 0 && diagonal[0] == diagonal[1] && diagonal[0] == diagonal[2]) {
			if (diagonal[0] == o) {
				winner = o;
			} else {
				winner = x;
			}
			// Give the winning row/column/diagonal a different bg-color
			var tmpAr = myGrid.getDiagIndices(i);
			for (var j = 0; j < tmpAr.length; j++) {
				var str = "cell" + tmpAr[j];
				document.getElementById(str).classList.add("win-color");
			}
			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// If we haven't returned a winner by now, if the board is full, it's a tie
	var myArr = myGrid.getFreeCellIndices();
	if (myArr.length === 0) {
		winner = 10;
		endGame(winner);
		return winner;
	}
	evaluating = false;
	return winner;
}

function announceWinner(text) {
	document.getElementById("winText").innerHTML = text;
	document.getElementById("winAnnounce").style.display = "block";
	//setTimeout(closeModal, 1400, "winAnnounce");
}

function closeModal(id) {
	document.getElementById(id).style.display = "none";
	restartGame();
}

function endGame(who) {
	if (who == x) {
		announceWinner("X won!");
	} else if (who == o) {
		announceWinner("O won!");
	} else {
		announceWinner("It's a tie!");
	}
	gameOver = true;
	whoseTurn = 0;
	moves = 0;
	winner = 0;
	for (var i = 0; i <= 8; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).style.cursor = "default";
	}
	//setTimeout(restartGame, 800);
}
