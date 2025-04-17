    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = navLinks.querySelectorAll('a');
    const header = document.querySelector('header');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        header.classList.toggle('menu-open');
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            header.classList.remove('menu-open');
        });
    });

function createAirlineCard(airline) {
    return `
        <div class="card" data-airline="${airline.airline_id}">
            <div class="card-img">
                <img src="${airline.logo}" alt="${airline.name} logo" />
            </div>
            <div class="card-text">
                <h3 class="airline-name">${airline.name}</h3>
                <p><strong>Headquarters:</strong> ${airline.headquarters}</p>
                <p><strong>Airline ID:</strong> ${airline.airline_id}</p>
                <div class="performance">
                    <p><strong>On-Time %:</strong> ${airline.recent_performance.on_time_percentage}%</p>
                    <p><strong>Cancellation %:</strong> ${airline.recent_performance.cancellation_rate}%</p>
                    <p><strong>Satisfaction:</strong> ${airline.recent_performance.customer_satisfaction} Stars</p>
                </div>
            </div>
        </div>
    `;
}

let allAirlines = [];

function filterAndRenderAirlines() {
    const grid = document.getElementById('airlineGrid');
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const onTimeValue = parseFloat(document.getElementById('onTimeFilter').value);
    const cancelValue = parseFloat(document.getElementById('cancelFilter').value);

    const filtered = allAirlines.filter(airline => {
        const nameMatch = airline.name.toLowerCase().includes(searchValue);
        const onTimeMatch = isNaN(onTimeValue) || airline.recent_performance.on_time_percentage >= onTimeValue;
        const cancelMatch = isNaN(cancelValue) || airline.recent_performance.cancellation_rate < cancelValue;
        return nameMatch && onTimeMatch && cancelMatch;
    });

    grid.innerHTML = filtered.map(createAirlineCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('airlineGrid');
    const cardLimitAttr = document.body.getAttribute('data-cards-limit');

    fetch('./flights.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allAirlines = data.data.airlines;

            if (cardLimitAttr === 'all') {
                // Render all with filters
                filterAndRenderAirlines();
                document.getElementById('searchInput').addEventListener('input', filterAndRenderAirlines);
                document.getElementById('onTimeFilter').addEventListener('change', filterAndRenderAirlines);
                document.getElementById('cancelFilter').addEventListener('change', filterAndRenderAirlines);
            } else {
                // Render only first 4
                const limited = allAirlines.slice(0, parseInt(cardLimitAttr));
                grid.innerHTML = limited.map(createAirlineCard).join('');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            grid.innerHTML = '<p>Failed to load airline data.</p>';
        });
});

let currentView = 'card'; // default

const toggleBtn = document.getElementById('toggleViewBtn');
const grid = document.getElementById('airlineGrid');

// Set default class
grid.classList.add('card-view');

toggleBtn.addEventListener('click', () => {
    currentView = currentView === 'card' ? 'list' : 'card';
    grid.classList.toggle('card-view');
    grid.classList.toggle('list-view');

    toggleBtn.textContent = currentView === 'card' ? 'Switch to List View' : 'Switch to Card View';
});

