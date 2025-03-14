// Weather API key
const API_KEY = '9ca16dd5cd4d928980d7f8fea1c09eb0';
// Unsplash API key
const UNSPLASH_API_KEY = 'dOPF9oZ1c1orjCY8oQ-12Tzd2wim3aVzlb9EQLgfiA4';

// Wait for the window to load before initializing the globe
window.addEventListener('load', () => {
    console.log('Initializing globe...');
    
    // Initialize the globe
    const globe = Globe()
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl(null)
        .backgroundColor('rgba(0,0,0,0)')
        .width(window.innerWidth)
        .height(window.innerHeight);

    // Get the container and mount the globe
    const container = document.getElementById('globe-container');
    console.log('Container found:', container);
    
    // Mount the globe
    globe(container);
    
    // Configure the globe after mounting
    globe
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 })
        .enablePointerInteraction(true)
        .atmosphereColor('#1a237e')
        .atmosphereAltitude(0.25);

    // Add lights to the scene
    const scene = globe.scene();
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Make renderer background transparent
    globe.renderer().setClearColor(0x000000, 0);
    
    // Enable controls
    globe
        .enableZoom(true)
        .rotateSpeed(0.6)
        .autoRotate(true)
        .autoRotateSpeed(0.5);

    console.log('Globe initialized');

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        globe.width(width).height(height);
    });

    // Initialize search functionality
    initializeSearch(globe);
});

function initializeSearch(globe) {
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
                        focusLocation(globe, parseFloat(result.lat), parseFloat(result.lon));
                    });
                    searchResults.appendChild(div);
                });
            } catch (error) {
                console.error('Error searching locations:', error);
                searchResults.innerHTML = '<div class="search-result-item">Error searching locations. Please try again.</div>';
                searchResults.style.display = 'block';
            }
        }, 300);
    });
}

async function focusLocation(globe, lat, lon) {
    try {
        // Stop auto-rotation
        globe.autoRotate(false);
        
        // Animate to location
        globe.pointOfView({
            lat,
            lng: lon,
            altitude: 1.5
        }, 1000);
        
        // Show loading state
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '<p>Loading weather data...</p>';
        
        // Get weather data
        const weatherData = await getWeather(lat, lon);
        
        // Update weather display
        weatherInfo.innerHTML = `
            <div class="weather-details">
                <h2>${weatherData.name}</h2>
                <div class="temperature">${Math.round(weatherData.main.temp)}°C</div>
                <div class="description">${weatherData.weather[0].description}</div>
                <div>Humidity: ${weatherData.main.humidity}%</div>
                <div>Wind: ${weatherData.wind.speed} m/s</div>
            </div>
        `;
        
        // Create weather effect
        createWeatherEffect(weatherData.weather[0].main);
        
        // Get and set city background
        const cityImage = await getCityImage(weatherData.name);
        if (cityImage) {
            createCityBackground(cityImage);
        }
        
    } catch (error) {
        console.error('Error in focusLocation:', error);
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = `
            <div class="weather-details error">
                <p>Error loading weather data</p>
                <p>Please try again later</p>
            </div>
        `;
    }
    
    // Resume auto-rotation after 10 seconds
    setTimeout(() => {
        globe.autoRotate(true);
    }, 10000);
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
        console.log('Fetching image for:', cityName);
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName + ' city skyline')}&orientation=landscape&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Unsplash API Response:', data);
        
        if (data.results && data.results.length > 0) {
            console.log('Found city image:', data.results[0].urls.regular);
            return data.results[0].urls.regular;
        }
        
        console.log('No specific city image found, trying generic skyline...');
        return null;
    } catch (error) {
        console.error('Error fetching city image:', error);
        console.error('Full error:', error.message);
        return null;
    }
}

function createCityBackground(imageUrl) {
    console.log('Creating city background with URL:', imageUrl);
    
    // Remove any existing backgrounds
    const oldBackgrounds = document.querySelectorAll('.weather-background, .city-background');
    oldBackgrounds.forEach(bg => bg.remove());

    // Create new background div
    const background = document.createElement('div');
    background.className = 'city-background';
    
    // Set inline styles directly
    background.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${imageUrl}');
        background-size: cover;
        background-position: center;
        opacity: 0.7;
        z-index: 1;
    `;
    
    // Add to DOM
    document.body.prepend(background);
    
    console.log('City background added to DOM');
    return background;
}

async function getWeather(lat, lon) {
    try {
        console.log('Fetching weather for:', lat, lon);
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Weather data:', data);
        
        if (!data || !data.weather || !data.weather[0] || !data.main) {
            throw new Error('Invalid weather data format');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

function createWeatherEffect(weatherType) {
    console.log('Creating weather effect for:', weatherType);
    
    // Remove any existing weather effects and backgrounds
    const existingEffects = document.querySelectorAll('.weather-background, .city-background');
    existingEffects.forEach(effect => effect.remove());
    
    const weatherBackground = document.createElement('div');
    weatherBackground.className = 'weather-background';
    
    switch (weatherType) {
        case 'Rain':
            createRainEffect(weatherBackground);
            break;
        case 'Snow':
            createSnowEffect(weatherBackground);
            break;
        case 'Clear':
            createSunEffect(weatherBackground);
            break;
        case 'Clouds':
            createCloudEffect(weatherBackground);
            break;
        default:
            console.log('Unknown weather type:', weatherType);
            return;
    }
    
    document.body.appendChild(weatherBackground);
    console.log('Weather effect created and added to DOM');
}

function createRainEffect(container) {
    for (let i = 0; i < 100; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        raindrop.style.left = `${Math.random() * 100}%`;
        raindrop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        raindrop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(raindrop);
    }
}

function createSnowEffect(container) {
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${3 + Math.random() * 2}s`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(snowflake);
    }
}

function createSunEffect(container) {
    const sun = document.createElement('div');
    sun.className = 'sun-effect';
    container.appendChild(sun);
    
    const rays = document.createElement('div');
    rays.className = 'sun-rays';
    container.appendChild(rays);
}

function createCloudEffect(container) {
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud-effect';
        cloud.style.left = `${20 + i * 30}%`;
        cloud.style.top = `${20 + i * 15}%`;
        cloud.style.animationDelay = `${i * 2}s`;
        container.appendChild(cloud);
    }
}

function showWeather(region) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<h2>Select a city in ${region} region</h2>`;
}

// Add this function after your existing code
async function testUnsplashAPI() {
    try {
        console.log('Testing Unsplash API...');
        const response = await fetch(
            'https://api.unsplash.com/photos/random?count=1',
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Unsplash API test successful:', data);
        return true;
    } catch (error) {
        console.error('Unsplash API test failed:', error);
        return false;
    }
}

// Test the API when the page loads
window.addEventListener('load', () => {
    testUnsplashAPI();
}); 
