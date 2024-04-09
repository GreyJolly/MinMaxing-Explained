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
	xWin = 30,
	oWin = -30,
	tieWin = 0,
	author_player = "player",
	author_random = "random",
	author_minmaxer = "minmaxer",
	x_background = "rgba(0, 255, 255, 0.20)",
	o_background = "rgba(255, 0, 255, 0.20",
	depth_limit = 9;

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

Grid.prototype.getRandomFreeCell = function () {
	var possibleFreeCell;
	do {
		possibleFreeCell = Math.floor(Math.random() * 9);
	} while (this.cells[possibleFreeCell] != 0);
	return possibleFreeCell;
};

Grid.prototype.reset = function () {
	for (var i = 0; i < this.cells.length; i++) {
		this.cells[i] = 0;
	}
	this.moves = 0;
	this.whoseTurn = x;
	this.won = noWin;
	this.winningCells = [null, null, null];
	return true;
}

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

	var cellsMatrix = [[, ,], [, ,], [, ,]];
	const lastRowPlayed = Math.floor(lastMovePlayed / 3), lastColPlayed = lastMovePlayed % 3;
	for (var i = 0; i < 9; i++) {
		cellsMatrix[Math.floor(i / 3)][i % 3] = this.cells[i];
	}

	// Check row
	if (cellsMatrix[lastRowPlayed][0] != 0 && cellsMatrix[lastRowPlayed][0] == cellsMatrix[lastRowPlayed][1] && cellsMatrix[lastRowPlayed][0] == cellsMatrix[lastRowPlayed][2]) {
		return [(cellsMatrix[lastRowPlayed][0] == x) ? [xWin] : [oWin], lastRowPlayed*3, lastRowPlayed*3+1, lastRowPlayed*3+2];
	}
	// Check column
	if (cellsMatrix[0][lastColPlayed] != 0 && cellsMatrix[0][lastColPlayed] == cellsMatrix[1][lastColPlayed] && cellsMatrix[0][lastColPlayed] == cellsMatrix[2][lastColPlayed]) {
		return [(cellsMatrix[0][lastColPlayed] == x) ? [xWin] : [oWin], lastColPlayed, lastColPlayed+3, lastColPlayed+6];
	}
	// Check diagonals
	if (cellsMatrix[0][0] != 0 && cellsMatrix[0][0] == cellsMatrix[1][1] && cellsMatrix[0][0] == cellsMatrix[2][2]) {
		return [(cellsMatrix[0][0] == x) ? [xWin] : [oWin], 0, 4, 8];
	}
	if (cellsMatrix[2][0] != 0 && cellsMatrix[2][0] == cellsMatrix[1][1] && cellsMatrix[2][0] == cellsMatrix[0][2]) {
		return [(cellsMatrix[2][0] == x) ? [xWin] : [oWin], 2, 4, 6];
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
		author_turn = (author_turn == X_player) ? O_player : X_player;

		if (author_turn == author_random) {
			setTimeout(handleMove, 1000, author_random, playingGrid.getRandomFreeCell());
		} else if (author_turn == author_minmaxer) {
			setTimeout(handleMove, 1000, author_minmaxer, findBestMove(playingGrid));
		}

		// Generate game tree
		var possibleAnswers = playingGrid.getPossibleAnswers();
		var levelString = ["", "", "", ""];
		for (var i = 0; i < possibleAnswers.length; i++) {
			levelString[0] += makeStringForTreeGame(possibleAnswers[i].cells, possibleAnswers[i].winningCells);
			var possibleAnswersLevel2 = possibleAnswers[i].getPossibleAnswers();
			for (var j = 0; j < possibleAnswersLevel2.length; j++) {
				levelString[1] += makeStringForTreeGame(possibleAnswers[i].cells, possibleAnswers[i].winningCells);
				var possibleAnswersLevel3 = possibleAnswersLevel2[j].getPossibleAnswers();
				for (var k = 0; k < possibleAnswersLevel3.length; k++) {
					levelString[2] += makeStringForTreeGame(possibleAnswers[i].cells, possibleAnswers[i].winningCells);
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
	} else if (author_turn == author_minmaxer) {
		setTimeout(handleMove, 1000, author_minmaxer, findBestMove(playingGrid));
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
function makeStringForTreeGame(cells, winningCells) {
	var treeTable = '<table id="tree_table_game">\n\t';
	for (var i = 0; i < 3; i++) {
		treeTable += '\t<tr>'
		for (var j = 0; j < 3; j++) {
			var cellid = i * 3 + j;
			treeTable += '<td class="ttd_game"><div id="cell0" class="tree_cell';
			if (winningCells[0] == cellid || winningCells[1] == cellid || winningCells[2] == cellid) {
				treeTable += ' tree_win-color';
			}
			treeTable += '">';
			if (cells[cellid] == x) {
				treeTable += '<span class="tree_x">&times;</class>';
			} else if (cells[cellid] == o) {
				treeTable += '<span class="tree_o">o</class>';
			}
			treeTable += '</div></td>';
		}
		treeTable += '</tr>';
	}
	treeTable += '</table>';

	return treeTable;
}

//==================================
// MINMAXING FUNCTIONS
//==================================

// Warinng! These function have to be quite optimized

function findBestMove(grid) {
	var cellMatrix = [[, ,], [, ,], [, ,]];
	for (var i = 0; i < 9; i++) {
		if (grid.cells[i] != x && grid.cells[i] != o) cellMatrix[Math.floor(i / 3)][i % 3] = 0;
		else cellMatrix[Math.floor(i / 3)][i % 3] = grid.cells[i];
	}

	if (grid.whoseTurn == x) {
		var bestMove, bestScore = -1000;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (cellMatrix[i][j] == 0) {
					cellMatrix[i][j] = grid.whoseTurn;
					var moveScore = minmax(cellMatrix, 1, false, grid.moves + 1, i, j);
					cellMatrix[i][j] = 0;
					if (moveScore > bestScore) {
						bestMove = i * 3 + j
						bestScore = moveScore;
					}
				}
			}
		}
	} else {
		var bestMove, bestScore = 1000;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (cellMatrix[i][j] == 0) {
					cellMatrix[i][j] = grid.whoseTurn;
					var moveScore = minmax(cellMatrix, 0, true, grid.moves + 1, i, j);
					cellMatrix[i][j] = 0;
					if (moveScore < bestScore) {
						bestMove = i * 3 + j
						bestScore = moveScore;
					}
				}
			}
		}
	}
	return bestMove
}

function minmax(cellMatrix, depth, isMaximizingPlayer, movesDone, lastRowPlayed, lastColPlayed) {
	if (depth > depth_limit) return 0;
	var score = evaluate(cellMatrix, lastRowPlayed, lastColPlayed);
	if (score == xWin) return xWin;
	if (score == oWin) return oWin;
	if (movesDone == 9) return tieWin;
	var bestScore;
	if (isMaximizingPlayer) {
		bestScore = -1000;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (cellMatrix[i][j] == 0) {
					cellMatrix[i][j] = x;
					var moveScore = minmax(cellMatrix, depth + 1, false, movesDone + 1, i, j);
					moveScore -= depth;
					bestScore = (bestScore > moveScore) ? bestScore : moveScore;
					cellMatrix[i][j] = 0;
				}
			}
		}
	} else {
		bestScore = 1000;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (cellMatrix[i][j] == 0) {
					cellMatrix[i][j] = o;
					var moveScore = minmax(cellMatrix, depth + 1, true, movesDone + 1, i, j);
					moveScore += depth;
					bestScore = (bestScore < moveScore) ? bestScore : moveScore;
					cellMatrix[i][j] = 0;
				}
			}
		}
	}
	return bestScore;
}

function evaluate(cellsMatrix, lastRowPlayed, lastColPlayed) {
	// Check row
	if (cellsMatrix[lastRowPlayed][0] != 0 && cellsMatrix[lastRowPlayed][0] == cellsMatrix[lastRowPlayed][1] && cellsMatrix[lastRowPlayed][0] == cellsMatrix[lastRowPlayed][2]) {
		return (cellsMatrix[lastRowPlayed][0] == x) ? xWin : oWin;
	}
	// Check column
	if (cellsMatrix[0][lastColPlayed] != 0 && cellsMatrix[0][lastColPlayed] == cellsMatrix[1][lastColPlayed] && cellsMatrix[0][lastColPlayed] == cellsMatrix[2][lastColPlayed]) {
		return (cellsMatrix[0][lastColPlayed] == x) ? xWin : oWin;
	}
	// Check diagonals
	if (cellsMatrix[0][0] != 0 && cellsMatrix[0][0] == cellsMatrix[1][1] && cellsMatrix[0][0] == cellsMatrix[2][2]) {
		return (cellsMatrix[0][0] == x) ? xWin : oWin;
	}
	if (cellsMatrix[2][0] != 0 && cellsMatrix[2][0] == cellsMatrix[1][1] && cellsMatrix[2][0] == cellsMatrix[0][2]) {
		return (cellsMatrix[2][0] == x) ? xWin : oWin;
	}
	return 0;
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