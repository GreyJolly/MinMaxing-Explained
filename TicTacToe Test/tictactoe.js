"use strict";

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
	xText = '<span class="x">&times;</class>',
	oText = '<span class="o">o</class>',
	playingGrid = null,
	evaluating = false;
//treeTable = `
//	<table id="tree_table_game">
//		<tr><td class="ttd_game"><div id="cell0" class="tree_cell"></div></td><td class="ttd_game"><div id="cell1" class="tree_cell"></div></td><td class="ttd_game"><div id="cell2" class="tree_cell"></div></td></tr>
//		<tr><td class="ttd_game"><div id="cell3" class="tree_cell"></div></td><td class="ttd_game"><div id="cell4" class="tree_cell"></div></td><td class="ttd_game"><div id="cell5" class="tree_cell"></div></td></tr>
//		<tr><td class="ttd_game"><div id="cell6" class="tree_cell"></div></td><td class="ttd_game"><div id="cell7" class="tree_cell"></div></td><td class="ttd_game"><div id="cell8" class="tree_cell"></div></td></tr>
//	</table>
//	`;

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
// Returns an array of indices in the original Grid.cells array, not their values.
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

// Get the index the row, column and eventually the diagonal of a cell
Grid.prototype.getRowColDiagOfCell = function (arg) {
	var rowColDiag = [];
	rowColDiag.push(Math.floor(arg / 3));
	rowColDiag.push(arg % 3);
	if (rowColDiag[0] == rowColDiag[1]) rowColDiag.push(0);
	if (rowColDiag[0] + rowColDiag[1] == 2) rowColDiag.push(1);
	rowColDiag.push(null);
	return rowColDiag;
};

Grid.prototype.getCellValue = function (row, col) {
	return this.cells[row * 3 + col];
}

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
	playingGrid = new Grid();
	moves = 0;
	winner = 0;
	gameOver = false;
	whoseTurn = x; // default, this may change
	for (var i = 0; i < playingGrid.cells.length; i++) {
		playingGrid.cells[i] = 0;
	}
}

// Make an HTML string to display a given Grid
function makeStringForTreeGame(treeGrid) {
	var treeTable = '<table id="tree_table_game">\n\t';
	for (var i = 0; i < 3; i++) {
		treeTable += '\t<tr>'
		for (var j = 0; j < 3; j++) {
			treeTable += '<td class="ttd_game"><div id="cell0" class="tree_cell">';
			if (treeGrid.cells[i * 3 + j] == x) {
				treeTable += '<span class="tree_x">&times;</class>';
			} else if (treeGrid.cells[i * 3 + j] == o) {
				treeTable += '<span class="tree_o">o</class>';
			}
			treeTable += '</div></td>';
		}
		treeTable += '</tr>'
	}
	treeTable += '</table>';

	return treeTable;
};

// executed when the user clicks one of the table cells
function cellClicked(id) {
	// The last character of the id corresponds to the numeric index in Grid.cells:
	var idName = id.toString();
	var cell = parseInt(idName[idName.length - 1]);
	if (playingGrid.cells[cell] > 0 || gameOver || evaluating) {
		// cell is already occupied or something else is wrong
		return false;
	}
	moves += 1;

	if (whoseTurn == x) {
		document.getElementById(id).innerHTML = xText;
		playingGrid.cells[cell] = x;
		whoseTurn = o;
	} else {
		document.getElementById(id).innerHTML = oText;
		playingGrid.cells[cell] = o;
		whoseTurn = x;
	}

	document.getElementById(id).style.cursor = "default";

	// Test if we have a winner:
	if (moves >= 5) {
		winner = checkWin(cell);
	}

	document.getElementById("gameTree").innerHTML += makeStringForTreeGame(playingGrid);

	return true;
};

// Executed when x hits restart button.
// ask should be true if we should ask users if they want to play as X or O
function restartGame() {
	gameOver = false;
	moves = 0;
	winner = 0;
	whoseTurn = x;
	playingGrid.reset();
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).innerHTML = "";
		document.getElementById(id).style.cursor = "pointer";
		document.getElementById(id).classList.remove("win-color");
	}
	document.getElementById("gameTree").innerHTML = "";
	evaluating = false;
}

// Check if the game is over and determine winner
function checkWin(cellid) {
	evaluating = true;
	winner = 0;
	var stuffToCheck = playingGrid.getRowColDiagOfCell(cellid);

	// rows
	var row = playingGrid.getRowValues(stuffToCheck[0]);
	if (row[0] > 0 && row[0] == row[1] && row[0] == row[2]) {
		if (row[0] == o) {
			winner = o;
		} else {
			winner = x;
		}
		// Give the winning row/column/diagonal a different bg-color
		var tmpAr = playingGrid.getRowIndices(stuffToCheck[0]);
		for (var i = 0; i < tmpAr.length; i++) {
			var str = "cell" + tmpAr[i];
			document.getElementById(str).classList.add("win-color");
		}
		setTimeout(endGame, 1000, winner);
		return winner;
	}

	// columns
	var col = playingGrid.getColumnValues(stuffToCheck[1]);
	if (col[0] > 0 && col[0] == col[1] && col[0] == col[2]) {
		if (col[0] == o) {
			winner = o;
		} else {
			winner = x;
		}
		// Give the winning row/column/diagonal a different bg-color
		var tmpAr = playingGrid.getColumnIndices(stuffToCheck[1]);
		for (var i = 0; i < tmpAr.length; i++) {
			var str = "cell" + tmpAr[i];
			document.getElementById(str).classList.add("win-color");
		}
		setTimeout(endGame, 1000, winner);
		return winner;
	}

	// diagonals
	if (stuffToCheck[2] !== null) {
		var diagonal = playingGrid.getDiagValues(stuffToCheck[2]);
		if (diagonal[0] > 0 && diagonal[0] == diagonal[1] && diagonal[0] == diagonal[2]) {
			if (diagonal[0] == o) {
				winner = o;
			} else {
				winner = x;
			}
			// Give the winning row/column/diagonal a different bg-color
			var tmpAr = playingGrid.getDiagIndices(stuffToCheck[2]);
			for (var i = 0; i < tmpAr.length; i++) {
				var str = "cell" + tmpAr[i];
				document.getElementById(str).classList.add("win-color");
			}
			setTimeout(endGame, 1000, winner);
			return winner;
		}

		// TODO: OPTIMISE! This section is a crutch added to fix the center checking both diagonals
		if(stuffToCheck[3] !== null) {	
			var diagonal = playingGrid.getDiagValues(stuffToCheck[3]);
			if (diagonal[0] > 0 && diagonal[0] == diagonal[1] && diagonal[0] == diagonal[2]) {
				if (diagonal[0] == o) {
					winner = o;
				} else {
					winner = x;
				}
				// Give the winning row/column/diagonal a different bg-color
				var tmpAr = playingGrid.getDiagIndices(stuffToCheck[3]);
				for (var i = 0; i < tmpAr.length; i++) {
					var str = "cell" + tmpAr[i];
					document.getElementById(str).classList.add("win-color");
				}
				setTimeout(endGame, 1000, winner);
				return winner;
			}
		}
	}

	// If we haven't returned a winner by now, if the board is full, it's a tie
	var myArr = playingGrid.getFreeCellIndices();
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
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).style.cursor = "default";
	}
	//setTimeout(restartGame, 800);
}
