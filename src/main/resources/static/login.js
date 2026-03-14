document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: true });

    // Redirect if already logged in
    if (localStorage.getItem('veristay_token')) {
        const user = JSON.parse(localStorage.getItem('veristay_user') || '{}');
        redirectUser(user.role);
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('loginError');

        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Signing In...`;
        errorDiv.classList.add('hidden');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('veristay_token', data.token);
                localStorage.setItem('veristay_user', JSON.stringify(data.user));
                redirectUser(data.user.role);
            } else {
                const msg = await response.text();
                errorDiv.innerText = msg || "Invalid credentials. Please try again.";
                errorDiv.classList.remove('hidden');
                resetBtn();
            }
        } catch (error) {
            errorDiv.innerText = "Network error. Is the server running?";
            errorDiv.classList.remove('hidden');
            resetBtn();
        }

        function resetBtn() {
            btn.disabled = false;
            btn.innerHTML = 'Sign In';
        }
    });

    function redirectUser(role) {
        if (role === 'ROLE_ADMIN') window.location.href = '/admin.html';
        else if (role === 'ROLE_OWNER') window.location.href = '/owner-dashboard.html';
        else window.location.href = '/';
    }
});