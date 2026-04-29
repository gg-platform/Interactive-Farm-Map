import L from 'leaflet';
import { 
    provideFluentDesignSystem, 
    fluentButton, 
    fluentSwitch,
    fluentTextField,
    fluentTextArea,
    fluentNumberField
} from '@fluentui/web-components';

// Register Fluent UI components
provideFluentDesignSystem().register(
    fluentButton(),
    fluentSwitch(),
    fluentTextField(),
    fluentTextArea(),
    fluentNumberField()
);

// Admin mode state
let isAdminMode = false;
let currentEditingPOI = null;

// Data storage
let poiData = [];
let settings = {
    showLabelsDefault: false,
    showAdminButton: false
};

// Map variables
let map;
let userMarker;
let watchId;
let poiMarkers = [];

// Default location (Got Greens Farm, Old Gloucester Rd, Winterbourne, Bristol BS36 1RZ)
const DEFAULT_LOCATION = {
    lat: 51.5333009704,
    lng: -2.5289344788,
    zoom: 17
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadConfig();
    setupEventListeners();
});

// Initialize Leaflet map
function initMap() {
    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng], DEFAULT_LOCATION.zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(map);

    // Request user location
    if ('geolocation' in navigator) {
        requestUserLocation();
    }
}

// Request and track user location
function requestUserLocation() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateUserLocation(latitude, longitude);
            map.setView([latitude, longitude], DEFAULT_LOCATION.zoom);
        },
        (error) => {
            console.error('Error getting location:', error);
            showLocationError(error);
        },
        options
    );

    // Watch position for continuous updates
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateUserLocation(latitude, longitude);
        },
        (error) => {
            console.error('Error watching location:', error);
        },
        options
    );
}

// Update user location marker
function updateUserLocation(lat, lng) {
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        userMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('You are here');
    }
}

// Show location error
function showLocationError(error) {
    let message = 'Unable to get your location';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
    }
    
    // Just log the error, don't show popup
    console.log('Location error:', message);
}

// Load config from JSON file
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            const data = await response.json();
            poiData = data.pois || [];
            settings = data.settings || settings;
            applySettings();
            renderPOIs();
        } else {
            console.error('Config file not found, using defaults');
            initializeDefaultPOIs();
        }
    } catch (e) {
        console.error('Error loading config:', e);
        initializeDefaultPOIs();
    }
}

// Initialize default POIs
function initializeDefaultPOIs() {
    poiData = [
        {
            id: 'market-garden',
            label: 'Market Garden',
            description: '600 square meter no-dig market garden with 60 beds growing diverse organic produce',
            url: 'https://www.gotgreens.farm/point-of-interest/market-garden',
            lat: 51.5335,
            lng: -2.5285
        },
        {
            id: 'cider-orchard',
            label: 'Cider Orchard',
            description: 'Traditional orchard with diverse apple varieties for eating and cider making',
            url: 'https://www.gotgreens.farm/point-of-interest/cider-orchard',
            lat: 51.5330,
            lng: -2.5295
        },
        {
            id: 'outdoor-kitchen',
            label: 'Outdoor Kitchen',
            description: 'Communal outdoor cooking space for farm-fresh meals and workshops',
            url: 'https://www.gotgreens.farm/point-of-interest/outdoor-kitchen',
            lat: 51.5333,
            lng: -2.5288
        },
        {
            id: 'bradley-brook',
            label: 'Bradley Brook',
            description: 'Blue corridor connecting to local nature reserves, habitat for eels and wildlife',
            url: 'https://www.gotgreens.farm/point-of-interest/bradley-brook',
            lat: 51.5338,
            lng: -2.5290
        },
        {
            id: 'bats',
            label: 'Bats',
            description: 'Bat roost and habitat area with mature oak trees supporting multiple bat species',
            url: 'https://www.gotgreens.farm/point-of-interest/bats',
            lat: 51.5328,
            lng: -2.5292
        },
        {
            id: 'coppice',
            label: 'Coppice',
            description: 'Traditional woodland management area with 420 native trees and osier willow',
            url: 'https://www.gotgreens.farm/point-of-interest/coppice',
            lat: 51.5336,
            lng: -2.5282
        },
        {
            id: 'solar-power',
            label: 'Solar Power',
            description: 'Off-grid solar power system demonstrating sustainable energy solutions',
            url: 'https://www.gotgreens.farm/point-of-interest/solar-power',
            lat: 51.5333,
            lng: -2.5290
        },
        {
            id: 'mushroom-bed',
            label: 'Mushroom Bed',
            description: 'Mushroom cultivation area for growing edible fungi',
            url: 'https://www.gotgreens.farm/point-of-interest/mushroom-bed',
            lat: 51.5332,
            lng: -2.5286
        },
        {
            id: 'historic-pond',
            label: 'Historic Pond',
            description: 'Traditional dew pond being restored to support wildlife and biodiversity',
            url: 'https://www.gotgreens.farm/point-of-interest/historic-pond',
            lat: 51.5337,
            lng: -2.5297
        },
        {
            id: 'wildflower-circle',
            label: 'Wildflower Circle',
            description: 'Wildflower meadow with native species supporting pollinators',
            url: 'https://www.gotgreens.farm/point-of-interest/wildflower-circle',
            lat: 51.5334,
            lng: -2.5284
        },
        {
            id: 'herb-garden',
            label: 'Herb Garden',
            description: 'Perennial herb garden demonstrating permaculture principles',
            url: 'https://www.gotgreens.farm/point-of-interest/herb-garden',
            lat: 51.5331,
            lng: -2.5287
        },
        {
            id: 'spuds-oak',
            label: "Spud's Oak",
            description: 'Notable oak tree landmark on the farm',
            url: 'https://www.gotgreens.farm/point-of-interest/spuds-oak',
            lat: 51.5335,
            lng: -2.5293
        }
    ];
    renderPOIs();
}

// Render POI markers on map
function renderPOIs() {
    // Clear existing markers
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers = [];

    // Add new markers
    poiData.forEach(poi => {
        // Create marker with label
        const labelHTML = settings.showLabelsDefault ? 
            `<div class="custom-marker"></div><div class="marker-label-permanent">${poi.label}</div>` :
            `<div class="custom-marker"></div>`;
        
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: labelHTML,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([poi.lat, poi.lng], { icon, draggable: isAdminMode })
            .addTo(map)
            .bindPopup(`
                <div>
                    <h3>${poi.label}</h3>
                    <p>${poi.description}</p>
                    ${!isAdminMode ? `<fluent-button appearance="accent" onclick="openContentModal('${poi.url}', '${poi.label}')">Learn More</fluent-button>` : ''}
                </div>
            `);

        if (isAdminMode) {
            marker.on('dragend', (e) => {
                const position = e.target.getLatLng();
                poi.lat = position.lat;
                poi.lng = position.lng;
                saveConfig();
            });

            marker.on('click', () => {
                openEditModal(poi);
            });
        }

        poiMarkers.push(marker);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Locate button
    document.getElementById('locate-btn').addEventListener('click', () => {
        if (userMarker) {
            map.setView(userMarker.getLatLng(), DEFAULT_LOCATION.zoom);
            userMarker.openPopup();
        } else {
            requestUserLocation();
        }
    });

    // Admin toggle
    document.getElementById('admin-toggle').addEventListener('click', toggleAdminMode);

    // Exit admin
    document.getElementById('exit-admin').addEventListener('click', () => {
        isAdminMode = false;
        toggleAdminMode();
    });

    // Add location
    document.getElementById('add-location').addEventListener('click', () => {
        const center = map.getCenter();
        openEditModal({
            id: '',
            label: '',
            description: '',
            url: '',
            lat: center.lat,
            lng: center.lng
        });
    });

    // Settings toggles
    document.getElementById('show-labels-toggle').addEventListener('change', (e) => {
        settings.showLabelsDefault = e.target.checked;
        renderPOIs(); // Re-render to show/hide labels
        saveConfig();
    });
    
    document.getElementById('show-admin-toggle').addEventListener('change', (e) => {
        settings.showAdminButton = e.target.checked;
        applySettings();
        saveConfig();
    });

    // Modal form
    document.getElementById('poi-form').addEventListener('submit', savePOI);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('delete-poi').addEventListener('click', deletePOI);

    // Close modal on outside click
    document.getElementById('poi-modal').addEventListener('click', (e) => {
        if (e.target.id === 'poi-modal') {
            closeModal();
        }
    });

    // Content modal close
    document.getElementById('content-close-btn').addEventListener('click', closeContentModal);
    document.getElementById('content-modal').addEventListener('click', (e) => {
        if (e.target.id === 'content-modal') {
            closeContentModal();
        }
    });

    // Admin mode keyboard shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            toggleAdminMode();
        }
    });
}

// Toggle admin mode
function toggleAdminMode() {
    isAdminMode = !isAdminMode;
    document.getElementById('admin-controls').style.display = isAdminMode ? 'block' : 'none';
    renderPOIs(); // Re-render markers with/without drag
}

// Apply settings
function applySettings() {
    document.getElementById('admin-toggle').style.display = 
        settings.showAdminButton ? 'flex' : 'none';
    document.getElementById('show-labels-toggle').checked = settings.showLabelsDefault;
    document.getElementById('show-admin-toggle').checked = settings.showAdminButton;
}

// Open edit modal
function openEditModal(poi) {
    currentEditingPOI = poi;
    document.getElementById('modal-title').textContent = 
        poi.id ? 'Edit Location' : 'Add Location';
    
    document.getElementById('poi-id').value = poi.id || '';
    document.getElementById('poi-label').value = poi.label || '';
    document.getElementById('poi-description').value = poi.description || '';
    document.getElementById('poi-url').value = poi.url || '';
    document.getElementById('poi-lat').value = poi.lat || '';
    document.getElementById('poi-lng').value = poi.lng || '';
    
    document.getElementById('delete-poi').style.display = poi.id ? 'block' : 'none';
    document.getElementById('poi-modal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('poi-modal').classList.remove('active');
    currentEditingPOI = null;
}

// Save POI
function savePOI(e) {
    e.preventDefault();
    
    const updatedPOI = {
        id: document.getElementById('poi-id').value,
        label: document.getElementById('poi-label').value,
        description: document.getElementById('poi-description').value,
        url: document.getElementById('poi-url').value,
        lat: parseFloat(document.getElementById('poi-lat').value),
        lng: parseFloat(document.getElementById('poi-lng').value)
    };

    const existingIndex = poiData.findIndex(p => p.id === currentEditingPOI.id);
    if (existingIndex >= 0) {
        poiData[existingIndex] = updatedPOI;
    } else {
        poiData.push(updatedPOI);
    }

    saveConfig();
    renderPOIs();
    closeModal();
}

// Delete POI
function deletePOI() {
    if (confirm(`Delete ${currentEditingPOI.label}?`)) {
        poiData = poiData.filter(p => p.id !== currentEditingPOI.id);
        saveConfig();
        renderPOIs();
        closeModal();
    }
}

// Save config
async function saveConfig() {
    const data = {
        settings,
        pois: poiData,
        lastUpdated: new Date().toISOString()
    };

    try {
        // Save to API endpoint (writes to config.json file)
        const response = await fetch('/api/save-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Config saved to file successfully');
        } else {
            console.error('Failed to save config:', await response.text());
        }
    } catch (error) {
        console.error('Error saving config:', error);
    }
}

// Open content modal with iframe
function openContentModal(url, title) {
    document.getElementById('content-title').textContent = title;
    document.getElementById('content-frame').src = url;
    document.getElementById('content-modal').classList.add('active');
}

// Close content modal
function closeContentModal() {
    document.getElementById('content-modal').classList.remove('active');
    document.getElementById('content-frame').src = '';
}

// Make openContentModal available globally for popup buttons
window.openContentModal = openContentModal;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});
