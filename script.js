// Weather API key
const API_KEY = '9ca16dd5cd4d928980d7f8fea1c09eb0';

// Initialize the globe
const globe = Globe()
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .width(window.innerWidth)
    .height(window.innerHeight)
    (document.getElementById('globe-container'));

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xbbbbbb);
globe.scene().add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(1, 1, 1);
globe.scene().add(directionalLight);

// Initialize coordinates
let targetCoords = { lat: 0, lng: 0, altitude: 2.5 };
let currentCoords = { lat: 0, lng: 0, altitude: 2.5 };

// Smooth camera animation
function animateCamera() {
    currentCoords.lat += (targetCoords.lat - currentCoords.lat) * 0.1;
    currentCoords.lng += (targetCoords.lng - currentCoords.lng) * 0.1;
    currentCoords.altitude += (targetCoords.altitude - currentCoords.altitude) * 0.1;
    
    globe.pointOfView(currentCoords);
    
    if (Math.abs(targetCoords.lat - currentCoords.lat) > 0.1 ||
        Math.abs(targetCoords.lng - currentCoords.lng) > 0.1 ||
        Math.abs(targetCoords.altitude - currentCoords.altitude) > 0.1) {
        requestAnimationFrame(animateCamera);
    }
}

// Search functionality
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;
    
    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            
            searchResults.innerHTML = '';
            searchResults.style.display = data.length ? 'block' : 'none';
            
            data.slice(0, 5).forEach(result => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.textContent = result.display_name;
                div.addEventListener('click', () => {
                    searchInput.value = result.display_name;
                    searchResults.style.display = 'none';
                    focusLocation(result.lat, result.lon);
                    getWeather(result.display_name.split(',')[0]);
                });
                searchResults.appendChild(div);
            });
        } catch (error) {
            console.error('Error searching locations:', error);
        }
    }, 300);
});

// Focus on a location
function focusLocation(lat, lng) {
    targetCoords = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        altitude: 1.5
    };
    animateCamera();
}

function createWeatherBackground(weatherType) {
    // Remove existing background
    const oldBackground = document.querySelector('.weather-background');
    if (oldBackground) {
        oldBackground.remove();
    }

    const background = document.createElement('div');
    background.className = `weather-background ${weatherType}`;

    if (weatherType === 'rainy') {
        // Create enhanced rain drops
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
        // Create enhanced sun
        const sun = document.createElement('div');
        sun.className = 'sun';
        background.appendChild(sun);
    } else if (weatherType === 'cloudy') {
        // Create enhanced clouds
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
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
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

        // Focus globe on the city location
        focusLocation(data.coord.lat, data.coord.lon);

    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('weather-info').innerHTML = `
            <h2>Error loading weather data</h2>
            <p>Please try again later</p>
        `;
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    globe
        .width(window.innerWidth)
        .height(window.innerHeight);
});

function showWeather(region) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<h2>Select a city in ${region} region</h2>`;
} 
