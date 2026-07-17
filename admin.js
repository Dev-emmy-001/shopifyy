/* ============================================================
   admin.js — Fashion E-Commerce Admin Panel Logic
   Password-protected | Reads all localStorage store data
   ============================================================ */

'use strict';

// ---- CURRENCY HELPERS ----
function getCurrency() {
    return localStorage.getItem('fashionCurrency') || 'NGN';
}

function formatCurrency(amount) {
    const currency = getCurrency();
    if (currency === 'NGN') {
        return '₦' + parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
        const usdVal = parseFloat(amount) / 1000;
        return '$' + usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

function formatOrderAmount(amountStr) {
    if (!amountStr) return '';
    const isN = amountStr.includes('₦');
    let amt = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    if (!isN && amountStr.includes('$')) {
        amt = amt * 1000;
    } else if (!isN) {
        if (amt < 1000) amt = amt * 1000;
    }
    return formatCurrency(amt);
}

// ── Admin Credentials (change these for production) ──────
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };
const ADMIN_SESSION_KEY = 'fashionAdminSession';

// ── Panel Name Map ────────────────────────────────────────
const PANEL_NAMES = {
    overview:    'Store Overview',
    users:       'User Management',
    orders:      'All Orders',
    subscribers: 'Newsletter Subscribers',
    activity:    'Activity Feed',
    inventory:   'Product Inventory'
};

// ── Global Data ───────────────────────────────────────────
let allUsers       = [];
let allOrders      = [];
let allSubscribers = [];
let allActivity    = [];
let allWishlist    = [];

// ═══════════════════════════════════════════════════════════
//  ADMIN LOGIN
// ═══════════════════════════════════════════════════════════
function initAdminLogin() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard   = document.getElementById('admin-dashboard');

    // Check if already logged in
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
        loginScreen.style.display = 'none';
        dashboard.style.display   = 'flex';
        initDashboard();
        return;
    }

    // Eye toggle for admin password
    const eye      = document.getElementById('adminEye');
    const passInput = document.getElementById('adminPass');
    eye.addEventListener('click', () => {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            eye.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passInput.type = 'password';
            eye.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Login button
    document.getElementById('adminLoginBtn').addEventListener('click', attemptLogin);

    // Enter key triggers login
    [document.getElementById('adminUser'), passInput].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
    });
}

function attemptLogin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    const errEl = document.getElementById('adminLoginError');
    const btn   = document.getElementById('adminLoginBtn');

    errEl.textContent = '';

    if (!user || !pass) {
        errEl.textContent = 'Please enter both username and password.';
        return;
    }

    if (user === ADMIN_CREDS.username && pass === ADMIN_CREDS.password) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
            document.getElementById('admin-login-screen').style.display = 'none';
            document.getElementById('admin-dashboard').style.display    = 'flex';
            initDashboard();
        }, 900);
    } else {
        errEl.textContent = 'Invalid credentials. Please try again.';
        const passInput = document.getElementById('adminPass');
        passInput.style.animation = 'none';
        void passInput.offsetWidth;
        passInput.style.animation = 'shakeInput 0.4s ease';
    }
}

// ═══════════════════════════════════════════════════════════
//  DATA LOADING  — reads each user's namespaced keys
// ═══════════════════════════════════════════════════════════
function loadAllData() {
    allUsers = JSON.parse(localStorage.getItem('keyDetails')) || [];

    // Collect orders, wishlist, and activity from EVERY registered user's
    // namespaced keys (fashionOrders_{email}, etc.)
    allOrders   = [];
    allWishlist = [];
    allActivity = [];

    allUsers.forEach(u => {
        if (!u.email) return;

        // Orders
        const userOrders = JSON.parse(localStorage.getItem(`fashionOrders_${u.email}`)) || [];
        allOrders.push(...userOrders);

        // Wishlist
        const userWishlist = JSON.parse(localStorage.getItem(`fashionWishlist_${u.email}`)) || [];
        allWishlist.push(...userWishlist);

        // Activity
        const userActivity = JSON.parse(localStorage.getItem(`fashionActivity_${u.email}`)) || [];
        allActivity.push(...userActivity);
    });

    // Also check legacy (non-namespaced) keys for data created before this update
    const legacyOrders   = JSON.parse(localStorage.getItem('fashionOrders'))   || [];
    const legacyWishlist = JSON.parse(localStorage.getItem('fashionWishlist')) || [];
    const legacyActivity = JSON.parse(localStorage.getItem('fashionActivity')) || [];

    // Merge legacy data (avoid duplicates by order ID)
    const existingOrderIds = new Set(allOrders.map(o => o.id));
    legacyOrders.forEach(o => { if (!existingOrderIds.has(o.id)) allOrders.push(o); });
    allWishlist.push(...legacyWishlist);
    allActivity.push(...legacyActivity);

    // Sort orders newest first
    allOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    // Sort activity newest first
    allActivity.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Newsletter subscribers (global key, no user namespace)
    allSubscribers = JSON.parse(localStorage.getItem('fashionSubscribers')) || [];
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD INIT
// ═══════════════════════════════════════════════════════════
function initDashboard() {
    loadAllData();
    initNavigation();
    initSidebar();
    initTopbar();
    initClock();
    renderOverview();
    renderUsers();
    renderOrders();
    renderSubscribers();
    renderActivity();
    renderInventory();
    updateBadges();
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
function initNavigation() {
    const navLinks  = document.querySelectorAll('.admin-nav-link[data-panel]');
    const cardLinks = document.querySelectorAll('.admin-card-link[data-panel]');

    function navigate(panelId) {
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));

        const targetPanel = document.getElementById('panel-' + panelId);
        const targetNav   = document.querySelector(`.admin-nav-link[data-panel="${panelId}"]`);

        if (targetPanel) targetPanel.classList.add('active');
        if (targetNav)   targetNav.classList.add('active');
        document.getElementById('adminBreadcrumb').textContent = PANEL_NAMES[panelId] || panelId;

        // Close sidebar on mobile
        if (window.innerWidth <= 900) {
            document.getElementById('adminSidebar').classList.remove('open');
            document.getElementById('adminOverlay').classList.remove('open');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigate(link.dataset.panel);
        });
    });

    cardLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigate(link.dataset.panel);
        });
    });
}

// ═══════════════════════════════════════════════════════════
//  SIDEBAR & TOPBAR
// ═══════════════════════════════════════════════════════════
function initSidebar() {
    const sidebar  = document.getElementById('adminSidebar');
    const overlay  = document.getElementById('adminOverlay');
    const hamburger = document.getElementById('adminHamburger');
    const closeBtn  = document.getElementById('adminSidebarClose');

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    });

    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        document.getElementById('admin-dashboard').style.display   = 'none';
        document.getElementById('admin-login-screen').style.display = 'flex';
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        document.getElementById('adminLoginBtn').innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Access Admin Panel';
        document.getElementById('adminLoginBtn').disabled = false;
        showAdminToast('Logged out successfully.');
    });
}

function initTopbar() {
    document.getElementById('adminRefreshBtn').addEventListener('click', () => {
        const btn = document.getElementById('adminRefreshBtn');
        btn.classList.add('spinning');
        loadAllData();
        renderOverview();
        renderUsers();
        renderOrders();
        renderSubscribers();
        renderActivity();
        updateBadges();
        setTimeout(() => btn.classList.remove('spinning'), 700);
        showAdminToast('Data refreshed!');
    });
}

function initClock() {
    function updateClock() {
        const now = new Date();
        document.getElementById('adminClock').textContent =
            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// ═══════════════════════════════════════════════════════════
//  BADGES
// ═══════════════════════════════════════════════════════════
function updateBadges() {
    document.getElementById('userCountBadge').textContent  = allUsers.length;
    document.getElementById('orderCountBadge').textContent = allOrders.length;
    document.getElementById('subCountBadge').textContent   = allSubscribers.length;
}

// ═══════════════════════════════════════════════════════════
//  OVERVIEW PANEL
// ═══════════════════════════════════════════════════════════
function renderOverview() {
    // Date
    document.getElementById('overviewDate').textContent =
        new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // KPIs
    const revenue = allOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat((o.amount || '$0').replace(/[^0-9.]/g, '')), 0);

    animateCount('kpi-users',       allUsers.length);
    animateCount('kpi-revenue',     revenue,        true);
    animateCount('kpi-orders',      allOrders.length);
    animateCount('kpi-subscribers', allSubscribers.length);
    animateCount('kpi-processing',  allOrders.filter(o => o.status === 'processing').length);
    animateCount('kpi-wishlists',   allWishlist.length);

    // Recent Orders
    const recOrdersEl = document.getElementById('overviewRecentOrders');
    if (allOrders.length === 0) {
        recOrdersEl.innerHTML = adminEmpty('fa-box-archive', 'No orders yet.');
    } else {
        recOrdersEl.innerHTML = allOrders.slice(0, 5).map(o => `
            <div class="admin-order-row">
                <div class="admin-order-thumb">
                    <img src="${o.img}" onerror="this.src='https://via.placeholder.com/42x42/088178/fff?text=F'" alt="${o.product}">
                </div>
                <div class="admin-row-info">
                    <h6>${o.product}</h6>
                    <span>${o.id} · ${o.date || ''}</span>
                </div>
                <span class="status-badge ${o.status}" style="margin-left:auto;">${statusLabel(o.status)}</span>
                <strong style="min-width:60px;text-align:right;font-size:13px;">${o.amount}</strong>
            </div>
        `).join('');
    }

    // Recent Users
    const recUsersEl = document.getElementById('overviewRecentUsers');
    if (allUsers.length === 0) {
        recUsersEl.innerHTML = adminEmpty('fa-users', 'No registered users yet.');
    } else {
        recUsersEl.innerHTML = [...allUsers].reverse().slice(0, 5).map(u => {
            const initials = ((u.f_name||'U')[0] + (u.l_name||'')[0]).toUpperCase();
            const userOrders = allOrders.filter(o =>
                o.product && (u.email ? o.id.includes(u.email) : false) || true
            );
            return `
                <div class="admin-user-row">
                    <div class="admin-user-avatar">${initials}</div>
                    <div class="admin-row-info">
                        <h6>${u.f_name || ''} ${u.l_name || ''}</h6>
                        <span>${u.email}</span>
                    </div>
                    <span style="font-size:11px;color:var(--admin-text-mid);margin-left:auto;">
                        ${u.joinDate ? new Date(u.joinDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'N/A'}
                    </span>
                </div>`;
        }).join('');
    }

    // Status Breakdown Bar Chart
    const statusCounts = {
        processing: allOrders.filter(o => o.status === 'processing').length,
        transit:    allOrders.filter(o => o.status === 'transit').length,
        delivered:  allOrders.filter(o => o.status === 'delivered').length,
        cancelled:  allOrders.filter(o => o.status === 'cancelled').length,
    };
    const total = allOrders.length || 1;
    const barColors = {
        processing: '#088178',
        transit:    '#f4a261',
        delivered:  '#2a9d8f',
        cancelled:  '#e63946',
    };
    const barLabels = {
        processing: 'Processing',
        transit:    'In Transit',
        delivered:  'Delivered',
        cancelled:  'Cancelled',
    };

    document.getElementById('statusBreakdown').innerHTML = Object.entries(statusCounts).map(([key, count]) => `
        <div class="status-bar-row">
            <span class="status-bar-label">${barLabels[key]}</span>
            <div class="status-bar-track">
                <div class="status-bar-fill" style="width:0%;background:${barColors[key]};"
                     data-target="${Math.round((count / total) * 100)}"></div>
            </div>
            <span class="status-bar-count">${count}</span>
        </div>
    `).join('');

    // Animate bars
    setTimeout(() => {
        document.querySelectorAll('.status-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    }, 100);
}

// ═══════════════════════════════════════════════════════════
//  USER MANAGEMENT PANEL
// ═══════════════════════════════════════════════════════════
function renderUsers(filter = '') {
    const tbody    = document.getElementById('usersTableBody');
    const totalEl  = document.getElementById('usersTotal');
    const filtered = filter
        ? allUsers.filter(u =>
            `${u.f_name} ${u.l_name} ${u.email}`.toLowerCase().includes(filter.toLowerCase()))
        : allUsers;

    totalEl.textContent = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">${adminEmpty('fa-users', filter ? 'No users match your search.' : 'No users registered yet.')}</td></tr>`;
        return;
    }

    tbody.innerHTML = [...filtered].reverse().map((u, i) => {
        const initials  = ((u.f_name||'U')[0] + (u.l_name||'')[0]).toUpperCase();
        const joinDate  = u.joinDate ? new Date(u.joinDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Unknown';
        const realIndex = allUsers.indexOf(u);
        return `
            <tr>
                <td>${i + 1}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="admin-user-avatar" style="width:36px;height:36px;font-size:13px;">${initials}</div>
                        <div>
                            <strong style="font-size:13px;">${u.f_name || ''} ${u.l_name || ''}</strong>
                        </div>
                    </div>
                </td>
                <td><span style="color:var(--admin-text-mid);">${u.email}</span></td>
                <td><span style="font-size:12px;color:var(--admin-text-mid);">${joinDate}</span></td>
                <td><span class="status-badge processing">${allOrders.length > 0 ? Math.floor(Math.random() * 5) : 0}</span></td>
                <td><span style="color:var(--admin-primary2);">—</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-view" onclick="openUserModal(${realIndex})">View</button>
                        <button class="btn-delete-small" onclick="deleteUser(${realIndex})" title="Delete user">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', e => renderUsers(e.target.value));
    }
});

window.openUserModal = function(index) {
    const u = allUsers[index];
    if (!u) return;

    const initials = ((u.f_name||'U')[0] + (u.l_name||'')[0]).toUpperCase();
    const joinDate = u.joinDate ? new Date(u.joinDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Unknown';

    document.getElementById('userModalTitle').textContent = `${u.f_name} ${u.l_name}`;
    document.getElementById('userModalContent').innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div class="admin-user-avatar" style="width:60px;height:60px;font-size:20px;flex-shrink:0;">${initials}</div>
            <div>
                <h5 style="font-size:18px;font-weight:700;margin-bottom:4px;">${u.f_name} ${u.l_name}</h5>
                <span style="color:var(--admin-text-mid);font-size:14px;">${u.email}</span>
            </div>
        </div>
        <div class="user-detail-stat">
            <div class="user-detail-stat-card">
                <h3>${allOrders.length}</h3>
                <p>Store Orders</p>
            </div>
            <div class="user-detail-stat-card">
                <h3>${allWishlist.length}</h3>
                <p>Wishlist Items</p>
            </div>
            <div class="user-detail-stat-card">
                <h3>${allSubscribers.find(s => s.email === u.email) ? '✓' : '✗'}</h3>
                <p>Subscribed</p>
            </div>
        </div>
        <div style="background:var(--admin-surface2);border-radius:10px;padding:14px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--admin-border);">
                <span style="color:var(--admin-text-mid);">Email</span>
                <strong>${u.email}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
                <span style="color:var(--admin-text-mid);">Joined</span>
                <strong>${joinDate}</strong>
            </div>
        </div>
        <button class="btn-delete-small" style="margin-top:16px;padding:10px 16px;width:100%;
            justify-content:center;display:flex;align-items:center;gap:6px;font-size:13px;"
            onclick="deleteUser(${index});closeUserModal();">
            <i class="fa-solid fa-trash"></i> Delete This Account
        </button>`;

    document.getElementById('userDetailModal').classList.add('open');
};

function closeUserModal() {
    document.getElementById('userDetailModal').classList.remove('open');
}

document.getElementById('closeUserModal').addEventListener('click', closeUserModal);

window.deleteUser = function(index) {
    if (!confirm('Delete this user account? This cannot be undone.')) return;
    const name = `${allUsers[index].f_name} ${allUsers[index].l_name}`;
    allUsers.splice(index, 1);
    localStorage.setItem('keyDetails', JSON.stringify(allUsers));
    renderUsers();
    renderOverview();
    updateBadges();
    showAdminToast(`User "${name}" deleted.`);
};

// ═══════════════════════════════════════════════════════════
//  ORDERS PANEL
// ═══════════════════════════════════════════════════════════
function renderOrders(filter = 'all', search = '') {
    const tbody    = document.getElementById('ordersTableBody');
    const totalEl  = document.getElementById('ordersTotal');

    let filtered = allOrders;
    if (filter !== 'all')  filtered = filtered.filter(o => o.status === filter);
    if (search)            filtered = filtered.filter(o =>
        `${o.id} ${o.product} ${o.brand}`.toLowerCase().includes(search.toLowerCase()));

    totalEl.textContent = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">${adminEmpty('fa-box-open', 'No orders found.')}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((o, i) => {
        const realIndex = allOrders.indexOf(o);
        return `
        <tr>
            <td><strong style="font-size:12px;">${o.id}</strong></td>
            <td>
                <div class="product-cell">
                    <img src="${o.img}" onerror="this.src='https://via.placeholder.com/40x40/088178/fff?text=F'" alt="${o.product}">
                    <div>
                        <strong style="font-size:13px;">${o.product}</strong><br>
                        <span style="font-size:11px;color:var(--admin-text-mid);">${o.brand || ''}</span>
                    </div>
                </div>
            </td>
            <td style="font-size:12px;color:var(--admin-text-mid);">${o.date || 'N/A'}</td>
            <td><strong style="color:var(--admin-primary2);">${o.amount}</strong></td>
            <td><span class="status-badge ${o.status}">${statusLabel(o.status)}</span></td>
            <td>
                <select class="status-select" onchange="updateOrderStatus(${realIndex}, this.value)">
                    <option value="processing" ${o.status==='processing'?'selected':''}>Processing</option>
                    <option value="transit"    ${o.status==='transit'?'selected':''}>In Transit</option>
                    <option value="delivered"  ${o.status==='delivered'?'selected':''}>Delivered</option>
                    <option value="cancelled"  ${o.status==='cancelled'?'selected':''}>Cancelled</option>
                </select>
            </td>
        </tr>`;
    }).join('');
}

window.updateOrderStatus = function(index, newStatus) {
    allOrders[index].status = newStatus;
    localStorage.setItem('fashionOrders', JSON.stringify(allOrders));

    const currentFilter = document.getElementById('orderStatusFilter').value;
    const currentSearch = document.getElementById('orderSearch').value;
    renderOrders(currentFilter, currentSearch);
    renderOverview();
    showAdminToast(`Order ${allOrders[index].id} updated to "${statusLabel(newStatus)}".`);
};

document.addEventListener('DOMContentLoaded', () => {
    const filterSel   = document.getElementById('orderStatusFilter');
    const orderSearch = document.getElementById('orderSearch');

    if (filterSel) {
        filterSel.addEventListener('change', () => renderOrders(filterSel.value, orderSearch?.value || ''));
    }
    if (orderSearch) {
        orderSearch.addEventListener('input', () => renderOrders(filterSel?.value || 'all', orderSearch.value));
    }
});

// ═══════════════════════════════════════════════════════════
//  SUBSCRIBERS PANEL
// ═══════════════════════════════════════════════════════════
function renderSubscribers() {
    const tbody   = document.getElementById('subsTableBody');
    const totalEl = document.getElementById('subsTotal');
    totalEl.textContent = allSubscribers.length;

    if (allSubscribers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">${adminEmpty('fa-envelope-open-text', 'No newsletter subscribers yet.')}</td></tr>`;
        return;
    }

    tbody.innerHTML = [...allSubscribers].reverse().map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong style="font-size:13px;">${s.email}</strong></td>
            <td style="font-size:12px;color:var(--admin-text-mid);">
                ${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Unknown'}
            </td>
            <td>
                <button class="btn-delete-small" onclick="deleteSubscriber(${allSubscribers.indexOf(s)})">
                    <i class="fa-solid fa-trash"></i> Remove
                </button>
            </td>
        </tr>
    `).join('');
}

window.deleteSubscriber = function(index) {
    const email = allSubscribers[index].email;
    if (!confirm(`Remove "${email}" from subscribers?`)) return;
    allSubscribers.splice(index, 1);
    localStorage.setItem('fashionSubscribers', JSON.stringify(allSubscribers));
    renderSubscribers();
    updateBadges();
    showAdminToast('Subscriber removed.');
};

document.getElementById('exportSubsBtn').addEventListener('click', () => {
    if (allSubscribers.length === 0) {
        showAdminToast('No subscribers to export.');
        return;
    }
    const csv = 'Email,Subscribed On\n' + allSubscribers.map(s =>
        `${s.email},${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : 'Unknown'}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'fashion_subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
    showAdminToast('Subscribers exported as CSV!');
});

// ═══════════════════════════════════════════════════════════
//  ACTIVITY FEED PANEL
// ═══════════════════════════════════════════════════════════
function renderActivity() {
    const listEl = document.getElementById('adminActivityList');

    if (allActivity.length === 0) {
        listEl.innerHTML = adminEmpty('fa-bolt', 'No activity recorded yet. Users need to interact with the store.');
        return;
    }

    listEl.innerHTML = allActivity.map(item => `
        <div class="admin-activity-item">
            <div class="activity-icon ${item.iconClass || 'teal'}">
                <i class="fa-solid ${item.icon || 'fa-circle'}"></i>
            </div>
            <div class="activity-body">
                <p>${item.msg}</p>
                <span>${timeAgo(item.timestamp || item.time)}</span>
            </div>
        </div>
    `).join('');
}

document.getElementById('clearActivityBtn').addEventListener('click', () => {
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    allActivity = [];
    localStorage.removeItem('fashionActivity');
    renderActivity();
    showAdminToast('Activity feed cleared.');
});

// ═══════════════════════════════════════════════════════════
//  INVENTORY PANEL
// ═══════════════════════════════════════════════════════════
function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    if (typeof products === 'undefined' || Object.keys(products).length === 0) {
        grid.innerHTML = adminEmpty('fa-shirt', 'No products found. Make sure products.js is loaded.');
        return;
    }

    grid.innerHTML = Object.values(products).map(p => `
        <div class="admin-inventory-card">
            <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/200x160/088178/fff?text=Fashion'">
            <div class="admin-inventory-card-body">
                <span class="inv-id-badge">${p.id.toUpperCase()}</span>
                <h5>${p.name}</h5>
                <span>${p.brand}</span>
                <div class="admin-inventory-price">${formatCurrency(p.price)}</div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
function statusLabel(s) {
    return { delivered:'Delivered', transit:'In Transit', processing:'Processing', cancelled:'Cancelled' }[s] || s;
}

function adminEmpty(icon, msg) {
    return `<div class="admin-empty"><i class="fa-solid ${icon}"></i><p>${msg}</p></div>`;
}

function timeAgo(dateString) {
    if (!dateString) return '';
    if (!dateString.includes('T')) return dateString;
    const date    = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60)   return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)   return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)     return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function animateCount(elId, target, isCurrency = false) {
    const el       = document.getElementById(elId);
    if (!el) return;
    const duration = 1000;
    const stepTime = 16;
    const steps    = Math.max(duration / stepTime, 1);
    const inc      = target / steps;
    let current    = 0;

    const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = isCurrency
            ? formatCurrency(current)
            : Math.round(current).toString();
    }, stepTime);
}

// ─── Admin Toast ─────────────────────────────────────────
let adminToastEl = null;

function showAdminToast(msg) {
    if (!adminToastEl) {
        adminToastEl = document.createElement('div');
        adminToastEl.className = 'admin-toast';
        adminToastEl.innerHTML = '<i class="fa-solid fa-circle-check"></i><span></span>';
        document.body.appendChild(adminToastEl);
    }
    adminToastEl.querySelector('span').textContent = msg;
    adminToastEl.classList.add('show');
    clearTimeout(adminToastEl._t);
    adminToastEl._t = setTimeout(() => adminToastEl.classList.remove('show'), 3000);
}

// ─── Modal close on overlay ───────────────────────────────
document.getElementById('userDetailModal').addEventListener('click', e => {
    if (e.target === document.getElementById('userDetailModal')) closeUserModal();
});

// ─── Escape key closes modal ──────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeUserModal();
});

// ─── Keyframe for input shake ─────────────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shakeInput {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-8px); }
        40%       { transform: translateX(8px); }
        60%       { transform: translateX(-6px); }
        80%       { transform: translateX(6px); }
    }
`;
document.head.appendChild(shakeStyle);

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', initAdminLogin);
