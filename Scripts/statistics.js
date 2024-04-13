const API_get_URL = 'http://localhost:3000/api/data/get_value';

function initialize() {
	
}

function refresh() {
		
	document.getElementById("getme").innerHTML=getObjectFromAPI();
}

//==================================
// API HANDLING
//==================================

function getObjectFromAPI() {
	fetch(API_get_URL, {
		method: 'GET',
		headers: {
			'Accept': 'application/json', // Expect JSON response
		},
	})
		/*.then(response => {
		  if (!response.ok) {
			throw new Error('Network response was not ok');
		  }
		  return response.json();
		})*/
		.then(data => {
			// TODO : ACTUALLY HANDLE RESPONSE
			// Handle the retrieved element (e.g., update a UI element)
			const elementValue = data.element; // Assuming the response contains an "element" key
			console.log("elementValue");
			return elementValue;
		})
		.catch((error) => console.error('Error:', error));
}