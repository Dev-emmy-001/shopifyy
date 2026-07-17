/* ================================================
   FASHION E-COMMERCE | DASHBOARD JAVASCRIPT
   ================================================ */

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
    const isNaira = amountStr.includes('₦');
    let amt = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    if (!isNaira && amountStr.includes('$')) {
        amt = amt * 1000;
    } else if (!isNaira && !isNaira) {
        if (amt < 1000) amt = amt * 1000;
    }
    return formatCurrency(amt);
}


// ---- DATA ---- (loaded from localStorage, no hardcoded data)
let ORDERS        = [];
let WISHLIST      = [];
let NOTIFICATIONS = [];

// ---- NAMESPACE HELPERS ----
function getDashEmail() {
    const u = JSON.parse(localStorage.getItem('loggedInUser'));
    return u ? u.email : '';
}

function getUserOrdersKey()   { const e = getDashEmail(); return e ? `fashionOrders_${e}`   : 'fashionOrders'; }
function getUserWishlistKey() { const e = getDashEmail(); return e ? `fashionWishlist_${e}` : 'fashionWishlist'; }
function getUserActivityKey() { const e = getDashEmail(); return e ? `fashionActivity_${e}` : 'fashionActivity'; }

// Load dynamic data from localStorage (user-specific only)
function loadDynamicData() {
    ORDERS        = JSON.parse(localStorage.getItem(getUserOrdersKey()))   || [];
    WISHLIST      = JSON.parse(localStorage.getItem(getUserWishlistKey())) || [];
    NOTIFICATIONS = JSON.parse(localStorage.getItem(getUserActivityKey())) || [];
}

// ---- USER DATA ----
let userData = {
    firstName: 'User',
    lastName:  '',
    email:     '',
    phone:     '',
    dob:       '',
    gender:    'Prefer not to say',
};

// Load from the active session (loggedInUser), not the last keyDetails entry
function loadUserData() {
    const sessionUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (sessionUser) {
        userData.firstName = sessionUser.f_name || 'User';
        userData.lastName  = sessionUser.l_name || '';
        userData.email     = sessionUser.email  || '';
    }
}

function getInitials() {
    return (userData.firstName[0] + (userData.lastName[0] || '')).toUpperCase();
}

function getFullName() { return `${userData.firstName} ${userData.lastName}`; }

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    // ── AUTH GUARD: Redirect to Login if no session ──────
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        window.location.href = 'Login.html';
        return;
    }

    loadDynamicData();
    loadUserData();
    initUserDisplay();
    initNavigation();
    initSidebar();
    initTopbar();
    initOrders();
    initWishlist();
    initNotifications();
    initProfile();
    initSettings();
    initModals();
    initGlobalSearch();
    initCartOverview();
    updateOverviewStats();
});

function updateOverviewStats() {
    // ── Total Orders ──────────────────────────────────────────
    const totalOrders = ORDERS.length;
    document.getElementById('totalOrdersStat').textContent = totalOrders;
    const orderTrendEl = document.getElementById('ordersTrendText');
    if (orderTrendEl) {
        if (totalOrders === 0) {
            orderTrendEl.className = 'stat-trend neutral';
            orderTrendEl.innerHTML = '<i class="fa-solid fa-minus"></i> No orders yet';
        } else {
            orderTrendEl.className = 'stat-trend up';
            orderTrendEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${totalOrders} order${totalOrders !== 1 ? 's' : ''} placed`;
        }
    }

    // ── Total Spent ───────────────────────────────────────────
    let totalSpent = 0;
    ORDERS.forEach(o => {
        if (o.status !== 'cancelled') {
            const isN = (o.amount || '').includes('₦');
            let amt = parseFloat((o.amount || '0').replace(/[^0-9.]/g, '')) || 0;
            if (!isN && (o.amount || '').includes('$')) {
                amt = amt * 1000;
            } else if (!isN && !(o.amount || '').includes('₦')) {
                if (amt < 1000) amt = amt * 1000;
            }
            totalSpent += amt;
        }
    });
    const spentEl = document.getElementById('totalSpentStat');
    if (spentEl) spentEl.textContent = formatCurrency(totalSpent);

    // ── In Transit ────────────────────────────────────────────
    const inTransit = ORDERS.filter(o => o.status === 'transit').length;
    const transitEl = document.getElementById('inTransitStat');
    if (transitEl) transitEl.textContent = inTransit;
    const transitTrendEl = document.getElementById('transitTrendText');
    if (transitTrendEl) {
        if (inTransit === 0) {
            transitTrendEl.className = 'stat-trend neutral';
            transitTrendEl.innerHTML = '<i class="fa-solid fa-minus"></i> None in transit';
        } else {
            transitTrendEl.className = 'stat-trend up';
            transitTrendEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${inTransit} shipment${inTransit !== 1 ? 's' : ''} on the way`;
        }
    }

    // ── Wishlist Count ────────────────────────────────────────
    const wishEl = document.getElementById('wishlistStat');
    if (wishEl) wishEl.textContent = WISHLIST.length;

    // ── Sidebar Orders Badge ──────────────────────────────────
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
        ordersBadge.textContent = totalOrders;
        ordersBadge.style.display = totalOrders > 0 ? 'inline-flex' : 'none';
    }

    // ── Recent Orders List ────────────────────────────────────
    const recentList = document.getElementById('recentOrdersList');
    if (recentList) {
        if (ORDERS.length === 0) {
            recentList.innerHTML = `
                <div style="text-align:center;padding:32px 20px;color:var(--text-light);">
                    <i class="fa-solid fa-box-open" style="font-size:32px;opacity:0.25;margin-bottom:10px;display:block;"></i>
                    <p style="font-size:14px;">No orders placed yet.</p>
                    <a href="shop.html" style="display:inline-block;margin-top:12px;padding:8px 20px;
                       background:linear-gradient(135deg,#088178,#04b49c);color:#fff;border-radius:8px;
                       font-size:13px;font-weight:600;text-decoration:none;">Start Shopping</a>
                </div>`;
        } else {
            recentList.innerHTML = ORDERS.slice(0, 4).map(o => `
                <div class="order-row">
                    <div class="order-thumb">
                        <img src="${o.img || ''}" alt="${o.product}"
                             onerror="this.src='https://via.placeholder.com/50x50/088178/fff?text=F'">
                    </div>
                    <div class="order-info">
                        <h6>${o.product}</h6>
                        <span class="order-id">${o.id}</span>
                    </div>
                    <span class="order-status ${o.status}">${statusText(o.status)}</span>
                    <span class="order-price">${formatOrderAmount(o.amount)}</span>
                </div>`).join('');
        }
    }
}

function statusText(s) {
    const map = { delivered: 'Delivered', transit: 'In Transit', processing: 'Processing', cancelled: 'Cancelled' };
    return map[s] || s;
}

function initCartOverview() {
    const email = getDashEmail();
    const cartKey = email ? `fashionCartItems_${email}` : 'fashionCartItems';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const container = document.getElementById('dashboardActiveCartList');
    if (!container) return;

    // Update active cart badge in topbar
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const topbarCartBadge = document.getElementById('topbarCartBadge');
    if (topbarCartBadge) {
        topbarCartBadge.textContent = totalItems;
        topbarCartBadge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-light);">
                <i class="fa-solid fa-shopping-bag" style="font-size:32px;opacity:0.3;margin-bottom:10px;"></i>
                <br>Your cart is empty.
            </div>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="order-row">
            <div class="order-thumb"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50x50/088178/fff?text=F'"></div>
            <div class="order-info">
                <h6>${item.name}</h6>
                <span class="order-id">Qty: ${item.qty}</span>
            </div>
            <span class="order-price" style="margin-left:auto;">${formatCurrency(item.price * item.qty)}</span>
        </div>
    `).join('');
}

// ---- USER DISPLAY ----
function initUserDisplay() {
    const initials = getInitials();
    const fullName = getFullName();

    document.getElementById('sidebarAvatar').querySelector('#avatarInitials').textContent = initials;
    document.getElementById('sidebarUserName').textContent = fullName;
    document.getElementById('sidebarUserEmail').textContent = userData.email;
    document.getElementById('topbarAvatar').textContent = initials;
    document.getElementById('topbarUserName').textContent = userData.firstName + ' ' + (userData.lastName[0] || '') + '.';
    document.getElementById('welcomeName').textContent = userData.firstName;
    document.getElementById('profileAvatarLarge').textContent = initials;
    document.getElementById('profileFullName').textContent = fullName;
    document.getElementById('profileEmailDisplay').textContent = userData.email;

    // Prefill profile form
    document.getElementById('editFirstName').value = userData.firstName;
    document.getElementById('editLastName').value = userData.lastName;
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editPhone').value = userData.phone;
}

// ---- NAVIGATION ----
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');
    const breadcrumb = document.getElementById('breadcrumbSection');

    function navigateTo(sectionId) {
        sections.forEach(s => s.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));

        const targetSection = document.getElementById('section-' + sectionId);
        const targetNav = document.getElementById('nav-' + sectionId);

        if (targetSection) targetSection.classList.add('active');
        if (targetNav) targetNav.classList.add('active');
        if (breadcrumb) breadcrumb.textContent = formatSectionName(sectionId);

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.section);
        });
    });

    // Section links inside cards (quick actions, "View all", etc.)
    document.addEventListener('click', e => {
        const link = e.target.closest('[data-section]');
        if (link && !link.classList.contains('nav-link')) {
            e.preventDefault();
            navigateTo(link.dataset.section);
        }
    });
}

function formatSectionName(id) {
    const map = {
        overview: 'Overview', orders: 'My Orders', wishlist: 'Wishlist',
        addresses: 'Addresses', payments: 'Payment Methods',
        notifications: 'Notifications', profile: 'Edit Profile', settings: 'Settings'
    };
    return map[id] || id;
}

// ---- SIDEBAR ----
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const sidebarClose = document.getElementById('sidebarClose');
    const overlay = document.getElementById('overlay');

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    });

    sidebarClose.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', e => {
        e.preventDefault();
        // Clear both the user list session and the logged-in session
        localStorage.removeItem('loggedInUser');
        showToast('Logged out successfully!');
        setTimeout(() => { window.location.href = 'Login.html'; }, 1500);
    });
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// ---- TOPBAR ----
function initTopbar() {
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const markAllRead = document.getElementById('markAllRead');

    notifBtn.addEventListener('click', e => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
            notifDropdown.classList.remove('open');
        }
    });

    markAllRead.addEventListener('click', () => {
        // Update DOM
        document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
        document.querySelectorAll('.icon-badge.pulse').forEach(b => {
            b.textContent = '0';
            b.style.display = 'none';
        });
        const notifBadge = document.getElementById('notifBadge');
        if (notifBadge) notifBadge.style.display = 'none';
        
        // Update localStorage
        const activities = JSON.parse(localStorage.getItem('fashionActivity')) || [];
        activities.forEach(a => a.unread = false);
        localStorage.setItem('fashionActivity', JSON.stringify(activities));
        
        // Update NOTIFICATIONS array in memory
        NOTIFICATIONS.forEach(n => n.unread = false);

        showToast('All notifications marked as read.');
    });

    // Notification footer link
    document.querySelector('.notif-footer').addEventListener('click', e => {
        e.preventDefault();
        notifDropdown.classList.remove('open');
    });
}

// ---- ORDERS ----
function initOrders() {
    renderOrders(ORDERS);

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const filtered = filter === 'all' ? ORDERS : ORDERS.filter(o => o.status === filter);
            renderOrders(filtered);
        });
    });

    // Search
    document.getElementById('orderSearch').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = ORDERS.filter(o =>
            o.product.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q) ||
            o.brand.toLowerCase().includes(q)
        );
        renderOrders(filtered);
    });
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    const recentContainer = document.querySelector('.overview-grid .card .order-list');

    // Update Overview Recent Orders (first 3)
    if (recentContainer && orders === ORDERS) {
        if (ORDERS.length === 0) {
            recentContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-light);">No recent orders.</div>`;
        } else {
            recentContainer.innerHTML = ORDERS.slice(0, 3).map(o => `
                <div class="order-row">
                    <div class="order-thumb"><img src="${o.img}" alt="${o.product}" onerror="this.src='https://via.placeholder.com/50x50/088178/fff?text=F'"></div>
                    <div class="order-info">
                        <h6>${o.product}</h6>
                        <span class="order-id">${o.id}</span>
                    </div>
                    <span class="order-status ${o.status}">${statusLabel(o.status)}</span>
                    <span class="order-price">${formatOrderAmount(o.amount)}</span>
                </div>
            `).join('');
        }
    }

    if (!tbody) return;
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-light);">
            <i class="fa-solid fa-box-open" style="font-size:40px;margin-bottom:12px;display:block;opacity:0.3;"></i>
            No orders found.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map((o, i) => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>
                <div class="order-product-cell">
                    <img src="${o.img}" alt="${o.product}" onerror="this.src='https://via.placeholder.com/44x44/088178/fff?text=F'">
                    <div>
                        <strong>${o.product}</strong>
                        <span>${o.brand}</span>
                    </div>
                </div>
            </td>
            <td>${o.date}</td>
            <td><strong>${formatOrderAmount(o.amount)}</strong></td>
            <td><span class="order-status ${o.status}">${statusLabel(o.status)}</span></td>
            <td><button class="btn-view" onclick="openOrderModal(${i})">View</button></td>
        </tr>
    `).join('');
}

function statusLabel(s) {
    const map = { delivered: 'Delivered', transit: 'In Transit', processing: 'Processing', cancelled: 'Cancelled' };
    return map[s] || s;
}

// ---- ORDER MODAL ----
window.openOrderModal = function(index) {
    const o = ORDERS[index];
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderModalContent');

    const steps = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
    const stepIndex = { processing: 1, transit: 2, delivered: 3, cancelled: 0 };
    const current = stepIndex[o.status] ?? 0;

    const stepsHTML = steps.map((step, i) => {
        let cls = i <= current ? 'done' : (i === current + 1 ? 'active' : 'pending');
        if (o.status === 'cancelled') cls = i === 0 ? 'done' : 'pending';
        const lineClass = i < current ? 'done' : '';
        return `
            ${i > 0 ? `<div class="step-line ${lineClass}"></div>` : ''}
            <div class="step">
                <div class="step-dot ${cls}">
                    <i class="fa-solid ${i <= current && o.status !== 'cancelled' ? 'fa-check' : (i === 0 ? 'fa-check' : 'fa-circle')}"></i>
                </div>
                <label>${step}</label>
            </div>
        `;
    }).join('');

        const isN = o.amount.includes('₦');
        let amt = parseFloat(o.amount.replace(/[^0-9.]/g, '')) || 0;
        if (!isN && o.amount.includes('$')) {
            amt = amt * 1000;
        } else if (!isN) {
            if (amt < 1000) amt = amt * 1000;
        }

        const subtotalFormatted = formatCurrency(amt);
        const taxFormatted = formatCurrency(amt * 0.05);
        const totalFormatted = formatCurrency(amt * 1.05);

        content.innerHTML = `
            <div class="order-detail-header">
                <div>
                    <strong>Order ID:</strong> ${o.id}<br>
                    <small style="color:var(--text-light);">Placed on ${o.date}</small>
                </div>
                <span class="order-status ${o.status}">${statusLabel(o.status)}</span>
            </div>
            <div class="order-detail-steps">${stepsHTML}</div>
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
                <img src="${o.img}" onerror="this.src='https://via.placeholder.com/64x64/088178/fff?text=F'" 
                     style="width:64px;height:64px;border-radius:10px;object-fit:cover;">
                <div>
                    <strong>${o.product}</strong><br>
                    <span style="color:var(--text-light);font-size:13px;">Brand: ${o.brand}</span>
                </div>
            </div>
            <table class="order-detail-table">
                <tr><td>Subtotal</td><td>${subtotalFormatted}</td></tr>
                <tr><td>Shipping</td><td>Free</td></tr>
                <tr><td>Tax (5%)</td><td>${taxFormatted}</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>${totalFormatted}</strong></td></tr>
            </table>
            ${o.status !== 'cancelled' && o.status !== 'delivered' ? 
                `<button class="btn-submit" style="margin-top:16px;" onclick="showToast('Order tracking updated!')">
                    <i class="fa-solid fa-truck"></i> Track Package
                </button>` : ''}
        `;

    modal.classList.add('open');
};

// ---- WISHLIST ----
function initWishlist() {
    renderWishlist(WISHLIST);
}

function renderWishlist(items) {
    const grid = document.getElementById('wishlistGrid');
    if (items.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light);">
            <i class="fa-solid fa-heart" style="font-size:48px;margin-bottom:16px;display:block;opacity:0.2;"></i>
            <h4 style="color:var(--text-mid)">Your wishlist is empty</h4>
            <a href="shop.html" class="btn-submit" style="display:inline-block;width:auto;padding:12px 28px;margin-top:16px;">Start Shopping</a>
        </div>`;
        return;
    }

    grid.innerHTML = items.map((item, i) => `
        <div class="wishlist-card" data-wish-id="${item.id}">
            <div class="wishlist-remove-overlay" onclick="removeWishlistItem(${i})" title="Remove from wishlist">
                <i class="fa-solid fa-times"></i>
            </div>
            <div class="wishlist-card-img">
                <img src="${item.img}" alt="${item.product}" 
                     onerror="this.src='https://via.placeholder.com/220x180/088178/fff?text=Fashion'">
            </div>
            <div class="wishlist-card-body">
                <span>${item.brand}</span>
                <h5>${item.product}</h5>
                <span class="price">${item.price}</span>
            </div>
            <div class="wishlist-card-footer">
                <button class="btn-add-cart" onclick="addToCart(${i})">
                    <i class="fa-solid fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn-remove-wish" onclick="removeWishlistItem(${i})" title="Remove">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.removeWishlistItem = function(index) {
    const removed = WISHLIST.splice(index, 1)[0];
    localStorage.setItem('fashionWishlist', JSON.stringify(WISHLIST));
    renderWishlist(WISHLIST);
    updateWishlistBadge();
    showToast('Item removed from wishlist.');
    
    // Log Activity
    const activities = JSON.parse(localStorage.getItem('fashionActivity')) || [];
    activities.unshift({
        msg: `Removed <strong>${removed.product}</strong> from wishlist.`,
        icon: 'fa-times',
        iconClass: 'orange',
        timestamp: new Date().toISOString(),
        unread: true
    });
    if (activities.length > 50) activities.pop();
    localStorage.setItem('fashionActivity', JSON.stringify(activities));
    
    // Re-init notifications so it shows up
    NOTIFICATIONS = [...JSON.parse(localStorage.getItem('fashionActivity') || '[]'), ...NOTIFICATIONS.filter(n => !n.timestamp)];
    initNotifications();
};

window.addToCart = function(index) {
    const item = WISHLIST[index];
    
    // Add to actual cart in localStorage
    const cart = JSON.parse(localStorage.getItem('fashionCartItems')) || [];
    const cartId = item.id.toString();
    const existing = cart.find(c => c.id === cartId);
    
    const priceNum = parseFloat(item.price.replace('$', ''));
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: cartId, name: item.product, price: priceNum, image: item.img, brand: item.brand, qty: 1 });
    }
    localStorage.setItem('fashionCartItems', JSON.stringify(cart));
    
    // Log Activity
    const activities = JSON.parse(localStorage.getItem('fashionActivity')) || [];
    activities.unshift({
        msg: `You added <strong>${item.product}</strong> to your cart from wishlist.`,
        icon: 'fa-cart-arrow-down',
        iconClass: 'teal',
        timestamp: new Date().toISOString(),
        unread: true
    });
    if (activities.length > 50) activities.pop();
    localStorage.setItem('fashionActivity', JSON.stringify(activities));
    
    NOTIFICATIONS = [...JSON.parse(localStorage.getItem('fashionActivity') || '[]'), ...NOTIFICATIONS.filter(n => !n.timestamp)];
    initNotifications();
    initCartOverview(); // Refresh the active cart view

    showToast(`"${item.product}" added to cart!`);
    
    // Optional: Remove from wishlist after adding to cart
    // removeWishlistItem(index);
};

function updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
        badge.textContent = WISHLIST.length;
        badge.style.display = WISHLIST.length > 0 ? 'inline-flex' : 'none';
    }
    const wishStat = document.getElementById('wishlistStat');
    if (wishStat) wishStat.textContent = WISHLIST.length;
}

// ---- NOTIFICATIONS ----
function timeAgo(dateString) {
    if (!dateString) return '';
    if (!dateString.includes('T')) return dateString; // Already formatted (mock data)
    
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function initNotifications() {
    const list = document.getElementById('notifFullList');
    const dropdownList = document.querySelector('#notifDropdown .notif-list');

    const html = NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon ${n.iconClass}"><i class="fa-solid ${n.icon}"></i></div>
            <div style="flex:1;">
                <p>${n.msg}</p>
                <span>${timeAgo(n.timestamp || n.time)}</span>
            </div>
            ${n.unread ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:6px;"></span>` : ''}
        </div>
    `).join('');

    if (list) list.innerHTML = html;
    
    // Update the dropdown list too
    if (dropdownList) {
        dropdownList.innerHTML = NOTIFICATIONS.slice(0, 4).map(n => `
            <div class="notif-item ${n.unread ? 'unread' : ''}">
                <div class="notif-icon ${n.iconClass}"><i class="fa-solid ${n.icon}"></i></div>
                <div>
                    <p>${n.msg}</p>
                    <span>${timeAgo(n.timestamp || n.time)}</span>
                </div>
            </div>
        `).join('');
    }

    // Update badge
    const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;
    const badge = document.getElementById('notifBadge');
    const topbarNotifBadge = document.getElementById('topbarNotifBadge');
    const pulseBadges = document.querySelectorAll('.icon-badge.pulse');
    
    if (unreadCount === 0) {
        if (badge) badge.style.display = 'none';
        if (topbarNotifBadge) topbarNotifBadge.style.display = 'none';
        pulseBadges.forEach(b => b.style.display = 'none');
    } else {
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.textContent = unreadCount;
        }
        if (topbarNotifBadge) {
            topbarNotifBadge.style.display = 'inline-flex';
            topbarNotifBadge.textContent = unreadCount;
        }
        pulseBadges.forEach(b => {
            b.style.display = 'inline-flex';
            b.textContent = unreadCount;
        });
    }
}

// ---- PROFILE ----
function initProfile() {
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', e => {
        e.preventDefault();
        userData.firstName = document.getElementById('editFirstName').value.trim() || userData.firstName;
        userData.lastName = document.getElementById('editLastName').value.trim() || userData.lastName;
        userData.email = document.getElementById('editEmail').value.trim() || userData.email;
        userData.phone = document.getElementById('editPhone').value.trim() || userData.phone;

        // Update display
        initUserDisplay();
        showToast('Profile updated successfully!');
    });

    // Password toggles
    document.querySelectorAll('.toggle-eye').forEach(eye => {
        eye.addEventListener('click', () => {
            const targetId = eye.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                eye.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                eye.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Avatar change
    document.getElementById('avatarChangeBtn').addEventListener('click', () => {
        showToast('Avatar upload coming soon!');
    });
}

// ---- SETTINGS ----
function initSettings() {
    // Toggle switches
    document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', () => {
            const label = toggle.closest('.settings-row').querySelector('h6').textContent;
            const state = toggle.checked ? 'enabled' : 'disabled';
            showToast(`"${label}" ${state}.`);
        });
    });

    // Delete account
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.add('open');
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('open');
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        localStorage.removeItem('keyDetails');
        showToast('Account deleted. Redirecting...');
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    });
}

// ---- MODALS ----
function initModals() {
    // Order modal close
    document.getElementById('closeOrderModal').addEventListener('click', () => {
        document.getElementById('orderModal').classList.remove('open');
    });

    // Address modal
    document.getElementById('addAddressBtn').addEventListener('click', () => {
        document.getElementById('addressModal').classList.add('open');
    });

    document.getElementById('closeAddressModal').addEventListener('click', () => {
        document.getElementById('addressModal').classList.remove('open');
    });

    document.getElementById('addressForm').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('addressModal').classList.remove('open');
        showToast('Address saved successfully!');
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });

    // Address card actions
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => showToast('Edit address coming soon!'));
    });

    document.querySelectorAll('.address-card .btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this address?')) showToast('Address deleted!');
        });
    });

    document.querySelectorAll('.address-card .btn-default').forEach(btn => {
        btn.addEventListener('click', () => showToast('Default address updated!'));
    });

    // Payment add
    document.getElementById('addPaymentBtn').addEventListener('click', () => {
        showToast('Payment method setup coming soon!');
    });

    // Payment actions
    document.querySelectorAll('.payment-card .btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Remove this card?')) showToast('Card removed!');
        });
    });

    document.querySelectorAll('.payment-card .btn-default').forEach(btn => {
        btn.addEventListener('click', () => showToast('Default card updated!'));
    });

    // Delete modal close on overlay
    document.getElementById('deleteModal').addEventListener('click', e => {
        if (e.target === document.getElementById('deleteModal')) {
            document.getElementById('deleteModal').classList.remove('open');
        }
    });

    // Promo code copy
    const promoCode = document.querySelector('.promo-code');
    if (promoCode) {
        promoCode.addEventListener('click', () => {
            navigator.clipboard.writeText('MEMBER20').catch(() => {});
            showToast('Promo code "MEMBER20" copied!');
        });
    }
}

// ---- GLOBAL SEARCH ----
function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const q = e.target.value.trim();
            if (q) {
                showToast(`Searching for "${q}"...`);
                searchInput.value = '';
            }
        }
    });
}

// ---- TOAST ----
window.showToast = function(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
};

// ---- STATS ANIMATION (count-up) ----
function animateCountUp() {
    const counters = document.querySelectorAll('.stat-info h3');
    counters.forEach(counter => {
        const target = parseFloat(counter.textContent.replace(/[$,]/g, ''));
        if (isNaN(target)) return;
        const prefix = counter.textContent.includes('$') ? '$' : '';
        const duration = 1200;
        const stepTime = 20;
        const steps = duration / stepTime;
        let current = 0;
        const inc = target / steps;

        const timer = setInterval(() => {
            current += inc;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toLocaleString('en-US', { maximumFractionDigits: 0 }));
        }, stepTime);
    });
}

// Run count-up on page load
setTimeout(animateCountUp, 200);

// ---- KEYBOARD SHORTCUT: Escape closes modals ----
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        document.getElementById('notifDropdown').classList.remove('open');
    }
});
