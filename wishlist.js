document.addEventListener('DOMContentLoaded', () => {
    const wishlistBody = document.getElementById('wishlist-body');
    const emptyMsg = document.getElementById('wishlist-empty');

    if (wishlistBody) {
        renderWishlistTable();
    }

    function renderWishlistTable() {
        const key = typeof getWishlistKey === 'function' ? getWishlistKey() : 'fashionWishlist';
        const wishlist = JSON.parse(localStorage.getItem(key)) || [];

        if (wishlist.length === 0) {
            wishlistBody.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        wishlistBody.innerHTML = wishlist.map((item, index) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            return `
            <tr class="cart-row" data-index="${index}">
                <td>
                    <button class="cart-remove-btn" onclick="removeFromWishlist(${index})" title="Remove item">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </td>
                <td><img src="${item.img}" alt="${item.product}" class="cart-img"></td>
                <td class="cart-product-name">
                    <span class="cart-brand">${item.brand || ''}</span>
                    ${item.product}
                </td>
                <td class="cart-price">${window.formatCurrency ? window.formatCurrency(price) : price}</td>
                <td>
                    <button class="normal" onclick="moveWishlistToCart(${index})">Move to Cart</button>
                </td>
            </tr>
        `}).join('');
    }

    window.removeFromWishlist = function(index) {
        const key = typeof getWishlistKey === 'function' ? getWishlistKey() : 'fashionWishlist';
        const wishlist = JSON.parse(localStorage.getItem(key)) || [];
        wishlist.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(wishlist));
        renderWishlistTable();
        if (typeof showCartToast === 'function') {
            showCartToast('Item removed from wishlist.', 'info');
        }
    };

    window.moveWishlistToCart = function(index) {
        const wKey = typeof getWishlistKey === 'function' ? getWishlistKey() : 'fashionWishlist';
        const wishlist = JSON.parse(localStorage.getItem(wKey)) || [];
        const item = wishlist[index];
        if (!item) return;

        const priceVal = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        
        if (typeof addToCart === 'function') {
            addToCart(item.id, item.product, priceVal, item.img, item.brand);
            removeFromWishlist(index);
        } else {
            // Fallback if cart.js is not loaded properly
            const cKey = typeof getCartKey === 'function' ? getCartKey() : 'fashionCartItems';
            const cart = JSON.parse(localStorage.getItem(cKey)) || [];
            const existing = cart.find(c => c.id === item.id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ id: item.id, name: item.product, price: priceVal, image: item.img, brand: item.brand, qty: 1 });
            }
            localStorage.setItem(cKey, JSON.stringify(cart));
            removeFromWishlist(index);
            if (typeof updateCartBadge === 'function') updateCartBadge();
            if (typeof showCartToast === 'function') showCartToast(`"${item.product}" moved to cart!`);
        }
    };
});
