// GLOBAL CONSTANTS

const API_get_URL = 'http://localhost:3000/api/data/get_value';

// GLOBAL VARIABLES

var winrates;

//==================================
// MAIN FUNCTIONS
//==================================

function initialize() {

}

function refresh() {
	console.log(updateWinratesFromAPI());
	document.getElementById("x_winrate").innerHTML = winrates.x_winrate;
}

//==================================
// API HANDLING
//==================================

function updateWinratesFromAPI() {

	fetch(API_get_URL, {
		method: 'GET',
		headers: {
			'Accept': 'application/json', // Expect JSON response
		},
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			winrates = data;
			return winrates;
		})

	return winrates;
}