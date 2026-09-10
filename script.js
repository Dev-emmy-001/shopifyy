/* ==========================================================
   script.js — Fashion E-Commerce Shared Scripts
   Handles: mobile navbar, password toggle, login logic,
            scroll reveal, sticky header, back-to-top
   ========================================================== */

// ── CURRENCY SYSTEM ───────────────────────────────────────
window.getCurrency = function() {
    return localStorage.getItem('fashionCurrency') || 'NGN';
};
window.setCurrency = function(curr) {
    localStorage.setItem('fashionCurrency', curr);
    location.reload();
};
window.formatCurrency = function(amountInNGN) {
    const curr = window.getCurrency();
    if (curr === 'USD') {
        const usd = amountInNGN / 1000;
        return '$' + usd.toFixed(2);
    }
    return '₦' + amountInNGN.toLocaleString();
};
window.formatOrderAmount = function(amountStr) {
    if (!amountStr) return window.formatCurrency(0);
    if (typeof amountStr === 'number') return window.formatCurrency(amountStr);
    
    let raw = amountStr.toString().replace(/[^0-9.]/g, '');
    let val = parseFloat(raw);
    if (isNaN(val)) val = 0;
    
    if (amountStr.toString().includes('$')) {
        val = val * 1000;
    }
    return window.formatCurrency(val);
};

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    if (navbar && !document.getElementById('currency-switcher-li')) {
        const li = document.createElement('li');
        li.id = 'currency-switcher-li';
        li.innerHTML = `
            <select id="currency-switcher" style="padding: 5px; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid #088178; outline: none; background: #fff; color: #1a1a1a;">
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
            </select>
        `;
        const lgBag = document.getElementById('lg-bag');
        if (lgBag) {
            navbar.insertBefore(li, lgBag);
        } else {
            navbar.appendChild(li);
        }
        
        const select = document.getElementById('currency-switcher');
        select.value = window.getCurrency();
        select.addEventListener('change', (e) => {
            window.setCurrency(e.target.value);
        });
    }
    
    const staticPrices = document.querySelectorAll('.des h4, #prodetails h2');
    const curr = window.getCurrency();
    if (curr === 'USD') {
        staticPrices.forEach(el => {
            if (el.textContent.includes('₦')) {
                let raw = el.textContent.replace(/[^0-9.]/g, '');
                let val = parseFloat(raw);
                if (!isNaN(val)) {
                    el.textContent = '$' + (val / 1000).toFixed(2);
                }
            }
        });
    }
});

// ── Mobile Navbar Toggle ──────────────────────────────────
const bar   = document.getElementById('bar');
const close = document.getElementById('close');
const nav   = document.getElementById('navbar');
const mobileBag = document.querySelector('#mobile .cart-icon-wrapper');

function toggleMobileBag(hide) {
    if (mobileBag) {
        mobileBag.style.display = hide ? 'none' : 'flex';
    }
}

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
        document.body.style.overflow = 'hidden';
        toggleMobileBag(true);
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
        document.body.style.overflow = '';
        toggleMobileBag(false);
    });
}

// Close navbar when clicking outside of it or on a navigation link
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('active')) {
        if (!nav.contains(e.target) && e.target !== bar) {
            nav.classList.remove('active');
            document.body.style.overflow = '';
            toggleMobileBag(false);
        }
    }
});

if (nav) {
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.currentTarget.getAttribute('href') !== '#' && !e.currentTarget.closest('#close')) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
                toggleMobileBag(false);
            }
        });
    });
}

// ── Scroll Reveal (Intersection Observer) ────────────────
document.addEventListener('DOMContentLoaded', () => {

    const scrollEls = document.querySelectorAll('.scroll-reveal');
    if (scrollEls.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        scrollEls.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        scrollEls.forEach(el => el.classList.add('visible'));
    }

    // ── Hero "Shop Now" button ────────────────────────────
    const heroBtn = document.getElementById('hero-shop-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            window.location.href = 'shop.html';
        });
    }

    // ── Logged-In User State in Navbar ───────────────────
    updateNavbarUserState();

});

// ── Navbar Auth State ─────────────────────────────────────
function updateNavbarUserState() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const getStartedBtn = document.querySelector('#navbar > a[href="Signup.html"]');

    if (loggedInUser && getStartedBtn) {
        const initials = ((loggedInUser.f_name || 'U')[0] + (loggedInUser.l_name || '')[0]).toUpperCase();
        const firstName = loggedInUser.f_name || 'User';

        // Replace the "Let's Get Started" button with user avatar
        getStartedBtn.innerHTML = `
            <span class="nav-user-pill" title="My Dashboard" onclick="window.location.href='dashboard.html'" style="
                display:inline-flex;align-items:center;gap:8px;cursor:pointer;
                background:linear-gradient(135deg,#088178,#04b49c);
                color:#fff;padding:7px 14px 7px 8px;border-radius:50px;
                font-size:13px;font-weight:600;border:none;
                box-shadow:0 2px 10px rgba(8,129,120,0.3);transition:all .2s ease;">
                <span style="background:rgba(255,255,255,0.25);width:26px;height:26px;
                             border-radius:50%;display:inline-flex;align-items:center;
                             justify-content:center;font-size:11px;font-weight:700;">${initials}</span>
                Hi, ${firstName}
            </span>`;
    }
}

// ── Password Toggle (Login page) ─────────────────────────
const eyeIcon      = document.querySelector('.password-field i');
const passwordInput = document.querySelector('.password-field input');

if (eyeIcon && passwordInput) {
    eyeIcon.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}

// ── LOGIN — localStorage Auth ─────────────────────────────
const savedUsers = JSON.parse(localStorage.getItem('keyDetails')) || [];
const userLogin  = document.getElementById('loginAccount');

if (userLogin) {
    userLogin.addEventListener('click', () => {
        const userEmail    = document.getElementById('email').value.trim();
        const userPassword = document.getElementById('password').value.trim();
        const rememberMe   = document.querySelector('#loginAccount ~ * input[type="checkbox"], .options input[type="checkbox"]');
        const emailRegex   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!userEmail && !userPassword) {
            Toastify({
                text: 'Please fill in all fields.',
                className: 'info',
                duration: 4000,
                style: { background: 'linear-gradient(to right, #1a1a1a, #c0392b)', maxWidth: '100%' }
            }).showToast();
            return;
        }

        if (!userEmail) {
            Toastify({
                text: 'Please enter your email.',
                className: 'info',
                duration: 4000,
                style: { background: 'linear-gradient(to right, #1a1a1a, #c0392b)', maxWidth: '100%' }
            }).showToast();
            return;
        }

        if (!emailRegex.test(userEmail)) {
            Toastify({
                text: 'Please enter a valid email address.',
                className: 'info',
                duration: 4000,
                style: { background: 'linear-gradient(to right, #1a1a1a, #c0392b)', maxWidth: '100%' }
            }).showToast();
            return;
        }

        if (!userPassword) {
            Toastify({
                text: 'Please enter your password.',
                className: 'info',
                duration: 4000,
                style: { background: 'linear-gradient(to right, #1a1a1a, #c0392b)', maxWidth: '100%' }
            }).showToast();
            return;
        }

        const found = savedUsers.find(u => u.email === userEmail && u.password === userPassword);

        if (found) {
            // Save logged-in session
            localStorage.setItem('loggedInUser', JSON.stringify(found));

            // Handle "Remember Me"
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberedEmail', userEmail);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            userLogin.innerHTML = `
                <span style="display:flex;align-items:center;justify-content:center;gap:8px;">
                    <span style="width:16px;height:16px;border:3px solid rgba(255,255,255,0.3);
                                 border-top-color:#fff;border-radius:50%;
                                 animation:loginSpin 0.7s linear infinite;display:inline-block;"></span>
                    Logging in...
                </span>`;
            userLogin.disabled = true;

            Toastify({
                text: `✓ Welcome back, ${found.f_name}! Redirecting...`,
                className: 'info',
                duration: 3000,
                style: { background: 'linear-gradient(to right, #088178, #04b49c)', maxWidth: '100%' }
            }).showToast();

            setTimeout(() => { window.location.href = 'dashboard.html'; }, 2500);
        } else {
            Toastify({
                text: 'Invalid email or password. Please try again.',
                className: 'info',
                duration: 4000,
                style: { background: 'linear-gradient(to right, #1a1a1a, #c0392b)', maxWidth: '100%' }
            }).showToast();

            // Shake the button
            userLogin.style.animation = 'none';
            void userLogin.offsetWidth;
            userLogin.style.animation = 'inputShake 0.4s ease';
        }
    });

    // Pre-fill email if "Remember Me" was previously checked
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = remembered;
    }
}

// Inject spinner keyframe
const loginStyle = document.createElement('style');
loginStyle.textContent = '@keyframes loginSpin { to { transform: rotate(360deg); } }';
document.head.appendChild(loginStyle);

// ── DYNAMIC SINGLE PRODUCT LOGIC ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the single product page
    const prodetails = document.getElementById('prodetails');
    if (!prodetails) return;

    // Get the product ID from the URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId && typeof getProductById === 'function') {
        const product = getProductById(productId);
        if (product) {
            // Populate the data
            document.getElementById('MainImg').src = product.images[0];
            document.getElementById('prod-brand').innerText = `Home / ${product.brand}`;
            document.getElementById('prod-name').innerText = product.name;
            document.getElementById('prod-price').innerText = window.formatCurrency(product.price);
            document.getElementById('prod-desc').innerText = product.description;

            // Populate the small images
            const smallImgGroup = document.getElementById('small-img-group');
            if (smallImgGroup) {
                smallImgGroup.innerHTML = product.images.map((img, index) => `
                    <div class="small-img-col">
                        <img src="${img}" width="100%" class="small-img ${index === 0 ? 'small-img--active' : ''}" alt="Product view ${index + 1}">
                    </div>
                `).join('');
            }

            // Image switcher logic
            const mainImg = document.getElementById('MainImg');
            const smallImgs = document.querySelectorAll('.small-img');

            smallImgs.forEach((img) => {
                img.addEventListener('click', () => {
                    mainImg.src = img.src;
                    smallImgs.forEach(i => i.classList.remove('small-img--active'));
                    img.classList.add('small-img--active');
                });
            });
        } else {
            // Product not found — show graceful error
            prodetails.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:48px;color:#f4a261;margin-bottom:16px;"></i>
                    <h2>Product Not Found</h2>
                    <p style="color:#888;margin:12px 0 24px;">The product you're looking for doesn't exist or has been removed.</p>
                    <a href="shop.html" style="background:#088178;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Back to Shop</a>
                </div>`;
        }
    } else {
        // Image switcher logic fallback (if no dynamic product)
        const mainImg = document.getElementById('MainImg');
        const smallImgs = document.querySelectorAll('.small-img');
        if (mainImg && smallImgs.length) {
            smallImgs.forEach((img) => {
                img.addEventListener('click', () => {
                    mainImg.src = img.src;
                    smallImgs.forEach(i => i.classList.remove('small-img--active'));
                    img.classList.add('small-img--active');
                });
            });
        }
    }

    // Image Zoom functionality
    const zoomContainer = document.getElementById('img-zoom-container');
    const mainImgNode = document.getElementById('MainImg');

    if (zoomContainer && mainImgNode) {
        zoomContainer.addEventListener('mousemove', (e) => {
            const rect = zoomContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = Math.round(100 / (rect.width / x));
            const yPercent = Math.round(100 / (rect.height / y));

            mainImgNode.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        });

        zoomContainer.addEventListener('mouseleave', () => {
            mainImgNode.style.transformOrigin = 'center center';
        });
    }
});

// ── CUSTOMER SUPPORT LIVE CHAT WIDGET ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Only inject if not in admin panel
    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('dashboard.html')) return;

    // Inject chat styles
    const chatStyle = document.createElement('style');
    chatStyle.textContent = `
        #chat-widget-container {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 9999;
            font-family: 'Spartan', sans-serif;
        }
        #chat-trigger {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #088178;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(8, 129, 120, 0.4);
            transition: all 0.3s ease;
        }
        #chat-trigger:hover {
            transform: scale(1.1);
            background: #066b62;
        }
        #chat-trigger .badge {
            position: absolute;
            top: 0;
            right: 0;
            background: #ef3651;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
        }
        #chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            transform-origin: bottom right;
            animation: chatPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes chatPop {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        #chat-header {
            background: #088178;
            color: #fff;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        #chat-header .agent-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        #chat-header img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
        }
        #chat-header h4 {
            margin: 0;
            font-size: 15px;
            color: #fff;
        }
        #chat-header span {
            font-size: 11px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .status-dot {
            width: 6px;
            height: 6px;
            background: #4cd137;
            border-radius: 50%;
            display: inline-block;
        }
        #chat-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        #chat-close:hover { opacity: 1; }
        #chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f9f9fc;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .chat-bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 13.5px;
            line-height: 1.4;
            position: relative;
        }
        .chat-bot {
            background: #fff;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .chat-user {
            background: #088178;
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            box-shadow: 0 2px 10px rgba(8, 129, 120, 0.2);
        }
        .chat-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 5px;
        }
        .chat-option-btn {
            background: #e0f2f1;
            border: 1px solid #b2dfdb;
            color: #00796b;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12.5px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
            font-weight: 500;
        }
        .chat-option-btn:hover {
            background: #b2dfdb;
        }
        #chat-footer {
            padding: 14px;
            background: #fff;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        #chat-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 10px 15px;
            font-size: 13.5px;
            outline: none;
            font-family: inherit;
        }
        #chat-input:focus {
            border-color: #088178;
        }
        #chat-send {
            background: #088178;
            color: #fff;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: background 0.2s;
        }
        #chat-send:hover {
            background: #066b62;
        }
        .typing-indicator {
            display: none;
            align-items: center;
            gap: 4px;
            padding: 12px 16px;
            background: #fff;
            border-radius: 14px;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            width: max-content;
        }
        .typing-dot {
            width: 6px;
            height: 6px;
            background: #088178;
            border-radius: 50%;
            animation: typeBounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typeBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        @media (max-width: 480px) {
            #chat-window {
                width: calc(100vw - 24px);
                max-width: 360px;
                height: 70vh;
                max-height: 480px;
                right: 0;
                bottom: 70px;
            }
        }
    `;
    document.head.appendChild(chatStyle);

    // Inject chat HTML
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-widget-container';
    chatContainer.innerHTML = `
        <div id="chat-window">
            <div id="chat-header">
                <div class="agent-info">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Support Agent">
                    <div>
                        <h4>Sarah</h4>
                        <span><i class="status-dot"></i> Online</span>
                    </div>
                </div>
                <button id="chat-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="chat-body">
                <div class="chat-bubble chat-bot">
                    Hi there! 👋 Welcome to DAMMYGOLD STORE.<br><br>How can I help you today?
                </div>
                <div class="chat-options" id="initial-options">
                    <button class="chat-option-btn" data-reply="Where is my order?">Track my order</button>
                    <button class="chat-option-btn" data-reply="How much is delivery?">Delivery costs</button>
                    <button class="chat-option-btn" data-reply="I have a payment issue.">Payment support</button>
                </div>
                <div class="typing-indicator" id="chat-typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
            <div id="chat-footer">
                <input type="text" id="chat-input" placeholder="Type your message...">
                <button id="chat-send"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        <div id="chat-trigger">
            <i class="fa-solid fa-comment-dots"></i>
            <div class="badge" id="chat-badge">1</div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Logic
    const trigger = document.getElementById('chat-trigger');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close');
    const chatBody = document.getElementById('chat-body');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const typingIndicator = document.getElementById('chat-typing');
    const badge = document.getElementById('chat-badge');
    const initialOptions = document.getElementById('initial-options');
    let isOpen = false;

    trigger.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) {
            badge.style.display = 'none';
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        chatWindow.style.display = 'none';
    });

    const responses = {
        "Where is my order?": "You can track your order in the Dashboard area. Simply click on the 'View' button next to your recent order to see its live status.",
        "How much is delivery?": "We offer FREE delivery nationwide! Enjoy shopping without worrying about shipping fees.",
        "I have a payment issue.": "I'm sorry to hear that. You can choose Bank Transfer, USSD, or Paystack at checkout. Which method were you trying to use?"
    };

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-bubble chat-${sender}`;
        div.innerHTML = text;
        chatBody.insertBefore(div, typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function simulateBotReply(userText) {
        typingIndicator.style.display = 'flex';
        chatBody.scrollTop = chatBody.scrollHeight;
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            const defaultReply = "I understand. Our human support agents will be online shortly to assist you further.";
            const botReply = responses[userText] || defaultReply;
            addMessage(botReply, 'bot');
        }, 1500);
    }

    function handleSend(text) {
        if (!text.trim()) return;
        if (initialOptions) initialOptions.style.display = 'none';
        
        addMessage(text, 'user');
        input.value = '';
        simulateBotReply(text);
    }

    sendBtn.addEventListener('click', () => handleSend(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend(input.value);
    });

    document.querySelectorAll('.chat-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleSend(btn.getAttribute('data-reply'));
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const reviewBtn = document.getElementById('write-review-btn');
    if (!reviewBtn) return;

    // Inject Modal HTML
    const modalHTML = `
    <div id="review-modal" class="custom-modal" style="display: none;">
        <div class="custom-modal-content">
            <span class="custom-modal-close" id="close-review-modal">&times;</span>
            <h2>Write a Review</h2>
            <form id="review-form">
                <div class="input-group">
                    <label for="review-name">Name</label>
                    <input type="text" id="review-name" required placeholder="John Doe">
                </div>
                <div class="input-group">
                    <label>Rating</label>
                    <div class="star-rating" id="review-rating">
                        <i class="fa-solid fa-star" data-rating="1"></i>
                        <i class="fa-solid fa-star" data-rating="2"></i>
                        <i class="fa-solid fa-star" data-rating="3"></i>
                        <i class="fa-solid fa-star" data-rating="4"></i>
                        <i class="fa-solid fa-star" data-rating="5"></i>
                    </div>
                </div>
                <div class="input-group">
                    <label for="review-text">Review</label>
                    <textarea id="review-text" rows="4" required placeholder="What did you think about this product?"></textarea>
                </div>
                <button type="submit" class="normal">Submit Review</button>
            </form>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-review-modal');
    const form = document.getElementById('review-form');
    const stars = document.querySelectorAll('#review-rating .fa-star');
    let currentRating = 5;

    // Open Modal
    reviewBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        // Pulse animation
        modal.querySelector('.custom-modal-content').style.animation = 'successPop 0.3s ease forwards';
    });

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Star Rating Interactivity
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            currentRating = parseInt(e.target.getAttribute('data-rating'));
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= currentRating) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        });
    });

    // Handle Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('review-name').value;
        const text = document.getElementById('review-text').value;

        // Generate stars HTML
        let starsHTML = '';
        for(let i=1; i<=5; i++) {
            if (i <= currentRating) starsHTML += '<i class="fa-solid fa-star"></i>';
            else starsHTML += '<i class="fa-regular fa-star"></i>';
        }

        // Create new review element
        const newReview = document.createElement('div');
        newReview.className = 'review-box';
        newReview.innerHTML = `
            <div class="review-head">
                <strong>${name}</strong>
                <div class="star">${starsHTML}</div>
            </div>
            <p>"${text}"</p>
            <small>Just now</small>
        `;

        // Add to DOM (fade in)
        newReview.style.opacity = '0';
        newReview.style.transform = 'translateY(20px)';
        newReview.style.transition = 'all 0.4s ease';
        
        const container = document.querySelector('.reviews-container');
        if (container) {
            container.insertBefore(newReview, container.firstChild);
        }

        // Trigger animation
        setTimeout(() => {
            newReview.style.opacity = '1';
            newReview.style.transform = 'translateY(0)';
        }, 10);

        // Notify user
        if (typeof showCartToast === 'function') {
            showCartToast('Review submitted successfully!');
        }

        modal.style.display = 'none';
        form.reset();
        currentRating = 5;
        stars.forEach(s => { s.classList.remove('fa-regular'); s.classList.add('fa-solid'); });
    });
});


// ─── NEW FEATURES LOGIC (Dark Mode, Quick View) ───────────
document.addEventListener('DOMContentLoaded', () => {

    // 1. Dark Mode Toggle
    const navbar = document.getElementById('navbar');
    if (navbar && !document.getElementById('dark-mode-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dark-mode-toggle';
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.innerHTML = '<i class="fa-regular fa-moon"></i>';
        
        // Append before cart bag
        const lgBag = document.getElementById('lg-bag');
        if (lgBag) {
            navbar.insertBefore(toggleBtn, lgBag);
        } else {
            navbar.appendChild(toggleBtn);
        }

        // Check local storage for dark mode preference
        const isDarkMode = localStorage.getItem('fashionDarkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const darkActive = document.body.classList.contains('dark-mode');
            localStorage.setItem('fashionDarkMode', darkActive);
            
            if (darkActive) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                // Add tiny pulse animation
                toggleBtn.style.animation = 'successPop 0.3s ease';
            } else {
                toggleBtn.innerHTML = '<i class="fa-regular fa-moon"></i>';
                toggleBtn.style.animation = 'successPop 0.3s ease';
            }
            setTimeout(() => toggleBtn.style.animation = '', 300);
        });
    }

    // 2. Quick View Modal
    const quickViewModalHTML = `
    <div id="quick-view-modal" class="custom-modal quick-view-modal" style="display: none;">
        <div class="custom-modal-content">
            <span class="custom-modal-close" id="close-qv-modal">&times;</span>
            <div class="qv-image">
                <img id="qv-img" src="" alt="">
            </div>
            <div class="qv-details">
                <span id="qv-brand" style="color: #606063; font-size: 13px;">Brand</span>
                <h3 id="qv-title">Product Name</h3>
                <h4 id="qv-price">Price</h4>
                <p>Enjoy premium quality with our exclusive collection. Made with fine materials for ultimate comfort and durability.</p>
                <select id="qv-size">
                    <option value="Select Size">Select Size</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="Small">Small</option>
                    <option value="Large">Large</option>
                </select>
                <div class="qv-actions">
                    <input type="number" id="qv-qty" value="1" min="1">
                    <button class="normal" id="qv-add-btn">Add To Cart</button>
                </div>
            </div>
        </div>
    </div>
    `;
    if (!document.getElementById('quick-view-modal')) {
        document.body.insertAdjacentHTML('beforeend', quickViewModalHTML);
    }

    const qvModal = document.getElementById('quick-view-modal');
    const qvClose = document.getElementById('close-qv-modal');
    
    if (qvClose) {
        qvClose.addEventListener('click', () => qvModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === qvModal) qvModal.style.display = 'none';
        });
    }

    // Attach Quick View to Eye Icons
    document.querySelectorAll('.pro-overlay-btn .fa-eye').forEach(icon => {
        const btn = icon.closest('a');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const card = btn.closest('.pro');
                if (!card) return;

                const name = card.querySelector('h5')?.textContent || 'Product';
                const priceText = card.querySelector('.des h4')?.textContent || '0';
                const image = card.querySelector('img')?.src || '';
                const brand = card.querySelector('.des span')?.textContent || '';

                document.getElementById('qv-title').textContent = name;
                document.getElementById('qv-price').textContent = priceText;
                document.getElementById('qv-img').src = image;
                document.getElementById('qv-brand').textContent = brand;

                // Reset inputs
                document.getElementById('qv-size').value = 'Select Size';
                document.getElementById('qv-qty').value = '1';

                qvModal.style.display = 'flex';
                qvModal.querySelector('.custom-modal-content').style.animation = 'successPop 0.3s ease forwards';
                
                // Add to cart from quick view
                const addBtn = document.getElementById('qv-add-btn');
                // Remove old event listeners to prevent duplicate triggers
                const newAddBtn = addBtn.cloneNode(true);
                addBtn.parentNode.replaceChild(newAddBtn, addBtn);
                
                newAddBtn.addEventListener('click', () => {
                    const size = document.getElementById('qv-size').value;
                    const qty = parseInt(document.getElementById('qv-qty').value) || 1;

                    if (size === 'Select Size') {
                        if (typeof showCartToast === 'function') showCartToast('Please select a size first.', 'error');
                        else alert('Please select a size first.');
                        return;
                    }

                    // Compute numeric price for the cart
                    let priceVal = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    if (priceText.includes('$')) priceVal *= 1000;
                    if (isNaN(priceVal)) priceVal = 0;

                    const id = `${name}-${size}`.replace(/\s+/g, '-');
                    
                    // Manually add to cart to handle sizes cleanly
                    const cart = JSON.parse(localStorage.getItem(typeof getCartKey === 'function' ? getCartKey() : 'fashionCartItems')) || [];
                    const existing = cart.find(item => item.id === id);

                    if (existing) {
                        existing.qty += qty;
                    } else {
                        cart.push({ id, name, price: priceVal, image, brand, qty });
                    }
                    localStorage.setItem(typeof getCartKey === 'function' ? getCartKey() : 'fashionCartItems', JSON.stringify(cart));
                    
                    if (typeof updateCartBadge === 'function') updateCartBadge();
                    if (typeof showCartToast === 'function') showCartToast(`"${name}" (${size}) added to cart!`);
                    else alert(`"${name}" added to cart!`);

                    qvModal.style.display = 'none';
                });
            });
        }
    });

});


// ==========================================================
// PHASE 3 FEATURES: Flash Sale Banner, Live Search, Recently Viewed
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. FLASH SALE COUNTDOWN BANNER ───────────────────────
    function initFlashBanner() {
        if (document.getElementById('flash-banner')) return; // Already injected

        // Only show on pages with a main header (not on Login/Signup pages)
        if (!document.getElementById('header')) return;

        // Check if user already dismissed it this session
        if (sessionStorage.getItem('flashBannerDismissed') === 'true') return;

        // Set sale end time (24 hours from now, persisted in session)
        let endTime = parseInt(sessionStorage.getItem('flashSaleEnd'));
        if (!endTime || endTime < Date.now()) {
            endTime = Date.now() + 24 * 60 * 60 * 1000;
            sessionStorage.setItem('flashSaleEnd', endTime);
        }

        // Auto-hide after 5 minutes (300,000ms) if not dismissed
        const AUTO_HIDE_MS = 5 * 60 * 1000;

        const banner = document.createElement('div');
        banner.id = 'flash-banner';
        banner.innerHTML = `
            <span>🔥 FLASH SALE — Up to 70% OFF! Use code <strong>DAMMYGOLD20</strong> at checkout</span>
            <a href="shop.html">Shop Now →</a>
            <div class="flash-countdown">
                <div class="flash-time-box" id="fc-h">00</div>
                <span class="flash-sep">:</span>
                <div class="flash-time-box" id="fc-m">00</div>
                <span class="flash-sep">:</span>
                <div class="flash-time-box" id="fc-s">00</div>
            </div>
            <button class="close-banner" id="close-flash-banner" title="Dismiss">&times;</button>
        `;
        document.body.insertBefore(banner, document.body.firstChild);

        let autoHideTimer;

        function dismissBanner() {
            clearTimeout(autoHideTimer);
            sessionStorage.setItem('flashBannerDismissed', 'true');
            banner.style.maxHeight = banner.offsetHeight + 'px';
            banner.style.overflow = 'hidden';
            banner.style.transition = 'max-height 0.5s ease, padding 0.5s ease, opacity 0.5s ease';
            requestAnimationFrame(() => {
                banner.style.maxHeight = '0';
                banner.style.padding = '0';
                banner.style.opacity = '0';
            });
            setTimeout(() => banner.remove(), 520);
        }

        document.getElementById('close-flash-banner').addEventListener('click', dismissBanner);

        // Auto-hide after 5 minutes
        autoHideTimer = setTimeout(dismissBanner, AUTO_HIDE_MS);

        function pad(n) { return String(n).padStart(2, '0'); }

        function updateCountdown() {
            const diff = endTime - Date.now();
            if (diff <= 0) { banner.remove(); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const fh = document.getElementById('fc-h');
            const fm = document.getElementById('fc-m');
            const fs = document.getElementById('fc-s');
            if (fh) fh.textContent = pad(h);
            if (fm) fm.textContent = pad(m);
            if (fs) fs.textContent = pad(s);
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    initFlashBanner();


    // ── 2. LIVE SEARCH OVERLAY ────────────────────────────────
    function initLiveSearch() {
        if (!document.getElementById('header')) return; // Guard for login/signup pages
        if (document.getElementById('search-overlay')) return;

        // Inject search trigger button into navbar
        const navbar = document.getElementById('navbar');
        if (navbar && !document.getElementById('search-trigger')) {
            const searchBtn = document.createElement('button');
            searchBtn.id = 'search-trigger';
            searchBtn.setAttribute('aria-label', 'Open search');
            searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
            const lgBag = document.getElementById('lg-bag');
            if (lgBag) navbar.insertBefore(searchBtn, lgBag);
            else navbar.appendChild(searchBtn);
        }

        // Inject search overlay HTML
        const overlayHTML = `
        <div id="search-overlay">
            <div class="search-overlay-inner">
                <div class="search-bar-wrap">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="search-input" placeholder="Search for products (e.g. T-Shirts, Adidas)..." autocomplete="off">
                    <button class="close-search" id="close-search-overlay" title="Close">&times;</button>
                </div>
                <div class="search-results-panel" id="search-results-panel" style="display:none;"></div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);

        const overlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');
        const resultsPanel = document.getElementById('search-results-panel');
        const trigger = document.getElementById('search-trigger');
        const closeBtn = document.getElementById('close-search-overlay');

        function openSearch() {
            overlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        }
        function closeSearch() {
            overlay.classList.remove('active');
            searchInput.value = '';
            resultsPanel.style.display = 'none';
        }

        if (trigger) trigger.addEventListener('click', openSearch);
        if (closeBtn) closeBtn.addEventListener('click', closeSearch);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

        // Live search logic using the products database
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = searchInput.value.trim().toLowerCase();
                if (query.length < 2) {
                    resultsPanel.style.display = 'none';
                    return;
                }

                if (typeof products === 'undefined') {
                    resultsPanel.innerHTML = '<div class="search-no-result">Search is not available on this page.</div>';
                    resultsPanel.style.display = 'block';
                    return;
                }

                const matches = Object.values(products).filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.brand.toLowerCase().includes(query)
                );

                if (matches.length === 0) {
                    resultsPanel.innerHTML = `<div class="search-no-result">No results for "<strong>${query}</strong>". Try a different term.</div>`;
                } else {
                    resultsPanel.innerHTML = matches.slice(0, 8).map(p => `
                        <a href="sproduct.html?id=${p.id}" class="search-result-item" onclick="document.getElementById('search-overlay').classList.remove('active')">
                            <img src="${p.images[0]}" alt="${p.name}">
                            <div class="sr-info">
                                <h4>${p.name}</h4>
                                <span>${window.formatCurrency ? window.formatCurrency(p.price) : '₦' + p.price.toLocaleString()}</span>
                            </div>
                        </a>
                    `).join('');
                }
                resultsPanel.style.display = 'block';
            }, 300);
        });
    }
    initLiveSearch();


    // ── 3. RECENTLY VIEWED PRODUCTS ───────────────────────────
    function initRecentlyViewed() {
        if (!document.getElementById('header')) return; // Guard for login/signup pages
        const RV_KEY = 'fashionRecentlyViewed';

        // Track the current product page view
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (productId && typeof products !== 'undefined' && products[productId]) {
            const product = products[productId];
            let viewed = JSON.parse(localStorage.getItem(RV_KEY)) || [];
            // Remove if already in list, then add to front
            viewed = viewed.filter(v => v.id !== productId);
            viewed.unshift({ id: productId, name: product.name, price: product.price, img: product.images[0] });
            if (viewed.length > 10) viewed.pop();
            localStorage.setItem(RV_KEY, JSON.stringify(viewed));
        }

        // Render the recently viewed section
        const viewed = JSON.parse(localStorage.getItem(RV_KEY)) || [];
        // Don't show on the page of the current product, and need at least 2
        const filteredViewed = viewed.filter(v => v.id !== productId);

        if (filteredViewed.length < 2) return;

        const section = document.createElement('section');
        section.id = 'recently-viewed';
        section.innerHTML = `
            <h2>Recently Viewed</h2>
            <p>Pick up where you left off</p>
            <div class="rv-carousel-wrap">
                <button class="rv-scroll-btn prev" id="rv-prev"><i class="fa-solid fa-chevron-left"></i></button>
                <div id="rv-carousel">
                    ${filteredViewed.map(item => `
                        <a href="sproduct.html?id=${item.id}" class="rv-card">
                            <img src="${item.img}" alt="${item.name}">
                            <div class="rv-card-info">
                                <h4>${item.name}</h4>
                                <span>${window.formatCurrency ? window.formatCurrency(item.price) : '₦' + item.price.toLocaleString()}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <button class="rv-scroll-btn next" id="rv-next"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        `;

        // Insert before the newsletter section or footer
        const newsletter = document.getElementById('newsletter');
        const footer = document.querySelector('footer');
        const insertBefore = newsletter || footer;
        if (insertBefore) {
            insertBefore.parentNode.insertBefore(section, insertBefore);
        }

        // Carousel scroll buttons
        const carousel = document.getElementById('rv-carousel');
        document.getElementById('rv-prev').addEventListener('click', () => {
            carousel.scrollBy({ left: -240, behavior: 'smooth' });
        });
        document.getElementById('rv-next').addEventListener('click', () => {
            carousel.scrollBy({ left: 240, behavior: 'smooth' });
        });
    }
    initRecentlyViewed();

});
