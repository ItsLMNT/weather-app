// Weather API key (using OpenWeatherMap API)
const API_KEY = '9ca16dd5cd4d928980d7f8fea1c09eb0';

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},pt&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        
        // Update the weather display
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = `
            <div class="weather-details">
                <h2>${city}</h2>
                <div class="temperature">${Math.round(data.main.temp)}°C</div>
                <div class="description">${data.weather[0].description}</div>
                <div>Humidity: ${data.main.humidity}%</div>
                <div>Wind: ${data.wind.speed} km/h</div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('weather-info').innerHTML = `
            <h2>Error loading weather data</h2>
            <p>Please try again later</p>
        `;
    }
}

function showWeather(region) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<h2>Select a city in ${region} region</h2>`;
}

// Add event listener for the login button (non-functional)
document.querySelector('.login-btn').addEventListener('click', () => {
    alert('Login functionality is not implemented in this demo');
}); 