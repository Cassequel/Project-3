// Predefined mapping of airport codes to city names
const airportMapping = {
    'AMS': 'Amsterdam',
    'ATL': 'Atlanta',
    'BOM': 'Mumbai',
    'CLT': 'Charlotte',
    'DEN': 'Denver',
    'FRA': 'Frankfurt',
    'IST': 'Istanbul',
    'LHR': 'London',
    'MCO': 'Orlando',
    'MEL': 'Melbourne',
    'NRT': 'Tokyo',
    'SEA': 'Seattle',
    'YYZ': 'Toronto',
    'MUC': 'Munich',
    'PEK': 'Beijing',
    'BKK': 'Bangkok',
    'GRU': 'São Paulo',
    'HKG': 'Hong Kong',
    'SYD': 'Sydney',
    'ORD': 'Chicago',
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
    'CDG': 'Paris',
    'KUL': 'Kuala Lumpur',
    'SFO': 'San Francisco',
    'LAS': 'Las Vegas',
    'DOH': 'Doha',
    'LAX': 'Los Angeles',
    'PHX': 'Phoenix',
    'MSP': 'Minneapolis',
    'SIN': 'Singapore',
    'DXB': 'Dubai',
    'ICN': 'Seoul',
    'HND': 'Tokyo',
    'NBO': 'Nairobi',
    'CAI': 'Cairo',
    'AUH': 'Abu Dhabi',
    'JFK': 'New York',
    'EWR': 'New York',
    'LGA': 'New York',
    'DCA': 'Washington D.C.',
    'BOS': 'Boston',
    'PHL': 'Philadelphia',
    'HOU': 'Houston',
    'IAH': 'Houston',
    'SJC': 'San Jose',
    'OAK': 'Oakland',
    'SMF': 'Sacramento',
    'ONT': 'Ontario',
    'BWI': 'Baltimore',
    'PDX': 'Portland',
    'RDU': 'Raleigh-Durham',
    'TPA': 'Tampa',
    'MCI': 'Kansas City',
    'STL': 'St. Louis',
    'CMH': 'Columbus',
    'IND': 'Indianapolis',
    'PIT': 'Pittsburgh',
    'CLE': 'Cleveland',
    'CVG': 'Cincinnati',
    'MDW': 'Chicago',
    'ABQ': 'Albuquerque',
    'ELP': 'El Paso',
    'TUS': 'Tucson',
    'TYS': 'Knoxville',
    'AVL': 'Asheville',
    'GSO': 'Greensboro',
    'RNO': 'Reno',
    'BIL': 'Billings',
    'BZN': 'Bozeman',
    'GRR': 'Grand Rapids',
    'MSN': 'Madison',
    'BTV': 'Burlington',
    'DEL': 'New Delhi',
    'DFW': 'Dallas/Fort Worth',
    'DTW': 'Detroit',
    'LGW': 'London (Gatwick)',
    'MIA': 'Miami',
    'PVG': 'Shanghai',
    'YVR': 'Vancouver'
};

// Global variables for pagination
let filteredFlights = [];


const darkModeSwitch = document.getElementById('dark-mode-switch');
const body = document.body;
 
 
// Check if dark mode is saved in localStorage
if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    darkModeSwitch.checked = true;
}
 
 
// Add event listener for the dark mode toggle
if (darkModeSwitch) {
    darkModeSwitch.addEventListener('change', () => {
        if (darkModeSwitch.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    });
}
 
 
// Function to fetch and display flight data
async function fetchFlightData() {
    const fromSelect = document.getElementById('from-location');
    const toSelect = document.getElementById('to-location');
    const fromInput = fromSelect.value;
    const toInput = toSelect.value;
   
    const container = document.getElementById('data-container');
   
    try {
        showLoader();
        const response = await fetch('flights.json');
        if (!response.ok) throw new Error('Failed to fetch flights data');
       
        const { data } = await response.json();
        const airlines = data.airlines;
       
        // Filter flights based on input
        filteredFlights = airlines.flatMap(airline =>
            airline.routes.filter(route => {
                const origin = route.origin;
                const destination = route.destination;
                return (fromInput === '' || origin === fromInput) &&
                       (toInput === '' || destination === toInput);
            }).map(route => {
                const mostRecent = route.most_recent_flight;
                return {
                    origin: route.origin,
                    destination: route.destination,
                    airline: airline.name,
                    departure: mostRecent.departure,
                    arrival: mostRecent.arrival,
                    distance: route.distance_miles,
                    duration: Math.round(mostRecent.duration_minutes / 60),
                    onTimePercentage: airline.recent_performance.on_time_percentage,
                    departureTerminal: mostRecent.terminals.departure,
                    arrivalTerminal: mostRecent.terminals.arrival,
                    status: mostRecent.status,
                    flightNumber: mostRecent.flight_number,
                    aircraft: mostRecent.aircraft
                };
            })
        );
        
        // Reset pagination when new search is performed
        currentPage = 1;
        
        // Display the first page of results
        displayFlightData(filteredFlights);
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p style="color: #666; text-align: center;">Failed to load flight data. ${error.message}</p>`;
    } finally {
        hideLoader();
    }
}
 
 
// Pagination settings
const itemsPerPage = 5;
let currentPage = 1;
let totalPages = 1;

// Function to update pagination controls
function updatePaginationControls(totalItems) {
    totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Function to display flight data with pagination
function displayFlightData(flights) {
    const container = document.getElementById('data-container');
    const searchResultsContainer = document.querySelector('.search-results-container');
    
    if (flights.length === 0) {
        container.innerHTML = `<div class="no-results">No flights found for the selected route.</div>`;
    } else {
        container.innerHTML = '';
        
        // Calculate start and end index for current page
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, flights.length);
        const paginatedFlights = flights.slice(startIdx, endIdx);

        // Add each flight as a row
        paginatedFlights.forEach(flight => {
            const row = document.createElement('div');
            row.className = 'grid-row';
            
            // Create cells for each data point
            const cells = [
                { label: 'Origin', value: `${airportMapping[flight.origin] || flight.origin} (${flight.origin})` },
                { label: 'Destination', value: `${airportMapping[flight.destination] || flight.destination} (${flight.destination})` },
                { label: 'Airline', value: flight.airline },
                { label: 'Departure', value: new Date(flight.departure).toLocaleString() },
                { label: 'Arrival', value: new Date(flight.arrival).toLocaleString() },
                { label: 'Distance/Duration', value: `${flight.distance} mi / ${flight.duration}h` },
                { label: 'On Time %', value: `${flight.onTimePercentage}%` },
                { label: 'Departure Terminal', value: flight.departureTerminal },
                { label: 'Arrival Terminal', value: flight.arrivalTerminal },
                { label: 'Status', value: flight.status },
                { label: 'Flight Number', value: flight.flightNumber },
                { label: 'Aircraft', value: flight.aircraft }
            ];

            // Create a two-column layout for each cell
            cells.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'grid-cell';
                
                cellDiv.innerHTML = `
                    <div class="cell-label">${cell.label}:</div>
                    <div class="cell-value">${cell.value}</div>
                `;

                row.appendChild(cellDiv);
            });

            container.appendChild(row);
        });

        // Update pagination controls
        updatePaginationControls(flights.length);
    }

    searchResultsContainer.classList.add('visible');
}


// Add event listeners for pagination buttons
document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayFlightData(filteredFlights); // Make sure filteredFlights is accessible
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayFlightData(filteredFlights); // Make sure filteredFlights is accessible
        }
    });
});

// Function to get status color class
function getStatusColor(status) {
    if (status === 'Delayed') return 'status-red';
    if (status === 'On Time') return 'status-green';
    return 'status-gray';
}

// Function to get on-time percentage color class
function getOnTimeColor(percentage) {
    if (percentage >= 90) return 'on-time-green';
    if (percentage >= 80) return 'on-time-yellow';
    return 'on-time-red';
}

// Function to get distance indicator class
function getDistanceClass(distance) {
    return distance > 3000 ? 'long-distance' : '';
}

// Function to populate select dropdowns with airport options
async function populateAirports() {
    try {
        const response = await fetch('flights.json');
        if (!response.ok) throw new Error('Failed to fetch flights data');
       
        const { data } = await response.json();
        const airlines = data.airlines;
       
        // Add default option to select elements
        const fromSelect = document.getElementById('from-location');
        const toSelect = document.getElementById('to-location');
        const popularSelect = document.getElementById('popular-origin');
 
 
        // Clear existing options
        fromSelect.innerHTML = '<option value="">Select Origin</option>';
        toSelect.innerHTML = '<option value="">Select Destination</option>';
        popularSelect.innerHTML = '<option value="">Select Origin</option>';
 
 
        // Get unique airports from all routes
        const airports = new Set();
        airlines.forEach(airline => {
            airline.routes.forEach(route => {
                airports.add(route.origin);
                airports.add(route.destination);
            });
        });
 
 
        // Sort airports alphabetically
        const sortedAirports = Array.from(airports).sort();
 
 
        // Add options to the select elements
        sortedAirports.forEach(airport => {
            const city = airportMapping[airport] || airport;
            const displayText = `${city} (${airport})`;
           
            const option = document.createElement('option');
            option.value = airport;
            option.textContent = displayText;
           
            fromSelect.appendChild(option.cloneNode(true));
            toSelect.appendChild(option.cloneNode(true));
            popularSelect.appendChild(option.cloneNode(true));
        });
    } catch (error) {
        console.error('Error populating airports:', error);
    }
}
 
 
// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    populateAirports();
   
    const searchFlightsBtn = document.getElementById('search-flights');
    if (searchFlightsBtn) {
        searchFlightsBtn.addEventListener('click', fetchFlightData);
    }
 
 
    const searchPopularBtn = document.getElementById('search-popular');
    if (searchPopularBtn) {
        searchPopularBtn.addEventListener('click', fetchPopularFlights);
    }
});
 
 
// Helper functions for loader
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('hidden');
    }
}
 
 
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
    }
}
 
 
// Function to fetch popular flights
async function fetchPopularFlights() {
    const popularSelect = document.getElementById('popular-origin');
    const originInput = popularSelect.value;
    const container = document.getElementById('popular-flights-container');
    const popularFlightsList = document.querySelector('.popular-flights-list');
   
    try {
        const response = await fetch('flights.json');
        if (!response.ok) throw new Error('Failed to fetch flights data');
       
        const { data } = await response.json();
       
        // Find all routes from the specified origin
        const popularFlights = data.airlines.flatMap(airline =>
            airline.routes
                .filter(route => route.origin === originInput)
                .map(route => ({
                    ...route,
                    airline: airline.name,
                    on_time_percentage: airline.recent_performance.on_time_percentage
                }))
        );
 
 
        displayPopularFlights(popularFlights);
       
        // Show the container only if there are flights to display
        if (popularFlights.length > 0) {
            popularFlightsList.classList.add('visible');
        } else {
            container.innerHTML = `<p style="color: #666; text-align: center;">No popular flights found for this origin.</p>`;
            popularFlightsList.classList.add('visible');
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p style="color: #666; text-align: center;">Failed to load popular flights. Please try again.</p>`;
        popularFlightsList.classList.add('visible');
    }
}
 
 
// Function to display popular flights in the container
function displayPopularFlights(flights) {
    const container = document.getElementById('popular-flights-container');
   
    if (flights.length === 0) {
        container.innerHTML = `<p style="color: #666; text-align: center;">No popular flights found for this origin.</p>`;
        return;
    }
 
 
    container.innerHTML = flights.map(flight => {
        const mostRecent = flight.most_recent_flight;
        const destinationCity = airportMapping[flight.destination] || flight.destination;
        return `
            <div class="popular-flight-item">
                <div class="popular-flight-info">
                    <h4>${destinationCity} (${flight.destination})</h4>
                    <div class="flight-details">
                        <div class="detail-row">
                            <span class="detail-label">Airline:</span>
                            <span class="detail-value">${flight.airline}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Distance:</span>
                            <span class="detail-value">${flight.distance_miles} mi</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${Math.round(mostRecent.duration_minutes / 60)}h</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">On Time %:</span>
                            <span class="detail-value">${flight.on_time_percentage || 'N/A'}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Departure:</span>
                            <span class="detail-value">${new Date(mostRecent.departure).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Arrival:</span>
                            <span class="detail-value">${new Date(mostRecent.arrival).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Departure Terminal:</span>
                            <span class="detail-value">${mostRecent.terminals.departure}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Arrival Terminal:</span>
                            <span class="detail-value">${mostRecent.terminals.arrival}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${mostRecent.status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Flight Number:</span>
                            <span class="detail-value">${mostRecent.flight_number}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Aircraft:</span>
                            <span class="detail-value">${mostRecent.aircraft}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}