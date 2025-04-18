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



let allAirlines = [];

let currentView = 'card';

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

function getCardsPerRow(containerSelector, cardClass) {
    const container = document.querySelector(containerSelector);
    const card = container.querySelector(`.${cardClass}`);
    if (!card) return 4;
    const containerWidth = container.clientWidth;
    const cardWidth = card.offsetWidth;
    return Math.floor(containerWidth / cardWidth) || 1;
}

function renderAirlines(airlines, limit) {
    const grid = document.getElementById('airlineGrid');
    const limited = airlines.slice(0, limit); // ✅ Add this line
    grid.innerHTML = limited.map(createAirlineCard).join('');

    requestAnimationFrame(() => {
        observeCards(); // Always re-observe
    });
}

  let cardObserver = null;

  function observeCards() {
      if (cardObserver) cardObserver.disconnect();
  
      const cards = document.querySelectorAll('.card');
      cardObserver = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('animate-in');
                  obs.unobserve(entry.target);
              }
          });
      }, { threshold: 0.1 });
  
      cards.forEach(card => cardObserver.observe(card)); // ✅ Fix: this was using wrong variable
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('airlineGrid');
    const toggleBtn = document.getElementById('toggleViewBtn');
    const cardLimitAttr = document.body.getAttribute('data-cards-limit');

    // Set default layout class
    grid.classList.add('card-view');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentView = currentView === 'card' ? 'list' : 'card';
            grid.classList.toggle('card-view');
            grid.classList.toggle('list-view');
            toggleBtn.textContent = currentView === 'card' ? 'Switch to List View' : 'Switch to Card View';
            observeCards();
        });
    }

    fetch('./flights.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allAirlines = data.data.airlines;

            if (cardLimitAttr === 'all') {
                filterAndRenderAirlines();
                document.getElementById('searchInput').addEventListener('input', filterAndRenderAirlines);
                document.getElementById('onTimeFilter').addEventListener('change', filterAndRenderAirlines);
                document.getElementById('cancelFilter').addEventListener('change', filterAndRenderAirlines);
            } else if (cardLimitAttr === 'auto-rows') {
                // Render one temporary card to measure size
                grid.innerHTML = createAirlineCard(allAirlines[0]);

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        const cards = grid.querySelectorAll('.card');
                        if (cards.length === 0) return;

                        const firstCardTop = cards[0].offsetTop;
                        let rowCount = 1;
                        let cardsInTwoRows = [];

                        for (let card of cards) {
                            if (card.offsetTop > firstCardTop && rowCount === 1) {
                                rowCount++;
                            }
                            if (rowCount <= 2) {
                                cardsInTwoRows.push(card);
                            } else {
                                break;
                            }
                        }

                        const limit = cardsInTwoRows.length;
                        renderAirlines(allAirlines, limit);
                    });
                }, 50);
            } else {
                const limit = parseInt(cardLimitAttr);
                renderAirlines(allAirlines, limit);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            grid.innerHTML = '<p>Failed to load airline data.</p>';
        });
});

// ✅ Fixes placement of resize listener — outside DOMContentLoaded
window.addEventListener('resize', () => {
    if (document.body.getAttribute('data-cards-limit') === 'auto-rows') {
        const perRow = getCardsPerRow('#airlineGrid', 'card');
        const limit = perRow * 2;
        renderAirlines(allAirlines, limit);
    }
});



setTimeout(() => {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('animate-in');
    });
  }, 100);