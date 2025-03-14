// Weather API key (using OpenWeatherMap API)
const API_KEY = '9ca16dd5cd4d928980d7f8fea1c09eb0';

function createWeatherBackground(weatherType) {
    // Remove existing background
    const oldBackground = document.querySelector('.weather-background');
    if (oldBackground) {
        oldBackground.remove();
    }

    const background = document.createElement('div');
    background.className = `weather-background ${weatherType}`;

    if (weatherType === 'rainy') {
        // Create rain drops
        for (let i = 0; i < 100; i++) {
            const rain = document.createElement('div');
            rain.className = 'rain';
            rain.style.left = `${Math.random() * 100}%`;
            rain.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            rain.style.animationDelay = `${Math.random() * 2}s`;
            rain.style.opacity = Math.random();
            background.appendChild(rain);
        }
    } else if (weatherType === 'sunny') {
        // Create sun
        const sun = document.createElement('div');
        sun.className = 'sun';
        background.appendChild(sun);
    } else if (weatherType === 'cloudy') {
        // Create clouds
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = `${Math.random() * 50}%`;
            cloud.style.left = `${Math.random() * 100}%`;
            cloud.style.width = `${Math.random() * 100 + 100}px`;
            cloud.style.height = `${Math.random() * 30 + 30}px`;
            cloud.style.animationDelay = `${Math.random() * 5}s`;
            background.appendChild(cloud);
        }
    }

    document.body.insertBefore(background, document.body.firstChild);
}

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

        // Set weather background based on weather condition
        const weatherId = data.weather[0].id;
        if (weatherId >= 200 && weatherId < 600) {
            createWeatherBackground('rainy');
        } else if (weatherId >= 800 && weatherId < 802) {
            createWeatherBackground('sunny');
        } else if (weatherId >= 802) {
            createWeatherBackground('cloudy');
        }

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
