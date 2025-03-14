// Weather API key
const API_KEY = '9ca16dd5cd4d928980d7f8fea1c09eb0';
// Unsplash API key (using demo key - replace with your own for production)
const UNSPLASH_API_KEY = 'demo';

// Initialize the globe
const globe = Globe()
    .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
    .width(window.innerWidth)
    .height(window.innerHeight)
    (document.getElementById('globe-container'));

// Adjust globe lighting
const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3); // Reduced brightness
globe.scene().add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Reduced brightness
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

// Create dynamic background scene
function createDynamicBackground(weatherType) {
    const background = document.createElement('div');
    background.className = `weather-background ${weatherType}`;
    
    // Remove any existing background
    const oldBackground = document.querySelector('.weather-background');
    if (oldBackground) {
        oldBackground.remove();
    }

    // Create weather-specific elements and animations
    switch(weatherType) {
        case 'clear':
            // Clear sky with moving clouds and sun
            const sun = document.createElement('div');
            sun.className = 'sun-dynamic';
            background.appendChild(sun);

            // Add some sparse clouds
            for (let i = 0; i < 3; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-sparse';
                cloud.style.left = `${Math.random() * 100}%`;
                cloud.style.animationDelay = `${Math.random() * 10}s`;
                background.appendChild(cloud);
            }
            break;

        case 'rainy':
            // Create rain container
            const rainContainer = document.createElement('div');
            rainContainer.className = 'rain-container';
            
            // Add dark clouds
            for (let i = 0; i < 8; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'rain-cloud';
                cloud.style.left = `${Math.random() * 100}%`;
                cloud.style.animationDelay = `${Math.random() * 5}s`;
                background.appendChild(cloud);
            }
            
            // Add raindrops
            for (let i = 0; i < 150; i++) {
                const drop = document.createElement('div');
                drop.className = 'raindrop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDuration = `${Math.random() * 0.5 + 0.7}s`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                rainContainer.appendChild(drop);
            }
            background.appendChild(rainContainer);
            break;

        case 'cloudy':
            // Multiple layers of clouds
            for (let i = 0; i < 12; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-dynamic';
                cloud.style.left = `${Math.random() * 120 - 20}%`;
                cloud.style.top = `${Math.random() * 60}%`;
                cloud.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
                cloud.style.animationDuration = `${Math.random() * 30 + 30}s`;
                cloud.style.animationDelay = `${Math.random() * -30}s`;
                cloud.style.opacity = Math.random() * 0.3 + 0.7;
                background.appendChild(cloud);
            }
            break;

        case 'sunny':
            // Create bright sun with rays
            const brightSun = document.createElement('div');
            brightSun.className = 'sun-bright';
            background.appendChild(brightSun);

            // Add heat waves effect
            const heatWaves = document.createElement('div');
            heatWaves.className = 'heat-waves';
            background.appendChild(heatWaves);

            // Add some light clouds
            for (let i = 0; i < 4; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-light';
                cloud.style.left = `${Math.random() * 100}%`;
                cloud.style.animationDelay = `${Math.random() * 20}s`;
                background.appendChild(cloud);
            }
            break;
    }

    document.body.insertBefore(background, document.body.firstChild);
}

async function getCityImage(cityName) {
    try {
        // First try to get a city-specific image
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName + ' city skyline')}&orientation=landscape&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            }
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
        
        // If no city-specific image, try to get a generic city image
        const fallbackResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=city skyline&orientation=landscape&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            }
        );
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.results && fallbackData.results.length > 0) {
            return fallbackData.results[0].urls.regular;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching city image:', error);
        return null;
    }
}

function createCityBackground(imageUrl) {
    // Remove existing background
    const oldBackground = document.querySelector('.weather-background');
    if (oldBackground) {
        oldBackground.remove();
    }

    const background = document.createElement('div');
    background.className = 'weather-background city-background';
    
    // Create an overlay for weather effects
    const weatherOverlay = document.createElement('div');
    weatherOverlay.className = 'weather-overlay';
    
    // Set the city image as background
    background.style.backgroundImage = `url(${imageUrl})`;
    
    background.appendChild(weatherOverlay);
    document.body.insertBefore(background, document.body.firstChild);
}

async function getWeather(city) {
    try {
        // Fetch weather data
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

        // Get and set city image as background
        const cityImage = await getCityImage(city);
        if (cityImage) {
            createCityBackground(cityImage);
            
            // Add weather overlay effects
            const weatherOverlay = document.querySelector('.weather-overlay');
            const weatherId = data.weather[0].id;
            
            if (weatherId >= 200 && weatherId < 600) {
                weatherOverlay.className = 'weather-overlay rainy';
            } else if (weatherId === 800) {
                weatherOverlay.className = 'weather-overlay clear';
            } else if (weatherId === 801) {
                weatherOverlay.className = 'weather-overlay sunny';
            } else if (weatherId >= 802) {
                weatherOverlay.className = 'weather-overlay cloudy';
            }
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
