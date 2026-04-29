// Admin mode state
let isAdminMode = false;
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;
let currentEditingPOI = null;

// Data storage
let poiData = [];
let availableMaps = [];
let activeMapId = 'default';
let settings = {
    showLabelsDefault: false,
    showAdminButton: true
};
const CONFIG_FILE = 'config.json';
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Load config from JSON file
async function loadConfig() {
    try {
        // Try loading from config file first
        const response = await fetch(CONFIG_FILE);
        if (!response.ok) {
            throw new Error('Config file not found');
        }
        const data = await response.json();
        
        poiData = data.pois || [];
        availableMaps = data.maps || [];
        activeMapId = data.activeMapId || 'default';
        settings = data.settings || { showLabelsDefault: false, showAdminButton: true };
        
        // In production, also check localStorage for any updates
        if (!isDevelopment) {
            const saved = localStorage.getItem('farmMapData');
            if (saved) {
                const savedData = JSON.parse(saved);
                if (new Date(savedData.lastUpdated) > new Date(data.lastUpdated || 0)) {
                    console.log('Loading more recent data from localStorage');
                    poiData = savedData.pois || poiData;
                    availableMaps = savedData.maps || availableMaps;
                    activeMapId = savedData.activeMapId || activeMapId;
                    settings = savedData.settings || settings;
                }
            }
        }
        
        // Update active map image
        const activeMap = availableMaps.find(m => m.id === activeMapId);
        if (activeMap) {
            document.querySelector('.farm-image').src = activeMap.dataUrl || activeMap.filename;
        }
        
        // Apply settings
        applySettings();
        
        // Rebuild markers from loaded data
        rebuildMarkers();
    } catch (e) {
        console.error('Error loading config:', e);
        
        // Try localStorage as fallback (production mode)
        const saved = localStorage.getItem('farmMapData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                poiData = data.pois || [];
                availableMaps = data.maps || [];
                activeMapId = data.activeMapId || 'default';
                settings = data.settings || { showLabelsDefault: false, showAdminButton: true };
                
                const activeMap = availableMaps.find(m => m.id === activeMapId);
                if (activeMap) {
                    document.querySelector('.farm-image').src = activeMap.dataUrl || activeMap.filename;
                }
                
                applySettings();
                rebuildMarkers();
                console.log('Loaded config from localStorage');
            } catch (err) {
                console.error('Error loading from localStorage:', err);
                initializePOIData();
            }
        } else {
            // Fallback to initializing from HTML
            initializePOIData();
        }
    }
}

// Save config to JSON file
async function saveConfig() {
    const data = {
        settings: settings,
        activeMapId: activeMapId,
        pois: poiData,
        maps: availableMaps,
        lastUpdated: new Date().toISOString()
    };
    
    console.log('Saving config, isDevelopment:', isDevelopment);
    
    if (isDevelopment) {
        // Development mode: save to file via API
        try {
            console.log('Sending save request to /api/save-config');
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, null, 2)
            });
            
            console.log('Save response status:', response.status);
            const result = await response.json();
            if (result.success) {
                console.log('✅ Config saved to config.json');
                return true;
            } else {
                console.error('Failed to save config:', result.error);
                return false;
            }
        } catch (e) {
            console.error('Error saving config:', e);
            return false;
        }
    } else {
        // Production mode (GitHub Pages): use localStorage
        try {
            localStorage.setItem('farmMapData', JSON.stringify(data));
            console.log('✅ Config saved to localStorage (production mode)');
            console.log('💡 To persist changes, export your data and commit to GitHub');
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }
}

// Apply settings to UI
function applySettings() {
    const body = document.body;
    if (settings.showLabelsDefault) {
        body.classList.add('show-labels-default');
    } else {
        body.classList.remove('show-labels-default');
    }
    
    // Update toggles in admin panel
    const showLabelsToggle = document.getElementById('show-labels-toggle');
    if (showLabelsToggle) {
        showLabelsToggle.checked = settings.showLabelsDefault;
    }
    
    const showAdminToggle = document.getElementById('show-admin-toggle');
    if (showAdminToggle) {
        showAdminToggle.checked = settings.showAdminButton;
    }
    
    // Show/hide admin button
    const adminToggle = document.getElementById('admin-toggle');
    if (adminToggle) {
        adminToggle.style.display = settings.showAdminButton ? 'inline-block' : 'none';
    }
}

// Initialize POI data from HTML (fallback)
function initializePOIData() {
    const markers = document.querySelectorAll('.poi-marker');
    poiData = [];
    const positions = {};
    
    markers.forEach(marker => {
        const poi = marker.getAttribute('data-poi');
        const label = marker.querySelector('.marker-label').textContent;
        const top = marker.style.top;
        const left = marker.style.left;
        
        poiData.push({
            id: poi,
            label: label,
            description: 'Click to learn more about this area of the farm.',
            url: `https://www.gotgreens.farm/point-of-interest/${poi}`
        });
        
        positions[poi] = { top, left };
    });
    
    availableMaps = [
        { 
            id: 'default', 
            filename: 'farm-map.jpg', 
            name: 'Default Map', 
            active: true,
            positions: positions
        }
    ];
}

// Rebuild markers from POI data
function rebuildMarkers() {
    const container = document.querySelector('.map-container');
    
    // Remove existing markers
    const existingMarkers = container.querySelectorAll('.poi-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Get active map and its positions
    const activeMap = availableMaps.find(m => m.id === activeMapId);
    if (!activeMap || !activeMap.positions) {
        console.error('Active map or positions not found');
        return;
    }
    
    // Create new markers
    poiData.forEach(poi => {
        const position = activeMap.positions[poi.id];
        if (position) {
            const marker = createMarkerElement(poi, position);
            container.appendChild(marker);
        }
    });
    
    // Reinitialize event listeners
    setupMarkerListeners();
}

// Create a marker element
function createMarkerElement(poi, position) {
    const marker = document.createElement('div');
    marker.className = 'poi-marker';
    marker.setAttribute('data-poi', poi.id);
    marker.style.top = position.top;
    marker.style.left = position.left;
    
    const dot = document.createElement('div');
    dot.className = 'marker-dot';
    
    const label = document.createElement('div');
    label.className = 'marker-label';
    label.textContent = poi.label;
    
    // Create info popup for hover
    const infoPopup = document.createElement('div');
    infoPopup.className = 'poi-info-popup';
    infoPopup.innerHTML = `
        <h3>${poi.label}</h3>
        <p>${poi.description || 'Learn more about this area.'}</p>
        <button class="dig-deeper-btn" data-url="${poi.url}">Dig Deeper \u2192</button>
    `;
    
    marker.appendChild(dot);
    marker.appendChild(label);
    marker.appendChild(infoPopup);
    
    return marker;
}

// Position popup to avoid clipping at screen edges
function positionPopup(marker) {
    const popup = marker.querySelector('.poi-info-popup');
    if (!popup) return;
    
    const markerRect = marker.getBoundingClientRect();
    const popupWidth = popup.offsetWidth || 300;
    const popupHeight = popup.offsetHeight || 200;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate default position (below marker, centered)
    let top = markerRect.bottom + 10;
    let left = markerRect.left + (markerRect.width / 2) - (popupWidth / 2);
    
    // Adjust horizontal position if it would overflow
    if (left + popupWidth > viewportWidth - 20) {
        left = viewportWidth - popupWidth - 20;
    }
    if (left < 20) {
        left = 20;
    }
    
    // Adjust vertical position if it would overflow (show above marker instead)
    if (top + popupHeight > viewportHeight - 20) {
        top = markerRect.top - popupHeight - 10;
        
        // If still overflows, position at bottom of viewport
        if (top < 20) {
            top = Math.min(markerRect.bottom + 10, viewportHeight - popupHeight - 20);
        }
    }
    
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
}

// Setup marker event listeners
function setupMarkerListeners() {
    const markers = document.querySelectorAll('.poi-marker');
    
    markers.forEach((marker, index) => {
        // Hover event for desktop
        marker.addEventListener('mouseenter', function(e) {
            if (!isAdminMode) {
                this.classList.add('active');
                positionPopup(this);
            }
        });
        
        marker.addEventListener('mouseleave', function() {
            if (!isAdminMode) {
                this.classList.remove('active');
            }
        });
        
        // Click event
        marker.addEventListener('click', function(e) {
            if (isAdminMode) {
                e.preventDefault();
                return;
            }
            
            // Toggle active state on mobile
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                
                // Close other markers
                markers.forEach(m => {
                    if (m !== this) m.classList.remove('active');
                });
                
                this.classList.toggle('active');
                if (this.classList.contains('active')) {
                    positionPopup(this);
                }
            }
        });
        
        // Dig deeper button click
        marker.addEventListener('click', function(e) {
            if (e.target.classList.contains('dig-deeper-btn')) {
                e.stopPropagation();
                const url = e.target.getAttribute('data-url');
                window.location.href = url;
            }
        });
        
        // Double-click to edit in admin mode
        marker.addEventListener('dblclick', function(e) {
            if (isAdminMode) {
                e.preventDefault();
                const poiId = this.getAttribute('data-poi');
                openPOIModal(poiId);
            }
        });
        
        // Keyboard navigation
        marker.setAttribute('tabindex', index + 1);
        marker.setAttribute('role', 'button');
        marker.setAttribute('aria-label', marker.querySelector('.marker-label').textContent);
        
        marker.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isAdminMode) {
                    const btn = this.querySelector('.dig-deeper-btn');
                    if (btn) {
                        window.location.href = btn.getAttribute('data-url');
                    }
                }
            }
        });
    });
    
    // Close popups when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.poi-marker') && !isAdminMode) {
            markers.forEach(m => m.classList.remove('active'));
        }
    });
}

// Initialize on load
window.addEventListener('load', function() {
    loadConfig();
    console.log('Got Greens Farm Map loaded successfully');
});

// ============= ADMIN MODE FUNCTIONALITY =============

// Admin mode toggle
const adminToggle = document.getElementById('admin-toggle');
const adminControls = document.getElementById('admin-controls');
const exitAdminBtn = document.getElementById('exit-admin');
const showLabelsToggle = document.getElementById('show-labels-toggle');

adminToggle.addEventListener('click', function() {
    toggleAdminMode(true);
});

exitAdminBtn.addEventListener('click', function() {
    toggleAdminMode(false);
});

// Show labels toggle
showLabelsToggle.addEventListener('change', function() {
    settings.showLabelsDefault = this.checked;
    applySettings();
    saveConfig();
});

// Show admin button toggle
const showAdminToggle = document.getElementById('show-admin-toggle');
showAdminToggle.addEventListener('change', function() {
    settings.showAdminButton = this.checked;
    applySettings();
    saveConfig();
});

function toggleAdminMode(enable) {
    isAdminMode = enable;
    
    if (enable) {
        adminToggle.style.display = 'none';
        adminControls.style.display = 'block';
        document.body.classList.add('admin-mode');
        enableDragging();
    } else {
        adminToggle.style.display = settings.showAdminButton ? 'inline-block' : 'none';
        adminControls.style.display = 'none';
        document.body.classList.remove('admin-mode');
        disableDragging();
    }
}

// Dragging functionality
function enableDragging() {
    const poiMarkers = document.querySelectorAll('.poi-marker');
    poiMarkers.forEach(marker => {
        marker.style.cursor = 'move';
        marker.classList.add('draggable');
        
        marker.addEventListener('mousedown', startDrag);
        marker.addEventListener('touchstart', startDragTouch);
    });
}

function disableDragging() {
    const poiMarkers = document.querySelectorAll('.poi-marker');
    poiMarkers.forEach(marker => {
        marker.style.cursor = 'pointer';
        marker.classList.remove('draggable');
        
        marker.removeEventListener('mousedown', startDrag);
        marker.removeEventListener('touchstart', startDragTouch);
    });
}

function startDrag(e) {
    if (!isAdminMode) return;
    
    draggedElement = e.target.closest('.poi-marker');
    if (!draggedElement) return;
    
    const rect = draggedElement.getBoundingClientRect();
    const container = document.querySelector('.map-container').getBoundingClientRect();
    
    offsetX = e.clientX - rect.left - rect.width / 2;
    offsetY = e.clientY - rect.top - rect.height / 2;
    
    draggedElement.classList.add('dragging');
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    e.preventDefault();
}

function startDragTouch(e) {
    if (!isAdminMode) return;
    
    draggedElement = e.target.closest('.poi-marker');
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    const rect = draggedElement.getBoundingClientRect();
    
    offsetX = touch.clientX - rect.left - rect.width / 2;
    offsetY = touch.clientY - rect.top - rect.height / 2;
    
    draggedElement.classList.add('dragging');
    
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', stopDragTouch);
    
    e.preventDefault();
}

function drag(e) {
    if (!draggedElement) return;
    
    const container = document.querySelector('.map-container');
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left - offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - offsetY) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    draggedElement.style.left = clampedX + '%';
    draggedElement.style.top = clampedY + '%';
}

function dragTouch(e) {
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    const container = document.querySelector('.map-container');
    const rect = container.getBoundingClientRect();
    
    const x = ((touch.clientX - rect.left - offsetX) / rect.width) * 100;
    const y = ((touch.clientY - rect.top - offsetY) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    draggedElement.style.left = clampedX + '%';
    draggedElement.style.top = clampedY + '%';
    
    e.preventDefault();
}

function stopDrag() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        
        // Update position in active map
        const poiId = draggedElement.getAttribute('data-poi');
        const activeMap = availableMaps.find(m => m.id === activeMapId);
        if (activeMap && activeMap.positions) {
            if (!activeMap.positions[poiId]) {
                activeMap.positions[poiId] = {};
            }
            activeMap.positions[poiId].top = draggedElement.style.top;
            activeMap.positions[poiId].left = draggedElement.style.left;
            console.log(`Updated ${poiId} position:`, activeMap.positions[poiId]);
            saveConfig();
        } else {
            console.error('Could not save position - activeMap or positions not found', { activeMap, activeMapId });
        }
        
        draggedElement = null;
    }
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function stopDragTouch() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        
        // Update position in active map
        const poiId = draggedElement.getAttribute('data-poi');
        const activeMap = availableMaps.find(m => m.id === activeMapId);
        if (activeMap && activeMap.positions) {
            if (!activeMap.positions[poiId]) {
                activeMap.positions[poiId] = {};
            }
            activeMap.positions[poiId].top = draggedElement.style.top;
            activeMap.positions[poiId].left = draggedElement.style.left;
            console.log(`Updated ${poiId} position:`, activeMap.positions[poiId]);
            saveConfig();
        } else {
            console.error('Could not save position - activeMap or positions not found', { activeMap, activeMapId });
        }
        
        draggedElement = null;
    }
    
    document.removeEventListener('touchmove', dragTouch);
    document.removeEventListener('touchend', stopDragTouch);
}

// ============= POI MANAGEMENT =============

// Add location button
document.getElementById('add-location').addEventListener('click', function() {
    openPOIModal(null);
});

// Open POI modal for add/edit
function openPOIModal(poiId) {
    const modal = document.getElementById('poi-modal');
    const form = document.getElementById('poi-form');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('delete-poi');
    
    currentEditingPOI = poiId;
    
    if (poiId) {
        // Edit mode
        const poi = poiData.find(p => p.id === poiId);
        if (!poi) return;
        
        // Get position from active map
        const activeMap = availableMaps.find(m => m.id === activeMapId);
        const position = activeMap && activeMap.positions ? activeMap.positions[poiId] : null;
        
        title.textContent = 'Edit Location';
        document.getElementById('poi-id').value = poi.id;
        document.getElementById('poi-id').disabled = true;
        document.getElementById('poi-label').value = poi.label;
        document.getElementById('poi-description').value = poi.description || '';
        document.getElementById('poi-url').value = poi.url;
        
        if (position) {
            document.getElementById('poi-top').value = parseFloat(position.top);
            document.getElementById('poi-left').value = parseFloat(position.left);
        } else {
            document.getElementById('poi-top').value = 50;
            document.getElementById('poi-left').value = 50;
        }
        
        deleteBtn.style.display = 'inline-block';
    } else {
        // Add mode
        title.textContent = 'Add New Location';
        form.reset();
        document.getElementById('poi-id').disabled = false;
        document.getElementById('poi-top').value = 50;
        document.getElementById('poi-left').value = 50;
        deleteBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// Close modal
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Close modal on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// POI form submission
document.getElementById('poi-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('poi-id').value.trim();
    const label = document.getElementById('poi-label').value.trim();
    const description = document.getElementById('poi-description').value.trim();
    const url = document.getElementById('poi-url').value.trim();
    const top = document.getElementById('poi-top').value + '%';
    const left = document.getElementById('poi-left').value + '%';
    
    // Get active map to update position
    const activeMap = availableMaps.find(m => m.id === activeMapId);
    if (!activeMap) {
        alert('No active map found!');
        return;
    }
    
    if (!activeMap.positions) {
        activeMap.positions = {};
    }
    
    if (currentEditingPOI) {
        // Update existing POI
        const poi = poiData.find(p => p.id === currentEditingPOI);
        if (poi) {
            poi.label = label;
            poi.description = description;
            poi.url = url;
        }
        
        // Update position in active map
        activeMap.positions[currentEditingPOI] = { top, left };
    } else {
        // Add new POI
        if (poiData.find(p => p.id === id)) {
            alert('A location with this ID already exists!');
            return;
        }
        
        poiData.push({ id, label, description, url });
        
        // Add position to active map
        activeMap.positions[id] = { top, left };
    }
    
    saveConfig();
    rebuildMarkers();
    
    if (isAdminMode) {
        enableDragging();
    }
    
    document.getElementById('poi-modal').style.display = 'none';
});

// Delete POI
document.getElementById('delete-poi').addEventListener('click', function() {
    if (!currentEditingPOI) return;
    
    if (confirm(`Are you sure you want to delete "${currentEditingPOI}"?`)) {
        poiData = poiData.filter(p => p.id !== currentEditingPOI);
        saveConfig();
        rebuildMarkers();
        
        if (isAdminMode) {
            enableDragging();
        }
        
        document.getElementById('poi-modal').style.display = 'none';
    }
});

// ============= MAP IMAGE MANAGEMENT =============

// Manage images button
document.getElementById('manage-images').addEventListener('click', function() {
    openMapModal();
});

function openMapModal() {
    const modal = document.getElementById('map-modal');
    renderMapsList();
    modal.style.display = 'flex';
}

function renderMapsList() {
    const container = document.getElementById('maps-container');
    container.innerHTML = '';
    
    availableMaps.forEach(map => {
        const mapCard = document.createElement('div');
        mapCard.className = 'map-card' + (map.active ? ' active' : '');
        
        mapCard.innerHTML = `
            <div class="map-preview">
                <img src="${map.filename}" alt="${map.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect width=%22200%22 height=%22150%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">
            </div>
            <div class="map-info">
                <h4>${map.name}</h4>
                <p class="map-filename">${map.filename}</p>
                ${map.active ? '<span class="active-badge">Active</span>' : ''}
            </div>
            <div class="map-actions">
                ${!map.active ? `<button onclick="setActiveMap('${map.id}')" class="btn-primary btn-sm">Set Active</button>` : ''}
                ${map.id !== 'default' ? `<button onclick="deleteMap('${map.id}')" class="btn-danger btn-sm">Delete</button>` : ''}
            </div>
        `;
        
        container.appendChild(mapCard);
    });
}

// Upload map button
document.getElementById('upload-map-btn').addEventListener('click', function() {
    document.getElementById('image-input').click();
});

// Handle image upload
document.getElementById('image-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const mapName = prompt('Enter a name for this map:', file.name.replace(/\.[^/.]+$/, ''));
    if (!mapName) return;
    
    const mapId = 'map_' + Date.now();
    const filename = `map-images/${mapId}_${file.name}`;
    
    // Note: In production, upload to server here
    // For demo, we'll use a data URL
    const reader = new FileReader();
    reader.onload = function(event) {
        availableMaps.push({
            id: mapId,
            filename: filename,
            dataUrl: event.target.result,
            name: mapName,
            active: false,
            originalName: file.name,
            positions: {} // Initialize empty positions for new map
        });
        
        saveConfig();
        renderMapsList();
        
        alert(`Map "${mapName}" uploaded! Save the image as: ${filename}\n\nIn production, this would be uploaded to your server automatically.\n\nNote: You'll need to set POI positions for this map.`);
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
});

// Set active map
window.setActiveMap = function(mapId) {
    availableMaps.forEach(map => {
        map.active = (map.id === mapId);
    });
    activeMapId = mapId;
    
    const activeMap = availableMaps.find(m => m.id === mapId);
    if (activeMap) {
        // Use dataUrl if available (uploaded image), otherwise use filename
        document.querySelector('.farm-image').src = activeMap.dataUrl || activeMap.filename;
        
        // Rebuild markers with positions from this map
        rebuildMarkers();
    }
    
    saveConfig();
    renderMapsList();
};

// Delete map
window.deleteMap = function(mapId) {
    if (confirm('Are you sure you want to delete this map?')) {
        availableMaps = availableMaps.filter(m => m.id !== mapId);
        
        // If we deleted the active map, set default as active
        if (activeMapId === mapId) {
            setActiveMap('default');
        }
        
        saveConfig();
        renderMapsList();
    }
};

// ============= EXPORT/IMPORT JSON =============

// Export to JSON
document.getElementById('export-json').addEventListener('click', function() {
    const exportData = {
        exported: new Date().toISOString(),
        activeMapId: activeMapId,
        maps: availableMaps,
        pois: poiData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-map-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Map data exported successfully!');
});

// Import from JSON
document.getElementById('import-json').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.pois || !Array.isArray(data.pois)) {
                throw new Error('Invalid JSON format: missing pois array');
            }
            
            // Import data
            poiData = data.pois;
            
            if (data.maps && Array.isArray(data.maps)) {
                availableMaps = data.maps;
            }
            
            if (data.activeMapId) {
                activeMapId = data.activeMapId;
                const activeMap = availableMaps.find(m => m.id === activeMapId);
                if (activeMap) {
                    document.querySelector('.farm-image').src = activeMap.filename;
                }
            }
            
            saveData();
            rebuildMarkers();
            
            if (isAdminMode) {
                enableDragging();
            }
            
            alert('Map data imported successfully!');
        } catch (error) {
            alert('Error importing JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    e.target.value = '';
});
