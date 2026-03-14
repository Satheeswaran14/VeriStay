document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: true });

    // Ensure User is logged in
    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');

    if (!userJson || !token) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(userJson);

    // Populate Initial Data
    document.getElementById('profEmail').value = user.email;
    document.getElementById('profName').value = user.fullName || '';
    document.getElementById('profPhone').value = user.phone || '';
    
    document.getElementById('display-name').innerText = user.fullName || 'User';
    document.getElementById('profile-avatar').innerText = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
    document.getElementById('display-role').innerText = user.role.replace('ROLE_', '');

    // Form Submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('updateBtn');
        const statusDiv = document.getElementById('profileStatus');

        const updatedData = {
            fullName: document.getElementById('profName').value.trim(),
            phone: document.getElementById('profPhone').value.trim(),
            password: document.getElementById('profPassword').value // Only sent if user typed something
        };

        btn.disabled = true;
        btn.innerHTML = `<div class="loader-circle w-5 h-5 border-2 border-white/50 rounded-full border-t-white mr-2"></div> Saving...`;
        statusDiv.classList.add('hidden');

        try {
            const response = await fetch(`/api/users/update/${user.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.status === 403) {
                alert("Session expired. Please log in again.");
                logout(); // From auth.js
                return;
            }

            if (response.ok) {
                const newUserData = await response.json();
                
                // Update Local Storage with new data so the navbar stays accurate
                localStorage.setItem('veristay_user', JSON.stringify(newUserData));
                
                // Update UI visually
                document.getElementById('display-name').innerText = newUserData.fullName;
                document.getElementById('profile-avatar').innerText = newUserData.fullName.charAt(0).toUpperCase();
                document.getElementById('profPassword').value = ''; // Clear password field
                
                // Show success message and update Auth bar text
                statusDiv.innerHTML = `<span class="text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200 block">✅ Profile updated successfully!</span>`;
                
                // Force a quick refresh of the auth.js logic to update the top right name
                document.dispatchEvent(new Event('DOMContentLoaded')); 
                
            } else {
                statusDiv.innerHTML = `<span class="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200 block">⚠️ Failed to update profile.</span>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<span class="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200 block">⚠️ Network error occurred.</span>`;
        } finally {
            statusDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
        }
    });
});