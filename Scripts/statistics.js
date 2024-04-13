const API_get_URL = 'http://localhost:3000/api/data/get_value';

function initialize() {

}

function refresh() {
	getObjectFromAPI();
}

//==================================
// API HANDLING
//==================================

function getObjectFromAPI() {
	var elementValue;

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
			// TODO : ACTUALLY HANDLE RESPONSE
			// Handle the retrieved element (e.g., update a UI element)
			elementValue = data.element; // Assuming the response contains an "element" key
			
			document.getElementById("getme").innerHTML = elementValue;
			return elementValue;
		})

	return elementValue;
}