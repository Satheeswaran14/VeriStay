document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DYNAMIC NAVIGATION BAR INJECTION
    // ==========================================
    const userJson = localStorage.getItem('veristay_user');
    
    // Grab both desktop and mobile containers
    const desktopContainer = document.getElementById('nav-auth-container');
    const mobileContainer = document.getElementById('mobile-auth-container');
    
    let desktopLinks = '';
    let mobileLinks = '';

    if (userJson) {
        // LOGGED IN USER STATE
        const user = JSON.parse(userJson);
        const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';
        
        // Add Profile Avatar Link
        desktopLinks += `
            <a href="/profile.html" class="text-slate-800 font-bold hover:text-teal-600 transition flex items-center gap-2 mr-2" title="My Profile">
                <span class="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm shadow-inner">${firstName.charAt(0).toUpperCase()}</span>
                <span class="hidden sm:inline-block">${firstName}</span>
            </a>
        `;
        mobileLinks += `
            <a href="/profile.html" class="block px-4 py-3 rounded-xl bg-teal-50 text-teal-700 font-bold transition-colors">👤 Profile (${firstName})</a>
        `;
        
        // Role-Specific Action Buttons
        if (user.role === 'ROLE_ADMIN') {
            desktopLinks += `<a href="/admin.html" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-bold shadow-md transition mr-2">Admin Panel</a>`;
            mobileLinks += `<a href="/admin.html" class="block px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-center shadow-md">Admin Panel</a>`;
        } else if (user.role === 'ROLE_OWNER') {
            desktopLinks += `
                <a href="/owner-dashboard.html" class="text-slate-600 font-bold hover:text-teal-600 transition mr-4">Dashboard</a>
                <a href="/post-property.html" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full font-bold shadow-md transition mr-2">Post Property</a>
            `;
            mobileLinks += `
                <a href="/owner-dashboard.html" class="block px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors">Dashboard</a>
                <a href="/post-property.html" class="block px-4 py-3 rounded-xl bg-teal-600 text-white font-bold text-center shadow-md">Post Property</a>
            `;
        } else {
            desktopLinks += `<a href="/buyer-dashboard.html" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-bold shadow-md transition mr-2">My Wishlist ❤️</a>`;
            mobileLinks += `<a href="/buyer-dashboard.html" class="block px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-center shadow-md">My Wishlist ❤️</a>`;
        }
        
        // Logout Button
        desktopLinks += `<button onclick="logout()" class="text-red-500 font-bold hover:text-red-700 transition bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full">Logout</button>`;
        mobileLinks += `<button onclick="logout()" class="block w-full px-4 py-3 rounded-xl text-red-500 font-bold text-left hover:bg-red-50 transition-colors">Logout</button>`;
        
    } else {
        // GUEST STATE (Not Logged In)
        desktopLinks += `
            <div class="border-l border-slate-300 pl-5 flex items-center gap-4">
                <a href="/login.html" class="text-slate-600 font-bold hover:text-teal-600 transition">Log In</a>
                <a href="/register.html" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition hover-lift">Sign Up</a>
            </div>
        `;
        mobileLinks += `
            <a href="/login.html" class="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-center hover:bg-slate-50 transition-colors">Log In</a>
            <a href="/register.html" class="block w-full px-4 py-3 rounded-xl bg-teal-600 text-white font-bold text-center shadow-md hover:bg-teal-700 transition-colors">Sign Up</a>
        `;
    }

    // Safely inject the code into the UI
    if (desktopContainer) desktopContainer.innerHTML = desktopLinks;
    if (mobileContainer) mobileContainer.innerHTML = mobileLinks;

    // ==========================================
    // 2. GLOBAL FOOTER INJECTOR
    // ==========================================
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.className = "bg-slate-900 text-slate-400 py-12 border-t border-slate-800 rounded-t-[3rem] mx-2 sm:mx-4 mb-2 relative z-10";
        footerElement.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
                    <div class="col-span-1 md:col-span-2">
                        <div class="flex items-center gap-3 group cursor-pointer mb-4">
                            <div class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-teal-600 transition-colors duration-300">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                <div class="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5"><div class="bg-white rounded-full w-2.5 h-2.5 flex items-center justify-center"><svg class="w-2 h-2 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div></div>
                            </div>
                            <span class="text-xl font-bold text-white tracking-tight">VeriStay</span>
                        </div>
                        <p class="text-slate-400 max-w-sm leading-relaxed font-light">The premium real estate platform connecting buyers and verified owners directly. No middlemen, no hidden fees.</p>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h4>
                        <ul class="space-y-3 text-slate-400">
                            <li><a href="/" class="hover:text-teal-400 transition-colors">Home</a></li>
                            <li><a href="/about.html" class="hover:text-teal-400 transition-colors">About Us</a></li>
                            <li><a href="/contact.html" class="hover:text-teal-400 transition-colors">Contact Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-4 uppercase tracking-wider text-sm">Account</h4>
                        <ul class="space-y-3 text-slate-400">
                            <li><a href="/login.html" class="hover:text-teal-400 transition-colors">Sign In</a></li>
                            <li><a href="/register.html" class="hover:text-teal-400 transition-colors">Create Account</a></li>
                            <li><a href="/profile.html" class="hover:text-teal-400 transition-colors">My Profile</a></li>
                        </ul>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>© 2026 VeriStay Enterprise. All rights reserved.</p>
                    <div class="flex gap-4 mt-4 md:mt-0">
                        <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        `;
    }
});

// ==========================================
// 3. LOGOUT LOGIC
// ==========================================
function logout() {
    localStorage.removeItem('veristay_user');
    localStorage.removeItem('veristay_token'); 
    window.location.href = '/login.html';
}