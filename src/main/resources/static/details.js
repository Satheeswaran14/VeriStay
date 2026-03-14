document.addEventListener('DOMContentLoaded', async () => {
    AOS.init({ once: true });

    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
        return;
    }

    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');
    let user = null;
    if (userJson) user = JSON.parse(userJson);

    try {
        // Fetch Details
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) throw new Error("Not found");
        const property = await response.json();

        // 1. Render Carousel (Updated for Single-Table Logic)
        const carouselWrapper = document.getElementById('carousel-wrapper');
        let slidesHtml = '';
        
        const mainImg = property.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
        slidesHtml += `<div class="swiper-slide cursor-pointer" onclick="openLightbox(this.querySelector('img').src)"><img src="${mainImg}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"></div>`;
        
        // Now checks for the new single secondaryImageUrl string!
        if (property.secondaryImageUrl) {
            slidesHtml += `<div class="swiper-slide cursor-pointer" onclick="openLightbox(this.querySelector('img').src)"><img src="${property.secondaryImageUrl}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"></div>`;
        }
        carouselWrapper.innerHTML = slidesHtml;

        new Swiper(".mySwiper", {
            loop: false, // Turned loop off since there might only be 1 or 2 images
            effect: "fade", 
            grabCursor: true,
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        });

        // 2. Render Text Data
        document.getElementById('detail-title').innerText = property.title;
        document.getElementById('detail-location').innerText = property.location;
        document.getElementById('detail-description').innerText = property.description;
        
        // Owner Name & Avatar Logic
        const ownerNameSpan = document.getElementById('detail-owner-name-text');
        if (ownerNameSpan) ownerNameSpan.innerText = property.ownerName;
        
        const ownerAvatar = document.getElementById('owner-avatar');
        if (ownerAvatar && property.ownerName) {
            ownerAvatar.innerText = property.ownerName.charAt(0).toUpperCase();
            ownerAvatar.classList.remove('hidden');
        }

        document.getElementById('detail-owner-contact').innerText = property.ownerContact;
        document.getElementById('detail-type').innerText = property.propertyType.replace('_', ' ');

        const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.price);
        document.getElementById('detail-price').innerText = formattedPrice;

        // 3. Dynamic Fields
        const extraContainer = document.getElementById('extra-details-container');
        if (property.propertyType === 'BUY_LAND' && property.areaSize) {
            document.getElementById('extra-details-title').innerText = 'Plot Size';
            document.getElementById('extra-details-text').innerText = property.areaSize;
            extraContainer.classList.remove('hidden');
        } else if (property.propertyType === 'PG_HOSTEL' && property.amenities) {
            document.getElementById('extra-details-title').innerText = 'Included Amenities';
            document.getElementById('extra-details-text').innerText = property.amenities;
            extraContainer.classList.remove('hidden');
        }

        // 4. Initialize Map (Geocoding)
        const mapContainer = document.getElementById('property-map');
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(property.location)}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                const lat = geoData[0].lat;
                const lon = geoData[0].lon;
                const map = L.map('property-map').setView([lat, lon], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
                
                // Custom Marker
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color:#0d9488; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20], iconAnchor: [10, 10]
                });
                L.marker([lat, lon], {icon: icon}).addTo(map).bindPopup(`<b style="color:#0d9488">${property.title}</b>`).openPopup();
            } else {
                mapContainer.innerHTML = '<div class="h-full flex items-center justify-center text-slate-500 font-medium">Exact map location not found.</div>';
            }
        } catch (err) { mapContainer.innerHTML = '<div class="h-full flex items-center justify-center text-slate-500 font-medium">Map service offline.</div>'; }

        // Hide Spinner, Show Content
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('property-container').classList.remove('hidden');

    } catch (error) {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    }

    // 5. Contact Button Logic
    document.getElementById('reveal-contact-btn').addEventListener('click', () => {
        if (!user) {
            alert("Please Log In to view the owner's contact information.");
            window.location.href = '/login.html';
            return;
        }
        document.getElementById('reveal-contact-btn').classList.add('hidden');
        document.getElementById('contact-info').classList.remove('hidden');
    });

    // 6. Wishlist Logic
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (user && token && propertyId) {
        wishlistBtn.classList.remove('hidden'); 
        try {
            const checkRes = await fetch(`/api/wishlist/check/${user.id}/${propertyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (checkRes.ok) {
                const isSaved = await checkRes.json();
                if (isSaved) setWishlistActive();
            }
        } catch(e) {}

        wishlistBtn.addEventListener('click', async () => {
            const res = await fetch(`/api/wishlist/toggle/${user.id}/${propertyId}`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'added') setWishlistActive();
                else setWishlistInactive();
            }
        });
    }

    function setWishlistActive() {
        document.getElementById('wishlist-text').innerText = "Saved to Wishlist";
        document.getElementById('wishlist-icon').innerText = "❤️";
        wishlistBtn.classList.add('border-rose-200', 'bg-rose-50', 'text-rose-600');
        wishlistBtn.classList.remove('border-slate-200/60', 'bg-white/50', 'text-slate-700');
    }
    function setWishlistInactive() {
        document.getElementById('wishlist-text').innerText = "Save to Wishlist";
        document.getElementById('wishlist-icon').innerText = "🤍";
        wishlistBtn.classList.remove('border-rose-200', 'bg-rose-50', 'text-rose-600');
        wishlistBtn.classList.add('border-slate-200/60', 'bg-white/50', 'text-slate-700');
    }

    // 7. Reviews Logic
    if (user && token) {
        document.getElementById('add-review-section').classList.remove('hidden');
        document.getElementById('login-to-review').classList.add('hidden');
    }

    async function loadReviews() {
        const reviewsList = document.getElementById('reviews-list');
        const res = await fetch(`/api/reviews/property/${propertyId}`);
        const reviews = await res.json();
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-slate-500 italic font-medium bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">No reviews yet. Be the first!</p>';
            return;
        }

        let totalStars = 0;
        reviews.forEach(r => totalStars += r.rating);
        document.getElementById('average-rating-display').classList.remove('hidden');
        document.getElementById('avg-score').innerText = (totalStars / reviews.length).toFixed(1);
        document.getElementById('total-reviews').innerText = reviews.length;

        reviews.forEach(review => {
            const dateStr = new Date(review.createdAt).toLocaleDateString();
            const stars = '⭐'.repeat(review.rating);
            reviewsList.innerHTML += `
                <div class="glass-panel p-6 rounded-2xl shadow-sm border-t border-white">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                                ${review.reviewerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h5 class="font-bold text-slate-900 leading-none">${review.reviewerName}</h5>
                                <p class="text-xs text-slate-400 mt-1 font-medium">${dateStr}</p>
                            </div>
                        </div>
                        <div class="text-amber-400 text-sm tracking-widest bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">${stars}</div>
                    </div>
                    <p class="text-slate-600 mt-4 leading-relaxed font-light">${review.comment}</p>
                </div>
            `;
        });
    }

    document.getElementById('review-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-review-btn');
        btn.disabled = true; btn.innerText = 'Posting...';

        await fetch('/api/reviews/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                propertyId, userId: user.id, reviewerName: user.fullName,
                rating: parseInt(document.getElementById('review-rating').value),
                comment: document.getElementById('review-comment').value
            })
        });
        document.getElementById('review-form').reset();
        btn.disabled = false; btn.innerText = 'Post Review';
        loadReviews();
    });

    loadReviews();
});

// ==========================================
// 8. Fullscreen Image Modal Logic
// ==========================================
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");

window.openLightbox = function(src) {
    modalImg.src = src;
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalImg.classList.remove("scale-95");
        modalImg.classList.add("scale-100");
    }, 10);
    document.body.style.overflow = 'hidden';
};

function closeLightbox() {
    modal.classList.add("opacity-0");
    modalImg.classList.remove("scale-100");
    modalImg.classList.add("scale-95");
    setTimeout(() => {
        modal.classList.add("hidden");
        document.body.style.overflow = '';
    }, 300);
}

document.getElementById('closeModalBtn').addEventListener('click', closeLightbox);
modal.addEventListener('click', (e) => { if (e.target === modal) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });