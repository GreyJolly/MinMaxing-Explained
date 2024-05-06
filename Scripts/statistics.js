"use strict";

// GLOBAL CONSTANTS

const API_get_URL = 'http://localhost:3000/api/data/get_value';
const backgroundColor = ['#ffce56', '#ff6384', '#36a2eb'];
const labels = ['Vittorie%', 'Pareggi%', 'Sconfitte%'];

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

	updateDataFromAPI();
	setInterval(updateDataFromAPI, 5000);

	document.getElementById("win_label_box").style.background = backgroundColor[0];
	document.getElementById("tie_label_box").style.background = backgroundColor[1];
	document.getElementById("loss_label_box").style.background = backgroundColor[2];

}

function refresh(api_data) {

	var xmlData = (new DOMParser()).parseFromString(api_data, "text/xml");

	const
		x_winrate = Number(xmlData.getElementsByTagName("winrate")[0].childNodes[0].nodeValue),
		x_tierate = Number(xmlData.getElementsByTagName("tierate")[0].childNodes[0].nodeValue),
		player_winrate = Number(xmlData.getElementsByTagName("winrate")[1].childNodes[0].nodeValue),
		player_tierate = Number(xmlData.getElementsByTagName("tierate")[1].childNodes[0].nodeValue),
		random_winrate = Number(xmlData.getElementsByTagName("winrate")[2].childNodes[0].nodeValue),
		random_tierate = Number(xmlData.getElementsByTagName("tierate")[2].childNodes[0].nodeValue),
		minmaxer_winrate = Number(xmlData.getElementsByTagName("winrate")[3].childNodes[0].nodeValue),
		minmaxer_tierate = Number(xmlData.getElementsByTagName("tierate")[3].childNodes[0].nodeValue);

	// Update the chart data
	xChart.data.datasets[0].data = [x_winrate, x_tierate, 100 - (x_winrate + x_tierate)];
	playerChart.data.datasets[0].data = [player_winrate, player_tierate, 100 - (player_winrate + player_tierate)];
	randomChart.data.datasets[0].data = [random_winrate, random_tierate, 100 - (random_winrate + random_tierate)];
	minmaxerChart.data.datasets[0].data = [minmaxer_winrate, minmaxer_tierate, 100 - (minmaxer_winrate + minmaxer_tierate)];

	// Refresh the charts
	xChart.update();
	playerChart.update();
	randomChart.update();
	minmaxerChart.update();
}

//==================================
// API HANDLING
//==================================

async function updateDataFromAPI() {

	await fetch(API_get_URL, {
		method: 'GET',
		headers: {
			'Accept': 'application/xml', // Expect XML response
		},
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(data => refresh(data))
		.catch(error => console.error('Error:', error));
}
