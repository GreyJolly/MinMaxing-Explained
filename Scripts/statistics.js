// GLOBAL CONSTANTS

const API_get_URL = 'http://localhost:3000/api/data/get_value';

// GLOBAL VARIABLES

var api_data;

//==================================
// MAIN FUNCTIONS
//==================================

var xChart,
	playerChart,
	randomChart,
	minmaxerChart;

function initialize() {
	updateDataFromAPI();

	const x_chart_context = document.getElementById('x_chart').getContext('2d');
	const player_chart_context = document.getElementById('player_chart').getContext('2d');
	const random_chart_context = document.getElementById('random_chart').getContext('2d');
	const minmaxer_chart_context = document.getElementById('minmaxer_chart').getContext('2d');

	const xData = {
		labels: ['Wins', 'Ties', 'Losses'],
		datasets: [{
			data: [0, 0, 0],
			backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
		}],
	};
	const playerData = {
		labels: ['Wins', 'Ties', 'Losses'],
		datasets: [{
			data: [0, 0, 0],
			backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
		}],
	};
	const randomData = {
		labels: ['Wins', 'Ties', 'Losses'],
		datasets: [{
			data: [0, 0, 0],
			backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
		}],
	};
	const minmaxerData = {
		labels: ['Wins', 'Ties', 'Losses'],
		datasets: [{
			data: [0, 0, 0],
			backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
		}],
	};

	xChart = new Chart(x_chart_context, {
		type: 'pie',
		data: xData,
	});
	playerChart = new Chart(player_chart_context, {
		type: 'pie',
		data: playerData,
	});
	randomChart = new Chart(random_chart_context, {
		type: 'pie',
		data: randomData,
	});
	minmaxerChart = new Chart(minmaxer_chart_context, {
		type: 'pie',
		data: minmaxerData,
	});
	
 	setTimeout(refresh, 500); // If you don't wait for the page to fully load it doesn't work
}

function refresh() {
	api_data = updateDataFromAPI();
	
	// Update the chart data
	xChart.data.datasets[0].data = [api_data.x_winrate, api_data.x_tierate, 100 - (api_data.x_winrate + api_data.x_tierate)];
	playerChart.data.datasets[0].data = [api_data.player_winrate, api_data.player_tierate, (100 - (api_data.player_winrate + api_data.player_tierate))];
	randomChart.data.datasets[0].data = [api_data.random_winrate, api_data.random_tierate, (100 - (api_data.random_winrate + api_data.random_tierate))];
	minmaxerChart.data.datasets[0].data = [api_data.minmaxer_winrate, api_data.minmaxer_tierate, 100 - (api_data.minmaxer_winrate + api_data.minmaxer_tierate)];

	// Refresh the charts
	xChart.update();
	playerChart.update();
	randomChart.update();
	minmaxerChart.update();
}




//==================================
// API HANDLING
//==================================

function updateDataFromAPI() {

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
			api_data = data;
			return api_data;
		})

	return api_data;
}