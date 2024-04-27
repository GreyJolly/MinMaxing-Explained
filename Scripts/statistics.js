// GLOBAL CONSTANTS

const API_get_URL = 'http://localhost:3000/api/data/get_value';
const backgroundColor =  ['#ffce56','#ff6384','#36a2eb'];
const labels = ['Vittorie' , 'Pareggi', 'Sconfitte'];

const xData = {
	labels: labels,
	datasets: [{
		data: [0, 0, 0],
		backgroundColor: backgroundColor,
	}],

};
const playerData = {
	labels: labels,
	datasets: [{
		data: [0, 0, 0],
		backgroundColor: backgroundColor,
	}],
};
const randomData = {
	labels: labels,
	datasets: [{
		data: [0, 0, 0],
		backgroundColor: backgroundColor,
	}],
};
const minmaxerData = {
	labels: labels,
	datasets: [{
		data: [0, 0, 0],
		backgroundColor: backgroundColor,
	}],
};

const options = {
	legend: {
		labels: {
			fontColor: 'white'
		},
		display: false 
	}
}

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

	xChart = new Chart(x_chart_context, {
		type: 'pie',
		data: xData,
		options: options,
	});
	playerChart = new Chart(player_chart_context, {
		type: 'pie',
		data: playerData,
		options: options,
	});
	randomChart = new Chart(random_chart_context, {
		type: 'pie',
		data: randomData,
		options: options,
	});
	minmaxerChart = new Chart(minmaxer_chart_context, {
		type: 'pie',
		data: minmaxerData,
		options: options,
	});

	setTimeout(refresh, 550); // If you don't wait for the page to fully load it doesn't work

	document.getElementById("win_label_box").style.background = backgroundColor[0];
	document.getElementById("tie_label_box").style.background = backgroundColor[1];
	document.getElementById("loss_label_box").style.background = backgroundColor[2];
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