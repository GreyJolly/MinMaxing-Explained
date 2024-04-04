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
	xWin = 1,	// THIS CONSTANT ISN'T USED
	oWin = 2,	// THIS CONSTANT ISN'T USED
	tieWin = 3;	// THIS CONSTANT ISN'T USED

// GLOBAL VARIABLES
var
	gameOver = false,
	playingGrid = null;

//==================================
// GRID OBJECT
//==================================

// Grid constructor
//=================
function Grid() {
	this.cells = new Array(9);
	this.moves = 0;
	this.whoseTurn = x;
	this.won = 0; // 0: haven't won yet, 1: X win; 2: O win; 3: tie;
	this.winningCells = [null, null, null];
}

// Grid methods
//=============

Grid.prototype.makeMove = function (lastMovePlayed) {
	if (this.cells[lastMovePlayed] != 0) {
		console.error("Made a move on a full cell!");
		return false;
	}
	if (this.won !== 0) return false;
	this.cells[lastMovePlayed] = this.whoseTurn;
	this.whoseTurn = this.whoseTurn == x ? o : x;
	this.moves++;
	if (this.moves >= 5) {
		var results = this.checkMoveForWin(lastMovePlayed);
		this.won = results[0];
		this.winningCells = results.splice(1);
		if (this.moves >= 9 && this.won == 0) {
			this.won = 3;
		}
	}

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
	this.won = 0; // 0: haven't won yet, 1: X win; 2: O win; 3: tie;
	this.winningCells = [null, null, null];
	return true;
};

Grid.prototype.getPossibleAnswers = function () {
	if (this.won !== 0) return [];
	var possibleAnswers = [];
	var include = true;
	for (var i = 0; i < 9; i++) {
		if (this.cells[i] == 0) {
			var possibleAnswerGrid = this.clone();
			possibleAnswerGrid.makeMove(i);
			
			include = true;
			for (const tempAnswer of possibleAnswers) {
				//console.log("Comparing: "+ tempAnswer.getSymmetries()[0] +" with: "+ possibleAnswerGrid.cells );
				
				var testarray = [];
				testarray.push([0,3,0,0,1,0,0,0,0]);
				console.log("test0: "+ testarray[0] +" possible: "+possibleAnswerGrid.cells);
				
				//if (tempAnswer.getSymmetries().includes(possibleAnswerGrid.cells)) {
				if (testarray[0] == possibleAnswerGrid.cells) {
					console.log("BECCATO");
					include = false;
					break;
				}
			}
			if (include) possibleAnswers.push(possibleAnswerGrid.clone());
		}
	}
	return possibleAnswers;
};

// Check if a game is over and determine the winner and the winning row/column/diagonal
Grid.prototype.checkMoveForWin = function(lastMovePlayed) {
	var stuffToCheck = this.getRowColDiagOfCell(lastMovePlayed);
	var winner;
	// rows
	var row = this.getRowValues(stuffToCheck[0]);
	if (row[0] > 0 && row[0] == row[1] && row[0] == row[2]) {
		if (row[0] == o) {
			winner = [2];
		} else {
			winner = [1];
		}
		// Return the winning row
		winner = winner.concat(this.getRowIndices(stuffToCheck[0]));
		return winner;
	}

	// columns
	var col = this.getColumnValues(stuffToCheck[1]);
	if (col[0] > 0 && col[0] == col[1] && col[0] == col[2]) {
		if (col[0] == o) {
			winner = [2];
		} else {
			winner = [1];
		}
		// Return the winning column
		winner = winner.concat(this.getColumnIndices(stuffToCheck[1]));
		return winner;
	}

	// diagonals

	for (var i = 2; i<=3; i++) {
		if (stuffToCheck[i] !== null) {
			var diagonal = this.getDiagValues(stuffToCheck[i]);
			if (diagonal[0] > 0 && diagonal[0] == diagonal[1] && diagonal[0] == diagonal[2]) {
				if (diagonal[0] == o) {
					winner = [2];
				} else {
					winner = [1];
				}
				// Return the winning diagonal
				winner = winner.concat(this.getDiagIndices(stuffToCheck[i]));
				return winner;
			}
		} else break;
	}

	return [0, null, null, null];
};

Grid.prototype.getSymmetries = function() {
	var symmetries = [this.cells];
	
	// Vertical simmetry
	symmetries.push([this.cells[6], this.cells[7], this.cells[8], this.cells[3], this.cells[4], this.cells[5], this.cells[0], this.cells[1], this.cells[2]]);
	// Horizontal simmetry
	symmetries.push([this.cells[2], this.cells[1], this.cells[0], this.cells[5], this.cells[4], this.cells[3], this.cells[8], this.cells[7], this.cells[6]]);
	// First diagonal simmetry
	symmetries.push([this.cells[0], this.cells[3], this.cells[6], this.cells[1], this.cells[4], this.cells[7], this.cells[2], this.cells[5], this.cells[8]]);
	// Second diagonale simmetry
	symmetries.push([this.cells[8], this.cells[5], this.cells[2], this.cells[7], this.cells[4], this.cells[1], this.cells[6], this.cells[3], this.cells[0]]);

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
	document.getElementById("phase").innerHTML = "It's X's turn";
	playingGrid = new Grid();
	gameOver = false;
	playingGrid.whoseTurn = x;
	for (var i = 0; i < playingGrid.cells.length; i++) {
		playingGrid.cells[i] = 0;
	}
}

// Executed when the user clicks one of the table cells
function cellClicked(id) {
	document.getElementById(id).style.cursor = "default";

	//check turn for the write
	if(playingGrid.whoseTurn == x){
		document.getElementById("phase").innerHTML = "It's O's turn";
	}
	else{
		document.getElementById("phase").innerHTML = "It's X's turn";
	}

	// The last character of the id corresponds to the numeric index in Grid.cells:
	var idName = id.toString();
	var cell = parseInt(idName[idName.length - 1]);

	if (playingGrid.cells[cell] > 0 || gameOver) {
		// cell is already occupied or something else is wrong
		return false;
	}
	if (playingGrid.makeMove(cell) == false) return false;

	if (playingGrid.whoseTurn == o) {
		document.getElementById(id).innerHTML = xText;
		playingGrid.cells[cell] = x;
	} else {
		document.getElementById(id).innerHTML = oText;
		playingGrid.cells[cell] = o;
	}

	document.getElementById("gameTree").innerHTML = "";

	// Test if we have a winner:

	if (playingGrid.won == 1 || playingGrid.won == 2) {
		for (var i = 0; i < playingGrid.winningCells.length; i++) {
			var str = "cell" + playingGrid.winningCells[i];
			document.getElementById(str).classList.add("win-color");
		}
		setTimeout(endGame, 1000, playingGrid.won);
	}
	if (playingGrid.won == 3) {
		setTimeout(endGame, 1000, playingGrid.won);
	}
	var possibleAnswers = playingGrid.getPossibleAnswers();
	for (var i = 0; i < possibleAnswers.length; i++) {
		document.getElementById("gameTree").innerHTML += makeStringForTreeGame(possibleAnswers[i]);
	}
	adjustTreeTablesSize();
	return true;
};

// Executed when the player hits restart button
function restartGame() {

	document.getElementById("phase").innerHTML = "It's X's turn";

	gameOver = false;
	playingGrid.reset();
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).innerHTML = "";
		document.getElementById(id).style.cursor = "pointer";
		document.getElementById(id).classList.remove("win-color");
	}
	document.getElementById("gameTree").innerHTML = "";
	
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
	if (winner == 1) {
		announceWinner("X won!");
	} else if (winner == 2) {
		announceWinner("O won!");
	} else {
		announceWinner("It's a tie!");
	}
	gameOver = true;
	playingGrid.whoseTurn = 0;
	playingGrid.moves = 0;
	for (var i = 0; i < 9; i++) {
		var id = "cell" + i.toString();
		document.getElementById(id).style.cursor = "default";
	}
}

//==================================
// HELPER FUNCTIONS
//==================================

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
		treeTable += '</tr>'
	}
	treeTable += '</table>';

	return treeTable;
}

// Adjust the size of existing tables to fit on the same row
function adjustTreeTablesSize() {

	const allTables = document.querySelectorAll('.ttd_game');
	for (var i = 0; i<allTables.length; i++) {
		// TODO: check all elements to change
		// TODO: check proportion appropiately
		allTables[i].style.width = `${60/((allTables.length)/9)/3}vw`;
		allTables[i].style.height = `${60/((allTables.length)/9)/3}vw`;
	}
}

//phrase for the turn
function displayPhrase(ID, stringa){
    
}