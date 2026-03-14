document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: true });

    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');
    
    // 1. Session Validation
    if (!userJson || !token) {
        alert("You must be logged in to post a property.");
        window.location.href = '/login.html';
        return;
    }
    const user = JSON.parse(userJson);
    
    // 2. Dynamic Field Toggling (Now hides secondary image for Plot/Hostel)
    function toggleFields() {
        const type = document.getElementById('propertyType').value;
        const areaField = document.getElementById('plotSizeField');
        const amenityField = document.getElementById('amenitiesField');
        const secondaryImageInput = document.getElementById('secondaryImageFile');
        
        // Toggle text fields
        if(areaField) areaField.classList.toggle('hidden', type !== 'BUY_LAND');
        if(amenityField) amenityField.classList.toggle('hidden', type !== 'PG_HOSTEL');
        
        // Hide/Show the Secondary Image upload box
        if(secondaryImageInput) {
            const isHouse = (type === 'BUY_HOUSE' || type === 'RENT_HOUSE');
            const wrapperDiv = secondaryImageInput.closest('div');
            
            if (wrapperDiv) {
                wrapperDiv.classList.toggle('hidden', !isHouse);
            }
            
            // Clear the input if it's hidden so old files don't accidentally send
            if (!isHouse) {
                secondaryImageInput.value = "";
            }
        }
    }
    
    toggleFields();
    document.getElementById('propertyType').addEventListener('change', toggleFields);

    // 3. Form Submission
    document.getElementById('propertyForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        const msg = document.getElementById('statusMessage');
        
        btn.innerText = 'Uploading...';
        btn.disabled = true;
        msg.classList.add('hidden');

        const fd = new FormData();
        
        // Append text fields
        const fields = ['title', 'price', 'location', 'propertyType', 'description', 'ownerName', 'ownerContact'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) fd.append(id, el.value);
        });
        
        // Append conditional fields
        const type = document.getElementById('propertyType').value;
        if(type === 'BUY_LAND') {
            fd.append('areaSize', document.getElementById('areaSize').value);
        } else if(type === 'PG_HOSTEL') {
            fd.append('amenities', document.getElementById('amenities').value);
        }
        
        // Append User Metadata
        fd.append('userId', user.id);

        // Append Main Image (Always sends)
        const mainImage = document.getElementById('imageFile').files[0];
        if(mainImage) fd.append('imageFile', mainImage);

        // Append Secondary Image (ONLY if it is a House)
        const isHouse = (type === 'BUY_HOUSE' || type === 'RENT_HOUSE');
        if (isHouse) {
            const extraFile = document.getElementById('secondaryImageFile').files[0];
            if(extraFile) fd.append('secondaryImageFile', extraFile);
        }

        try {
            const res = await fetch('/api/properties/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: fd
            });
            
            if(res.ok) {
                const data = await res.json();
                msg.innerHTML = `<div class="bg-green-100 text-green-800 p-3 rounded-xl text-center font-bold">${data.message}! Redirecting...</div>`;
                msg.classList.remove('hidden');
                setTimeout(() => window.location.href = '/owner-dashboard.html', 1500);
            } else {
                const data = await res.json();
                throw new Error(data.error || data.message || "Failed to save property");
            }
        } catch(err) {
            msg.innerHTML = `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-center font-semibold">Error: ${err.message}</div>`;
            msg.classList.remove('hidden');
            btn.innerText = 'Publish Property Listing';
            btn.disabled = false;
        }
    });
});