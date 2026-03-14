document.addEventListener('DOMContentLoaded', async () => {
    AOS.init({ once: true });

    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');
    
    if (!userJson || !token) {
        window.location.href = '/login.html';
        return;
    }
    
    const user = JSON.parse(userJson);
    
    // Strict Authorization
    if (user.role !== 'ROLE_OWNER') {
        alert("Access Denied: Owner Portal only.");
        window.location.href = '/'; 
        return;
    }

    const grid = document.getElementById('owner-property-grid');
    
    try {
        const response = await fetch(`/api/properties/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert("Session expired. Please log in again.");
            logout();
            return;
        }

        const properties = await response.json();
        grid.innerHTML = ''; 
        
        if (properties.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16" data-aos="zoom-in">
                    <div class="text-5xl mb-4">🏠</div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">No properties listed yet</h3>
                    <p class="text-slate-500 mb-6">Start building your portfolio to reach thousands of buyers.</p>
                    <a href="/post-property.html" class="text-teal-600 font-bold hover:underline">Create your first listing</a>
                </div>`;
            return;
        }

        let delay = 0;
        properties.forEach(prop => {
            const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(prop.price);
            const typeDisplay = prop.propertyType.replace('_', ' ');

            const badge = prop.verified 
                ? '<span class="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Verified</span>'
                : '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Pending Review</span>';

            const card = `
                <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden hover-lift flex flex-col h-full" id="property-card-${prop.id}" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="relative h-48 image-zoom-container">
                        <img src="${prop.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover">
                        <div class="absolute top-3 left-3">${badge}</div>
                    </div>
                    
                    <div class="p-5 flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-lg text-slate-900 line-clamp-1 mb-1">${prop.title}</h3>
                            <p class="text-teal-600 font-bold text-xl mb-3">${formattedPrice}</p>
                            <p class="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                ${prop.location}
                            </p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">${typeDisplay}</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100">
                            <a href="/details.html?id=${prop.id}" class="text-center bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors">View Page</a>
                            <button onclick="deleteProperty(${prop.id})" class="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2.5 rounded-xl transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
            delay = delay < 300 ? delay + 100 : 0;
        });

    } catch (error) {
        grid.innerHTML = '<p class="text-red-500 col-span-full text-center font-bold">Failed to load portfolio.</p>';
    }
});

// Made global so the onclick attribute in HTML can access it
window.deleteProperty = async function(propertyId) {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;

    const token = localStorage.getItem('veristay_token');
    try {
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const card = document.getElementById(`property-card-${propertyId}`);
            if (card) {
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0';
                setTimeout(() => card.remove(), 300);
            }
        } else {
            alert("Failed to delete. Session may have expired.");
        }
    } catch (error) {
        alert("Network error.");
    }
};