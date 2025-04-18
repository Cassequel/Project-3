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

function getColorClass(value, { green, yellow }) {
    if (green(value)) return 'metric-green';
    else if (yellow(value)) return 'metric-yellow';
    else return 'metric-red';
  }
  

function createAirlineCard(airline) {
    const onTimeClass = getColorClass(airline.recent_performance.on_time_percentage, {
        green: v => v >= 90,
        yellow: v => v >= 80 && v < 90,
      });
      
      const cancelClass = getColorClass(airline.recent_performance.cancellation_rate, {
        green: v => v < 1,
        yellow: v => v >= 1 && v <= 3,
      });
      
      const satisfactionClass = getColorClass(airline.recent_performance.customer_satisfaction, {
        green: v => v >= 4,
        yellow: v => v >= 3 && v < 4,
      });
      
  
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
            <p><strong>On-Time %:</strong> <span class="count ${onTimeClass}" data-value="${airline.recent_performance.on_time_percentage}">0</span>%</p>
            <p><strong>Cancellation %:</strong> <span class="count ${cancelClass}" data-value="${airline.recent_performance.cancellation_rate}">0</span>%</p>
            <p><strong>Satisfaction:</strong> <span class="count ${satisfactionClass}" data-value="${airline.recent_performance.customer_satisfaction}">0</span> Stars</p>
          </div>
        </div>
      </div>
    `;
}

function countUp(el, target, duration = 800) {
    let start = 0;
    const increment = target / (duration / 16); // ~60fps
    const update = () => {
      start += increment;
      if (start >= target) {
        el.textContent = target % 1 === 0 ? target : target.toFixed(1);
      } else {
        el.textContent = target % 1 === 0 ? Math.floor(start) : start.toFixed(1);
        requestAnimationFrame(update);
      }
    };
    update();
}

function animateAllCounts() {
    document.querySelectorAll('.card .count').forEach(span => {
      const target = parseFloat(span.dataset.value);
      countUp(span, target);
    });
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
    animateCardsIn();
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
    animateAllCounts();
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
  
    cards.forEach(card => cardObserver.observe(card));
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

                        const limit = Math.max(cardsInTwoRows.length, 8);
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





function animateCardsIn() {
    setTimeout(() => {
      document.querySelectorAll('.card').forEach(card => {
        card.classList.add('animate-in');
      });
    }, 50); // You can even use 50ms for faster response
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
          card.classList.add('animate-in');
        });
        animateAllCounts(); // 🔥 trigger all counters at the same time
      }, 100);
  }
  

function triggerPlaneFlyby() {
    const clone = document.querySelector('.plane-flyby').cloneNode(true);
    document.body.appendChild(clone);
  
    // Remove it after animation completes
    setTimeout(() => {
      clone.remove();
    }, 2500);
}
  