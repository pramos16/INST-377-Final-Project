/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#station_list");
    target.innerHTML = "";
    list.forEach((item, index) => {
      const str = `<li>${item.name}</li>`;
      target.innerHTML += str;
    });
  }
  
  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.name.toLowerCase();
      const lowerCaseQuery = query.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
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
    });
    
    array.forEach((item) => {
      console.log('markerPLace', item);
      const {coordinates} = item.station_address;
  
      L.marker((coordinates[1], coordinates[0])).addTo(map);
    })
  
  }
  
  async function mainEvent() {
    // the async keyword means we can make API requests
    const filterDataButton = document.querySelector("#filter");
    const loadDataButton = document.querySelector("#data_load");
    const generateListButton = document.querySelector("#generate");
    const textField = document.querySelector("#resto");
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    generateListButton.classList.add = ("hidden");
  
    const carto = initMap();
  
    const storedData = localStorage.getItem("storedData");
    let parsedData = JSON.parse(storedData);
    if (parsedData?.length > 0) {
      generateListButton.classList.remove('hidden');
    }
  
    let storedList = [];
    let currentList = []; 
  
    loadDataButton.addEventListener("click", async (submitEvent) => {
      console.log("loading data");
      loadAnimation.style.display = "inline-block";
  
      // Basic GET request - this replaces the form Action
      const results = await fetch(
        "https://data.princegeorgescountymd.gov/resource/qkn8-5mhu.json"
      );
  
      // This changes the response from the GET into data we can use - an "object"
      storedList = await results.json();
      localStorage.setItem("storedData", JSON.stringify(storedList));
      parsedData = storedList;
  
      if (parsedData?.length > 0) {
        generateListButton.classList.remove('hidden');
      }
      
      loadAnimation.style.display = "none";
      // console.table(storedList);
    });
  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      console.log(currentList);
      injectHTML(currentList);
      markerPlace(currentList, carto);
    });
  
    textField.addEventListener("input", (event) => {
      console.log("input", event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      markerPlace(newList, carto);
    });
  
    clearDataButton.addEventListener('generate', (event) => {
      console.log('clear browser data');
      localStorage.clear();
      console.log('localStorage Check', localStorage.getItem("storedData"));
    })
  }
  
  document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests
  