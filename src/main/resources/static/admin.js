document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('veristay_user');
    const token = localStorage.getItem('veristay_token');
    
    if (!userJson || !token) {
        window.location.href = '/login.html';
        return;
    }
    
    const user = JSON.parse(userJson);
    if (user.role !== 'ROLE_ADMIN') {
        alert("Access Denied: Super Admin clearance required.");
        window.location.href = '/'; 
        return;
    }

    // Set Admin Name in Header
    document.getElementById('header-admin-name').innerText = user.fullName || 'Admin';

    // Load all dashboard components
    loadAdminUsers(token);
    loadAdminProperties(token);
    loadAdminMessages(token); 

    // ==========================================
    // MOBILE SIDEBAR TOGGLE LOGIC
    // ==========================================
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-overlay');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    window.toggleSidebar = function() {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    }

    if (mobileBtn) mobileBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
});

// ==========================================
// VIEW SWITCHER LOGIC (SPA)
// ==========================================
window.switchView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-teal-500/10', 'text-teal-400', 'border-teal-500/20');
        btn.classList.add('text-slate-400', 'border-transparent');
    });
    
    document.getElementById(viewId).classList.remove('hidden');
    const activeBtn = event.currentTarget;
    activeBtn.classList.remove('text-slate-400', 'border-transparent');
    activeBtn.classList.add('bg-teal-500/10', 'text-teal-400', 'border-teal-500/20');
    document.getElementById('header-title').innerText = activeBtn.innerText.replace(/[^\w\s]/gi, '').trim();

    // Auto-close sidebar on mobile after clicking a tab
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
};

// ==========================================
// 1. USER & ADMIN MANAGEMENT
// ==========================================
async function loadAdminUsers(token) {
    const userTable = document.getElementById('admin-users-table');
    const adminTable = document.getElementById('admin-list-table');
    const currentUser = JSON.parse(localStorage.getItem('veristay_user'));
    
    try {
        // Fetch Normal Users (Buyers & Owners)
        const resUsers = await fetch('/api/users/all', { headers: { 'Authorization': `Bearer ${token}` }});
        const users = await resUsers.json();
        
        userTable.innerHTML = ''; 
        let totalOwners = 0; let totalBuyers = 0;

        users.forEach(u => {
            if (u.role === 'ROLE_OWNER') totalOwners++;
            else totalBuyers++;
            
            const roleBadge = u.role === 'ROLE_OWNER' 
                ? '<span class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Owner</span>'
                : '<span class="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Buyer</span>';

            userTable.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors" id="admin-user-row-${u.id}">
                    <td class="px-8 py-5"><p class="font-bold text-slate-900">${u.fullName || 'No Name'}</p><p class="text-slate-500 text-xs mt-1">${u.email}</p></td>
                    <td class="px-8 py-5 font-medium text-slate-700">${u.phone || 'N/A'}</td>
                    <td class="px-8 py-5">${roleBadge}</td>
                    <td class="px-8 py-5 text-right"><button onclick="deleteUserAsAdmin(${u.id})" class="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-bold transition-colors">Delete</button></td>
                </tr>
            `;
        });
        
        document.getElementById('stat-users').innerText = totalBuyers + totalOwners;
        document.getElementById('stat-owners').innerText = totalOwners;

        // Fetch Admins from New Admin Table
        const resAdmins = await fetch('/api/admins/all', { headers: { 'Authorization': `Bearer ${token}` }});
        const admins = await resAdmins.json();
        adminTable.innerHTML = '';

        admins.forEach(a => {
            const isCEO = a.email === 'ceo@veristay.com';
            const isSelf = a.email === currentUser.email;
            
            let actionBtn = `<button onclick="deleteAdmin(${a.id}, '${a.email}')" class="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl font-bold transition">Revoke</button>`;
            if (isCEO) actionBtn = `<span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">CEO</span>`;
            else if (isSelf) actionBtn = `<span class="text-slate-400 font-bold text-sm">(You)</span>`;

            adminTable.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors" id="admin-list-row-${a.id}">
                    <td class="px-8 py-5"><p class="font-bold text-slate-900">${a.fullName}</p><p class="text-slate-500 text-xs">${a.email}</p></td>
                    <td class="px-8 py-5 text-right">${actionBtn}</td>
                </tr>
            `;
        });
        
    } catch (error) { console.error("Load failed", error); }
}

// Create New Admin Logic
document.getElementById('create-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('veristay_token');
    const newAdmin = {
        fullName: document.getElementById('admin-name').value,
        email: document.getElementById('admin-email').value,
        password: document.getElementById('admin-pass').value
    };

    try {
        const res = await fetch('/api/admins/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newAdmin)
        });

        if (res.ok) {
            alert("Admin created in secure table!");
            document.getElementById('create-admin-form').reset();
            loadAdminUsers(token);
        } else {
            const data = await res.json();
            alert(data.error || "Failed to create admin.");
        }
    } catch (err) { alert("Network Error"); }
});

// Delete Normal User
window.deleteUserAsAdmin = async function(userId) {
    if (!confirm(`DANGER: Delete this user?`)) return;
    const token = localStorage.getItem('veristay_token');
    try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            document.getElementById(`admin-user-row-${userId}`).remove();
            loadAdminUsers(token);
            loadAdminProperties(token);
        } else { alert("Failed to delete user."); }
    } catch (e) { alert("Network Error"); }
};

// Delete Admin
window.deleteAdmin = async function(adminId, email) {
    if (email === 'ceo@veristay.com') {
        alert("SECURITY BREACH: CEO account cannot be deleted."); return;
    }
    if (!confirm(`DANGER: Revoke admin access for ${email}?`)) return;
    const token = localStorage.getItem('veristay_token');
    try {
        const res = await fetch(`/api/admins/${adminId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) loadAdminUsers(token);
    } catch (e) { alert("Network Error"); }
};

// ==========================================
// 2. PROPERTY MANAGEMENT
// ==========================================
async function loadAdminProperties(token) {
    const tableBody = document.getElementById('admin-property-table');
    try {
        const response = await fetch('/api/properties/admin/all', { headers: { 'Authorization': `Bearer ${token}` } });
        const properties = await response.json();
        
        tableBody.innerHTML = ''; 
        document.getElementById('stat-total').innerText = properties.length;
        document.getElementById('stat-pending').innerText = properties.filter(p => !p.verified).length;

        properties.forEach(prop => {
            const badge = prop.verified 
                ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">Verified</span>'
                : '<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">Pending</span>';

            const verifyBtn = prop.verified ? '' : `<button onclick="verifyProperty(${prop.id})" class="text-teal-600 hover:text-teal-800 font-bold px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">Verify</button>`;

            tableBody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors" id="admin-prop-row-${prop.id}">
                    <td class="px-8 py-5"><p class="font-bold text-slate-900">${prop.title}</p><p class="text-slate-500 text-xs mt-1">📍 ${prop.location}</p></td>
                    <td class="px-8 py-5 font-medium text-slate-700">${prop.ownerName || 'Unknown'}</td>
                    <td class="px-8 py-5">${badge}</td>
                    <td class="px-8 py-5 text-right space-x-2">
                        <a href="/details.html?id=${prop.id}" target="_blank" class="text-indigo-500 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">View</a>
                        ${verifyBtn}
                        <button onclick="deletePropertyAsAdmin(${prop.id})" class="text-rose-500 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error("Property load failed."); }
}

window.verifyProperty = async function(propertyId) {
    if (!confirm("Approve this listing?")) return;
    const token = localStorage.getItem('veristay_token');
    await fetch(`/api/properties/${propertyId}/verify`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    loadAdminProperties(token); 
};

window.deletePropertyAsAdmin = async function(propertyId) {
    if (!confirm("Permanently delete this property?")) return;
    const token = localStorage.getItem('veristay_token');
    await fetch(`/api/properties/${propertyId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    loadAdminProperties(token); 
};

// ==========================================
// 3. INBOX MANAGEMENT
// ==========================================
async function loadAdminMessages(token) {
    const grid = document.getElementById('admin-messages-grid');
    try {
        const res = await fetch('/api/contact/all', { headers: { 'Authorization': `Bearer ${token}` } });
        const messages = await res.json();
        
        grid.innerHTML = ''; 
        document.getElementById('msg-count-badge').innerText = `${messages.length} New`;

        if (messages.length === 0) {
            grid.innerHTML = '<p class="text-slate-400 font-bold col-span-full text-center py-10">Inbox is empty. All caught up! ✨</p>';
            return;
        }

        messages.forEach(msg => {
            const dateStr = new Date(msg.createdAt).toLocaleString();
            grid.innerHTML += `
                <div class="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between" id="msg-card-${msg.id}">
                    <div>
                        <h4 class="font-bold text-slate-900 leading-tight">${msg.subject}</h4>
                        <p class="text-xs text-slate-500 mt-1"><span class="font-bold text-slate-700">${msg.name}</span> (${msg.email})</p>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 my-4 h-32 overflow-y-auto custom-scrollbar">
                            <p class="text-sm text-slate-700">${msg.message}</p>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-2 border-t border-slate-100 pt-4">
                        <span class="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded uppercase">${dateStr}</span>
                        <div class="flex gap-2">
                            <button onclick="deleteMessage(${msg.id})" class="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors">Delete</button>
                            <a href="mailto:${msg.email}?subject=Re: ${msg.subject}" class="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">Reply</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("Message load failed.");
    }
}

window.deleteMessage = async function(msgId) {
    if (!confirm("Permanently delete this message?")) return;
    const token = localStorage.getItem('veristay_token');
    try {
        const res = await fetch(`/api/contact/${msgId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            loadAdminMessages(token); // Refresh the inbox
        } else {
            alert("Failed to delete message.");
        }
    } catch (e) {
        alert("Network Error");
    }
};