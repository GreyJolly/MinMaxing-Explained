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

// GLOBAL CONSTANTS
const
	x = 1,
	o = 3,
	xText = '<span class="x">&times;</class>',
	oText = '<span class="o">o</class>',
	noWin = null,
	xWin = 1,
	oWin = -1,
	tieWin = 0,
	author_player = "player",
	author_random = "random",
	author_computer = "computer",
	x_background = "rgba(0, 255, 255, 0.20)",
	o_background = "rgba(255, 0, 255, 0.20",
	HARD_LIMIT = 3;

// GLOBAL VARIABLES
var
	gameOver = false,
	playingGrid = null,
	author_turn;

//==================================
// GRID OBJECT
//==================================

// Grid constructor
//=================
function Grid() {
	this.cells = new Array(9);
	this.moves = 0;
	this.whoseTurn = x;
	this.won = noWin;
	this.winningCells = [null, null, null];
}

// Grid methods
//=============

Grid.prototype.makeMove = function (lastMovePlayed) {
	if (this.cells[lastMovePlayed] != 0) {
		console.error("Made a move on a full cell!");
		return false;
	}
	if (this.won !== noWin) return false;
	this.cells[lastMovePlayed] = this.whoseTurn;
	this.whoseTurn = this.whoseTurn == x ? o : x;
	this.moves++;
	if (this.moves >= 5) {
		var results = this.checkMoveForWin(lastMovePlayed);
		this.won = results[0];
		this.winningCells = results.splice(1);
		if (this.moves >= 9 && this.won == noWin) {
			this.won = tieWin;
		}
	}
	return this;
}

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

Grid.prototype.getRandomFreeCell = function () {
	var possibleFreeCell;
	do {
		possibleFreeCell = Math.floor(Math.random() * 9);
	} while (this.cells[possibleFreeCell] != 0);
	return possibleFreeCell;
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
	this.moves = 0;
	this.whoseTurn = x;
	this.won = noWin;
	this.winningCells = [null, null, null];
	return true;
};

Grid.prototype.getPossibleAnswers = function () {
	if (this.won !== noWin) return [];
	var possibleAnswers = [];
	var include = true;
	for (var i = 0; i < 9; i++) {
		if (this.cells[i] == 0) {
			var possibleAnswerGrid = this.clone();
			possibleAnswerGrid.makeMove(i);

			// We check whether the current possible answer is a symmetry of a previous answer
			include = true;
			for (const previousAnswer of possibleAnswers) {
				for (const previousSymmetry of previousAnswer.getSymmetries()) {
					if (areArraysEqual(previousSymmetry, possibleAnswerGrid.cells)) {
						include = false;
						break;
					}

				}
			}
			if (include) possibleAnswers.push(possibleAnswerGrid.clone());
		}
	}
	return possibleAnswers;
};

// Check if a game is over and determine the winner and the winning row/column/diagonal
Grid.prototype.checkMoveForWin = function (lastMovePlayed) {
	var stuffToCheck = this.getRowColDiagOfCell(lastMovePlayed);
	var winner;
	// rows
	var row = this.getRowValues(stuffToCheck[0]);
	if (row[0] > 0 && row[0] == row[1] && row[0] == row[2]) {
		winner = (row[0] == x)?[xWin]:[oWin];
		// Return the winning row
		winner = winner.concat(this.getRowIndices(stuffToCheck[0]));
		return winner;
	}

	// columns
	var col = this.getColumnValues(stuffToCheck[1]);
	if (col[0] > 0 && col[0] == col[1] && col[0] == col[2]) {
		winner = (col[0] == x)?[xWin]:[oWin];
		// Return the winning column
		winner = winner.concat(this.getColumnIndices(stuffToCheck[1]));
		return winner;
	}

	// diagonals

	for (var i = 2; i <= 3; i++) {
		if (stuffToCheck[i] !== null) {
			var diagonal = this.getDiagValues(stuffToCheck[i]);
			if (diagonal[0] > 0 && diagonal[0] == diagonal[1] && diagonal[0] == diagonal[2]) {
				winner = (diagonal[0] == x)?[xWin]:[oWin];
				// Return the winning diagonal
				winner = winner.concat(this.getDiagIndices(stuffToCheck[i]));
				return winner;
			}
		} else break;
	}

	return [noWin, null, null, null];
};

Grid.prototype.getSymmetries = function () {
	var symmetries = [];

	// Vertical symmetry
	symmetries.push([this.cells[6], this.cells[7], this.cells[8], this.cells[3], this.cells[4], this.cells[5], this.cells[0], this.cells[1], this.cells[2]]);
	// Horizontal symmetry
	symmetries.push([this.cells[2], this.cells[1], this.cells[0], this.cells[5], this.cells[4], this.cells[3], this.cells[8], this.cells[7], this.cells[6]]);
	// First diagonal symmetry
	symmetries.push([this.cells[0], this.cells[3], this.cells[6], this.cells[1], this.cells[4], this.cells[7], this.cells[2], this.cells[5], this.cells[8]]);
	// Second diagonale symmetry
	symmetries.push([this.cells[8], this.cells[5], this.cells[2], this.cells[7], this.cells[4], this.cells[1], this.cells[6], this.cells[3], this.cells[0]]);
	// 90° Rotational symmetry
	symmetries.push([this.cells[6], this.cells[3], this.cells[0], this.cells[7], this.cells[4], this.cells[1], this.cells[8], this.cells[5], this.cells[2]]);
	// 180° Rotational symmetry
	symmetries.push([this.cells[8], this.cells[7], this.cells[6], this.cells[5], this.cells[4], this.cells[3], this.cells[2], this.cells[1], this.cells[0]]);
	// 270° Rotational symmetry
	symmetries.push([this.cells[2], this.cells[5], this.cells[8], this.cells[1], this.cells[4], this.cells[7], this.cells[0], this.cells[3], this.cells[6]]);

	return symmetries;
}


Grid.prototype.clone = function () {
	var clonedGrid = new Grid();
	clonedGrid.cells = this.cells.slice(0);
	clonedGrid.whoseTurn = this.whoseTurn;
	clonedGrid.won = this.won;
	clonedGrid.moves = this.moves;
	clonedGrid.winningCells = this.winningCells.splice(0);
	return clonedGrid;
}

//==================================
// MAIN FUNCTIONS
//==================================

// Executed when the page loads
function initialize() {
	document.getElementById("turnText").innerHTML = "È il turno delle X";
	author_turn = document.querySelector('input[name="X_player"]:checked').value;
	playingGrid = new Grid();
	gameOver = false;
	playingGrid.whoseTurn = x;
	for (var i = 0; i < playingGrid.cells.length; i++) {
		playingGrid.cells[i] = 0;
	}
	
	if (author_turn == author_random) {
		setTimeout(handleMove, 1000, author_random, playingGrid.getRandomFreeCell());
	}
}

// Executed when the user clicks one of the table cells
function cellClicked(id) {
	// The last character of the id corresponds to the numeric index in Grid.cells:
	var idName = id.toString();
	handleMove(author_player, parseInt(idName[idName.length - 1]));
};

function handleMove(author, cell) {
	var X_player = document.querySelector('input[name="X_player"]:checked').value
	var O_player = document.querySelector('input[name="O_player"]:checked').value

	var id = "cell" + cell.toString();

	// Cell is already occupied, not the correct turn or something else is wrong
	if (playingGrid.cells[cell] > 0 || gameOver || author != author_turn) {
		return false;
	}
	if (playingGrid.makeMove(cell) == false) return false;

	document.getElementById(id).style.cursor = "default";
	document.getElementById("turnText").innerHTML = (playingGrid.whoseTurn == x) ? "È il turno delle X" : "È il turno delle O";

	if (playingGrid.whoseTurn == o) {
		document.getElementById(id).innerHTML = xText;
		playingGrid.cells[cell] = x;
	} else {
		document.getElementById(id).innerHTML = oText;
		playingGrid.cells[cell] = o;
	}

	// Test if we have a winner:

	if (playingGrid.won == xWin || playingGrid.won == oWin) {
		for (var i = 0; i < playingGrid.winningCells.length; i++) {
			var str = "cell" + playingGrid.winningCells[i];
			document.getElementById(str).classList.add("win-color");
		}
		endGame(playingGrid.won);
	}
	else if (playingGrid.won == tieWin) {
		endGame(playingGrid.won);
	}
	// Call the next move
	else {
		author_turn = (author_turn == X_player)?O_player:X_player;

		if (author_turn == author_random) {
			setTimeout(handleMove, 1000, author_random, playingGrid.getRandomFreeCell());
		} else if(author_turn == author_computer) {
			setTimeout(handleMove, 1000, author_computer, findBestMove(playingGrid));
		}

		// Generate game tree
		var possibleAnswers = playingGrid.getPossibleAnswers();
		var levelString = ["", "", "", ""];
		for (var i = 0; i < possibleAnswers.length; i++) {
			levelString[0] += makeStringForTreeGame(possibleAnswers[i]);
			var possibleAnswersLevel2 = possibleAnswers[i].getPossibleAnswers();
			for (var j = 0; j < possibleAnswersLevel2.length; j++) {
				levelString[1] += makeStringForTreeGame(possibleAnswersLevel2[j]);
				var possibleAnswersLevel3 = possibleAnswersLevel2[j].getPossibleAnswers();
				for (var k = 0; k < possibleAnswersLevel3.length; k++) {
					levelString[2] += makeStringForTreeGame(possibleAnswersLevel3[k]);
					// TODO: see if you want to implement level 4
					//var possibleAnswersLevel4 = possibleAnswersLevel3[k].getPossibleAnswers();
					//for (var z = 0; z < possibleAnswersLevel4.length; z++) {
					//	levelString[3] += makeStringForTreeGame(possibleAnswersLevel4[z]);
					//}	
				}	
			}
		}
		document.getElementById("gameTreeLevel1").innerHTML = levelString[0];
		document.getElementById("gameTreeLevel2").innerHTML = levelString[1];
		document.getElementById("gameTreeLevel3").innerHTML = levelString[2];
		document.getElementById("gameTreeLevel4").innerHTML = levelString[3];
		
		if (playingGrid.whoseTurn == x) {
			document.querySelector(".level1, .level3").style.backgroundColor = x_background;
			document.querySelector(".level2").style.backgroundColor = o_background;
			document.querySelector(".level3").style.backgroundColor = x_background;
			document.querySelector(".level4").style.backgroundColor = o_background;
		} else {
			document.querySelector(".level1").style.backgroundColor = o_background;
			document.querySelector(".level2").style.backgroundColor = x_background;
			document.querySelector(".level3").style.backgroundColor = o_background;
			document.querySelector(".level4").style.backgroundColor = x_background;
		}
			
		//adjustTreeTablesSize();
	}


	return true;
}

// Executed when the player hits restart button
function restartGame() {

	document.getElementById("turnText").innerHTML = "È il turno delle X";


	playingGrid.reset();
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).innerHTML = "";
		document.getElementById(id).style.cursor = "pointer";
		document.getElementById(id).classList.remove("win-color");
	}
	document.getElementById("gameTreeLevel1").innerHTML = "";
	document.getElementById("gameTreeLevel2").innerHTML = "";
	document.getElementById("gameTreeLevel3").innerHTML = "";
	document.getElementById("gameTreeLevel4").innerHTML = "";
	author_turn = document.querySelector('input[name="X_player"]:checked').value;
	gameOver = false;

	if (author_turn == author_random) {
		setTimeout(handleMove, 1000, author_random, playingGrid.getRandomFreeCell());
	} else if(author_turn == author_computer) {
	setTimeout(handleMove, 1000, author_computer, findBestMove(playingGrid));
	}
}

function announceWinner(text) {
	document.getElementById("winText").innerHTML = text;
	document.getElementById("winAnnounce").style.display = "block";
}

function closeModal(id) {
	document.getElementById(id).style.display = "none";
	restartGame();
}

function endGame(winner) {

	gameOver = true;
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).style.cursor = "default";
	}
	document.getElementById("turnText").innerHTML = "";

	setTimeout(announceWinner, 1000, (winner == xWin) ? "X ha vinto!" : (winner == oWin) ? "O ha vinto!" : "Pareggio!");
}

//==================================
// HELPER FUNCTIONS
//==================================

// Check if two arrays are equal
function areArraysEqual(array1, array2) {
	if (array1.length != array2.length) return false;
	for (var i = 0; i < array1.length; i++) {
		if (array1[i] != array2[i]) return false;
	}
	return true;
}

// Make an HTML string to display a given Grid
function makeStringForTreeGame(treeGrid) {
	var treeTable = '<table id="tree_table_game">\n\t';
	for (var i = 0; i < 3; i++) {
		treeTable += '\t<tr>'
		for (var j = 0; j < 3; j++) {
			var cellid = i * 3 + j;
			treeTable += '<td class="ttd_game"><div id="cell0" class="tree_cell';
			if (treeGrid.winningCells[0] == cellid || treeGrid.winningCells[1] == cellid || treeGrid.winningCells[2] == cellid) {
				treeTable += ' tree_win-color';
			}
			treeTable += '">';
			if (treeGrid.cells[cellid] == x) {
				treeTable += '<span class="tree_x">&times;</class>';
			} else if (treeGrid.cells[cellid] == o) {
				treeTable += '<span class="tree_o">o</class>';
			}
			treeTable += '</div></td>';
		}
		treeTable += '</tr>';
	}
	treeTable += '</table>';

	return treeTable;
}

function findBestMove(grid) {
	var bestMove = null, bestScore = -2;
	for (const move in grid.getFreeCellIndices()) {
		var moveScore = minimax(grid.clone().makeMove(move),0,true);
		if (bestScore>moveScore) {
			bestMove = move;
			bestScore = moveScore;
		}
	}
	return bestMove;
}

function minimax(grid, depth, isMaximizingPlayer) {
	console.log("loading...");
	if (grid.won != noWin) return grid.won;
	if (depth>HARD_LIMIT) return 0;

	if(isMaximizingPlayer) {
		var bestVal = -2, value;
		for (const i of grid.getFreeCellIndices()) {
			value = minimax(board.clone().makeMove(i), depth+1, false);
			bestVal = (bestVal>value)?bestVal:value;
		}
		return bestVal;
	}
	else {
		var bestVal = 2, value;
		for (const i of grid.getFreeCellIndices()) {
			value = minimax(board.clone().makeMove(i), depth+1, true);
			bestVal = (bestVal<value)?bestVal:value;
		}
		return bestVal;
	}
}

// TODO: MAKE WORK FOR SECOND LEVEL!!!!
/*
// Adjust the size of existing tables to fit on the same row
function adjustTreeTablesSize() {

	const allTables = document.querySelectorAll('.ttd_game');
	for (var i = 0; i < allTables.length; i++) {
		// TODO: check all elements to change
		// TODO: check proportion appropiately
		
		allTables[i].style.width = `${60 / ((allTables.length) / 9) / 3}vw`;
		allTables[i].style.height = `${60 / ((allTables.length) / 9) / 3}vw`;
	}
}
*/