
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Scroll Animations
    AOS.init({ once: true });

    // Security Check: Verify user is logged in
    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');
    
    if (!userJson || !token) {
        window.location.href = '/login.html';
        return;
    }
    
    const user = JSON.parse(userJson);
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-wishlist');

    try {
        // Fetch saved properties from the backend
        const response = await fetch(`/api/wishlist/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert("Your session has expired. Please log in again.");
            logout();
            return;
        }

        const savedItems = await response.json();
        grid.innerHTML = ''; 
        
        if (savedItems.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        let delay = 0;

        // Iterate through the saved items
        savedItems.forEach(item => {
            const prop = item.property; // Extract the actual property object
            
            const formattedPrice = new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR', 
                maximumFractionDigits: 0 
            }).format(prop.price);
            
            const typeDisplay = prop.propertyType.replace('_', ' ');
            const savedDate = new Date(item.savedAt).toLocaleDateString();
            
            const imageSrc = prop.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

            const card = `
                <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover-lift flex flex-col h-full relative group" id="saved-card-${prop.id}" data-aos="fade-up" data-aos-delay="${delay}">
                    
                    <button onclick="removeSavedProperty(${prop.id})" class="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur text-red-500 hover:text-white hover:bg-red-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110" title="Remove from Wishlist">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                    </button>

                    <div class="relative h-56 image-zoom-container cursor-pointer" onclick="window.location.href='/details.html?id=${prop.id}'">
                        <img src="${imageSrc}" alt="${prop.title}" class="w-full h-full object-cover">
                        <div class="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                            ${typeDisplay}
                        </div>
                    </div>
                    
                    <div class="p-6 flex-grow flex flex-col justify-between">
                        <div>
                            <p class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Saved on ${savedDate}</p>
                            <h3 class="font-extrabold text-xl text-slate-900 line-clamp-1 mb-1 group-hover:text-teal-600 transition-colors cursor-pointer" onclick="window.location.href='/details.html?id=${prop.id}'">${prop.title}</h3>
                            <p class="text-teal-600 font-black text-2xl mb-3">${formattedPrice}</p>
                            <p class="text-sm text-slate-500 flex items-center gap-1.5">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                ${prop.location}
                            </p>
                        </div>
                        
                        <div class="mt-6 pt-5 border-t border-slate-100">
                            <a href="/details.html?id=${prop.id}" class="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-3 rounded-xl transition-colors shadow-sm border border-slate-200 hover:border-slate-300">
                                View Full Details
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
            delay = delay < 400 ? delay + 100 : 0;
        });

    } catch (error) {
        console.error("Failed to load wishlist:", error);
        grid.innerHTML = '<p class="text-red-500 col-span-full text-center font-bold">Failed to load your wishlist. Please check your connection.</p>';
    }
});

// Function to handle un-saving a property from the dashboard
window.removeSavedProperty = async function(propertyId) {
    if (!confirm("Remove this property from your wishlist?")) return;

    const user = JSON.parse(localStorage.getItem('veristay_user'));
    const token = localStorage.getItem('veristay_token');

    try {
        const response = await fetch(`/api/wishlist/toggle/${user.id}/${propertyId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Animate card out before removing from DOM
            const card = document.getElementById(`saved-card-${propertyId}`);
            if (card) {
                card.style.transform = 'scale(0.9) translateY(20px)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.remove();
                    // Check if grid is now empty to show the empty state
                    const grid = document.getElementById('wishlist-grid');
                    if (grid.children.length === 0) {
                        document.getElementById('empty-wishlist').classList.remove('hidden');
                    }
                }, 300); // Matches standard CSS transition time
            }
        } else {
            alert("Failed to remove property. Your session may have expired.");
        }
    } catch (error) {
        alert("Network error occurred.");
    }
};