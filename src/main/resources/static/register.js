document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: true });
});

// Role Toggle Logic
window.selectRole = function(role) {
    document.getElementById('role').value = role;
    const indicator = document.getElementById('roleIndicator');
    const buyerBtn = document.getElementById('roleBuyerBtn');
    const ownerBtn = document.getElementById('roleOwnerBtn');

    if (role === 'ROLE_USER') {
        indicator.style.transform = 'translateX(0)';
        buyerBtn.classList.replace('text-slate-500', 'text-slate-900');
        ownerBtn.classList.replace('text-slate-900', 'text-slate-500');
    } else {
        indicator.style.transform = 'translateX(100%)';
        ownerBtn.classList.replace('text-slate-500', 'text-slate-900');
        buyerBtn.classList.replace('text-slate-900', 'text-slate-500');
    }
};

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };

    const btn = document.getElementById('regBtn');
    const msgDiv = document.getElementById('regMessage');

    btn.disabled = true;
    btn.innerHTML = 'Creating Account...';
    msgDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            msgDiv.innerHTML = `<span class="text-green-600">Account created successfully! Redirecting to login...</span>`;
            msgDiv.classList.remove('hidden');
            setTimeout(() => window.location.href = '/login.html', 2000);
        } else {
            const errorText = await response.text();
            msgDiv.innerHTML = `<span class="text-red-600">${errorText}</span>`;
            msgDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = 'Create Account';
        }
    } catch (error) {
        msgDiv.innerHTML = `<span class="text-red-600">Network error. Please try again.</span>`;
        msgDiv.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
    }
});