
var citySearch = document.querySelector("#city-search");
var cityBtn = document.querySelector("#city-search-btn");
var cityNameEl = document.querySelector("#city-display");
var cityArray = [];
var apiKey= "4cf54271426a4d88da41801ce8b338ce";

var formHandler = function(event) {
    event.preventDefault();
    var inputtedCity= citySearch
    .value
    .trim()
    .toLowerCase()
    .split("")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join("");

    if (inputtedCity) {
        getLatLong(inputtedCity)
        citySearch.value= "";
    } else {
        alert("You need to enter a city!");
    };
};

var getLatLong = function(city) {

    var currentWeatherAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
   

    fetch(currentWeatherAPI).then(function(response) {
        
        if (response.ok) {
            response.json().then(function(data) {
                
                var lon = data.coord["lon"];
                var lat = data.coord["lat"];
                getCityForecast(city, lon, lat);

                saveCity(city);
                loadCities();
            });
        }   else {
            alert("Error: ${response.statusText}")
        }
    })
    .catch(function(error) {
      console.log(error)
        // alert("Could not load weather");
    })
}

var getCityForecast = function(city, lon, lat) {

    var oneCallAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;

    fetch(oneCallAPI).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                

                // cityNameEl.textContent = "${city} (${moment().format('M/D/YYYY')})";

                currentForecast(data);
                fiveDayForecast(data);
            });
        }
    })
}

var displayTemp = function(element, temperature) {
   
    var temp = document.querySelector(element);
    var elementText = Math.round(temperature);
    temp.textContent = elementText;
}

var currentForecast = function(forecast) {
    console.log(forecast)
    var weatherIconEl = document.querySelector("#today-icon");
    var currentIcon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute("src", `http://openweathermap.org/img/wn/${currentIcon}.png`);
    weatherIconEl.setAttribute("alt", forecast.current.weather[0].main);

    displayTemp("#current-temp", forecast.current.temp);
   
    var currentHumidity = document.querySelector("#current-humidity");
    currentHumidity.textContent = forecast.current.humidity;

    var currentWind = document.querySelector("#current-wind-speed");
    currentWind.textContent = forecast.current.wind_speed;

    var uvi = document.querySelector("#current-uvi")
    var currentUvi = forecast.current.uvi;
    uvi.textContent = currentUvi;
    
    switch (true) {
        case (currentUvi <= 2):
            uvi.className = 'badge badge-success';
            break;
        case (currentUvi <= 7):
            uvi.className = 'badge badge-warning';
            break;
        case (currentUvi >=7):
            uvi.className = 'badge badge-danger';
            break;
    
}
}
var fiveDayForecast = function(forecast) {

    for (var i = 1;i<6; i++) {
        var dateP = document.querySelector("#date-" + i);
        dateP.textContent = moment().add(i, "days").format("M/D/YYYY");

        var iconImg = document.querySelector("#icon-" + i);
        var iconCode = forecast.daily[i].weather[0].icon;
        iconImg.setAttribute("src", `http://openweathermap.org/img/wn/${iconCode}.png`);
        iconImg.setAttribute("alt", forecast.daily[i].weather[0].main);

        displayTemp("#temp-" + i, forecast.daily[i].temp.day);

        var humidity5 = document.querySelector("#humidity-" + i);
        humidity5.textContent = forecast.daily[i].humidity;

        var windSpeed5 = document.querySelector("#wind-speed-" + i);
        windSpeed5.textContent = forecast.daily[i].wind_speed;
    }
}


var saveCity = function(city) {

    for (var i = 0; i < cityArr.length; i++) {
        if (city === cityArr[i]) {
            cityArr.splice(i, 1);
        }
    }

    cityArr.push(city);
    localStorage.setItem("cities", JSON.stringify(cityArr));
}

var loadCities = function() {
    cityArr = JSON.parse(localStorage.getItem('cities'));

    if (!cityArr) {
        cityArr = [];
        return false;
    } else if (cityArr.length > 5) {
        // saves only the five most recent cities
        cityArr.shift();
    }

    var recentCities = document.querySelector('#searched-cities');
    var cityListUl = document.createElement('ul');
    cityListUl.className = 'list-group list-group-flush city-list';
    recentCities.appendChild(cityListUl);

    for (var i = 0; i < cityArr.length; i++) {
        var cityListItem = document.createElement('button');
        cityListItem.setAttribute('type', 'button');
        cityListItem.className = 'list-group-item';
        cityListItem.setAttribute('value', cityArr[i]);
        cityListItem.textContent = cityArr[i];
        cityListUl.prepend(cityListItem);
    }

    var cityList = document.querySelector('.city-list');
    cityList.addEventListener('click', selectRecent)
}

var selectRecent = function(event) {
    var clickedCity = event.target.getAttribute("value");

    getLatLong(clickedCity);
}

loadCities();

cityBtn.addEventListener("click", formHandler)

