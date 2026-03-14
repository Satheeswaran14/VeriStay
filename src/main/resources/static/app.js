document.addEventListener('DOMContentLoaded', () => {
    // Initialize Scroll Animations
    AOS.init({ once: true, offset: 50, duration: 800, easing: 'ease-out-cubic' });

    // Load all properties immediately
    loadProperties('');

    // Glassmorphism Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) {
            nav.classList.add('shadow-md', 'bg-white/90');
            nav.classList.remove('bg-white/50');
        } else {
            nav.classList.remove('shadow-md', 'bg-white/90');
            nav.classList.add('bg-white/50');
        }
    });

    // Enter key search functionality
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchProperties();
        }
    });
});

let currentFilter = '';

// Expose filter globally so HTML buttons can trigger it
window.filterProperties = function(filterType) {
    document.getElementById('searchInput').value = ''; // clear search when filtering
    loadProperties(filterType);
};

async function loadProperties(filterType) {
    currentFilter = filterType;
    updateFilterButtons(filterType);
    
    const grid = document.getElementById('properties-grid');
    const noResults = document.getElementById('no-results');
    
    // Show loader
    grid.innerHTML = `
        <div class="col-span-full flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-slate-200 rounded-full border-t-teal-600 animate-spin"></div>
        </div>`;
    noResults.classList.add('hidden');

    try {
        let url = '/api/properties';
        if (filterType) url += `?type=${filterType}`;
        
        const response = await fetch(url);
        const properties = await response.json();
        
        grid.innerHTML = ''; 
        
        if (properties.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        renderPropertyCards(properties, grid);

    } catch (error) {
        console.error("Error fetching properties:", error);
        grid.innerHTML = '<p class="text-red-500 col-span-full text-center font-bold">Failed to load properties. Ensure the backend is running.</p>';
    }
}

window.searchProperties = async function() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return loadProperties('');

    const grid = document.getElementById('properties-grid');
    const noResults = document.getElementById('no-results');
    
    grid.innerHTML = `
        <div class="col-span-full flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-slate-200 rounded-full border-t-teal-600 animate-spin"></div>
        </div>`;
    noResults.classList.add('hidden');

    try {
        const response = await fetch(`/api/properties?search=${encodeURIComponent(query)}`);
        const properties = await response.json();
        
        updateFilterButtons('SEARCHING'); // clears active state from all pills
        grid.innerHTML = '';
        
        if (properties.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        renderPropertyCards(properties, grid);
    } catch (e) { 
        console.error(e); 
        grid.innerHTML = '<p class="text-red-500 col-span-full text-center font-bold">Search failed.</p>';
    }
};

function renderPropertyCards(properties, grid) {
    let delay = 0;

    properties.forEach((prop) => {
        const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(prop.price);
        let typeBadge = prop.propertyType.replace('_', ' ');
        
        // We know they are verified because the backend filters them, but we add the badge for aesthetics
        const verifiedBadge = `<div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-teal-700 text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Verified
                               </div>`;

        const imageSrc = prop.imageUrl ? prop.imageUrl : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

        const card = `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer" 
                 onclick="window.location.href='/details.html?id=${prop.id}'"
                 data-aos="fade-up" data-aos-delay="${delay}">
                
                <div class="relative h-64 overflow-hidden">
                    <img src="${imageSrc}" alt="${prop.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    ${verifiedBadge}
                    <div class="absolute top-4 right-4 bg-slate-900/70 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                        ${typeBadge}
                    </div>
                </div>
                
                <div class="p-6">
                    <h3 class="font-bold text-xl text-slate-900 line-clamp-1 group-hover:text-teal-600 transition-colors mb-2">${prop.title}</h3>
                    
                    <p class="text-slate-500 text-sm flex items-center gap-1.5 mb-5">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        ${prop.location}
                    </p>
                    
                    <div class="pt-4 border-t border-slate-100 flex justify-between items-end">
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listed Price</p>
                            <p class="text-2xl font-extrabold text-teal-600">${formattedPrice}</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
        delay = delay < 500 ? delay + 100 : 0; 
    });
}

function updateFilterButtons(activeFilter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        // Reset all buttons to inactive state
        btn.classList.remove('bg-slate-900', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');

        // Apply active state
        if (activeFilter === '' && btn.innerText === 'All') {
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-md');
            btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
        } else if (activeFilter !== '' && btn.innerText.toUpperCase().includes(activeFilter.replace('_', ' '))) {
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-md');
            btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
        }
    });
}