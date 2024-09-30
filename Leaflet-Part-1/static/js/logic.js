// Create tile layers for the map
let greyscale = createTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');

// URL for earthquake data for the past week
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Fetch the earthquake data and initialize the map
d3.json(earthquakeUrl).then(data => {
    createFeatures(data.features);
});

// Function to create a tile layer
function createTileLayer(url, attribution) {
    return L.tileLayer(url, { attribution: attribution });
}

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 100000;
}

// Function to determine marker color based on earthquake depth
function chooseColor(depth) {
    if (depth < 10) return "#64B5F6";
    else if (depth < 30) return "#43A047";
    else if (depth < 50) return "#FFF176";
    else if (depth < 70) return "#FB8C00";
    else if (depth < 90) return "#B71C1C";
    else return "#FF3300";
}

// Function to create features (markers and popups) for each earthquake
function createFeatures(earthquakeData) {
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: addPopups,
        pointToLayer: createMarker
    });

    createMap(earthquakes);
}

// Function to add popups for each earthquake feature
function addPopups(feature, layer) {
    const { place, time, mag } = feature.properties;
    const depth = feature.geometry.coordinates[2];
    
    const popupContent = `
        <h3>Location: ${place}</h3>
        <hr><p>Date: ${new Date(time)}</p>
        <p>Magnitude: ${mag}</p>
        <p>Depth: ${depth}</p>`;
    
    layer.bindPopup(popupContent);
}

// Function to create earthquake markers based on magnitude and depth
function createMarker(feature, latlng) {
    const markerOptions = {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.5,
        color: "black",
        stroke: false,
        weight: 1
    };
    
    return L.circle(latlng, markerOptions);
}

// Function to create the map and add layers and controls
function createMap(earthquakes) {
    const streetLayer = createTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    
    const topoLayer = createTileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)');
    
    const baseMaps = {
        "Street Map": streetLayer,
        "Topographic Map": topoLayer
    };
    
    const overlayMaps = {
        "Earthquakes": earthquakes
    };
    
    const myMap = L.map("map", {
        center: [33.3943, -104.5230],
        zoom: 2,
        layers: [streetLayer, earthquakes]
    });
    
    // Add layer control
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
    
    // Add the legend
    addLegend(myMap);
}

// Function to add a legend to the map
function addLegend(map) {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [-10, 10, 30, 50, 70, 90];
        const colors = ['#64B5F6', '#43A047', '#FFF176', '#FB8C00', '#B71C1C', '#FF3300'];

        div.innerHTML += '<strong>Depth (km)</strong><br>';
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += 
                '<i style="background:' + colors[i] + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);
}
