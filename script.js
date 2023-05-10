
function injectHTML(list) {
  console.log("fired injectHTML");
  const target = document.querySelector(".police_list");
  target.innerHTML = "";
  list.forEach((item, index) => {
    const str = `<li>${item.station_name}</li>`;
    target.innerHTML += str;
  });
}

function initMap(){
  const carto = L.map('map').setView([38.98, -76.93], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(carto);
return carto;

}

function markerPlace(array,map) {
  console.log('array for markers', array);
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
    marker.bindPopup(popupContent).openPopup();
  });
  
  array.forEach((item) => {
    console.log('markerPLace', item);
    const latitude = item.station_address.latitude
    const longitude = item.station_address.longitude
    L.marker([latitude,longitude]).addTo(map);
  })

}



function station_list(list, query) {
  return list.filter((item) => {
    const lowerCaseName = item.station_name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName === lowerCaseQuery;
  });

}

 /*
  1. When loadButton is clicked, save the data into local storage 
  2. When the page loads, get the data from local storage 
  3. INject hTML 
  4. Pleace map markers 
   */

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  // Add a querySelector that targets your filter button here
  const filterButton = document.querySelector('.filter_button')
  // Get the load button element from the hTML 
  const loadButton = document.querySelector('.load_button'); 

  let currentList = []; // this is "scoped" to the main event function
  
  const station_map = initMap();

  // Retrieve the stored data from local storage
  const storedData = localStorage.getItem("storedData"); 
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0) { 
    console.log("asdasd",parsedData);
  } else {
    console.log("data was not stored");
  }

  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */
  loadButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    
    // This prevents your page from becoming a list of 1000 records from the county, even if your form still has an action set on it
    submitEvent.preventDefault(); 
    
    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('form submission'); 

    /*
      ## GET requests and Javascript
        We would like to send our GET request so we can control what we do with the results
        Let's get those form results before sending off our GET request using the Fetch API
    
      ## Retrieving information from an API
        The Fetch API is relatively new,
        and is much more convenient than previous data handling methods.
        Here we make a basic GET request to the server using the Fetch method to the county
    */

    // Basic GET request - this replaces the form Action
    const results = await fetch('https://data.princegeorgescountymd.gov/resource/qkn8-5mhu.json');


    // This changes the response from the GET into data we can use - an "object"
    currentList = await results.json();

    // This stores the station data in local storage 
    localStorage.setItem("storedData", JSON.stringify(currentList));

    // Place the map markers for the different stations 
    console.log("mapping", currentList, station_map);
    markerPlace(currentList, station_map);
    /*
      This array initially contains all 1,000 records from your request,
      but it will only be defined _after_ the request resolves - any filtering on it before that
      simply won't work.
    */
    console.table(currentList); 

    /* Inject hTML*/ 
  });

  
  filterButton.addEventListener('click', (event) => {
    console.log('clicked FilterButton');

    // Retrieve the search query from the form
    const formData = new FormData(mainForm);
    const formProps = Object.fromEntries(formData);
    const searchQuery = formProps.police;
  
    console.log('Search Query:', searchQuery);
    
    markerPlace(station_list(currentList,searchQuery), station_map);

})
  /*
    Now that you HAVE a list loaded, write an event listener set to your filter button
    it should use the 'new FormData(target-form)' method to read the contents of your main form
    and the Object.fromEntries() method to convert that data to an object we can work with

    When you have the contents of the form, use the placeholder at line 7
    to write a list filter

    Fire it here and filter for the word "pizza"
    you should get approximately 46 results
  */
}

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests