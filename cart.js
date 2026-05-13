let currentUser = null;

function init() {
    currentUser = JSON.parse(localStorage.getItem('kisan_current_user'));
    renderCart();
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center mt-2">
                <p>Your cart is empty.</p>
                <a href="consumer-home.html" class="btn btn-primary mt-1">Go Shopping</a>
            </div>`;
        updateSummary(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="card mb-1" style="display: flex; gap: 15px; align-items: center;">
            <img src="${item.imageURL || 'https://via.placeholder.com/60'}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 0.9rem;">${item.cropName}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted);">₹${item.pricePerKg}/kg | ${item.farmerName}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="updateQty('${item.id}', -1)" style="border: 1px solid #ddd; padding: 2px 8px; border-radius: 4px;">-</button>
                <span style="font-size: 0.9rem; font-weight: 600;">${item.quantity}</span>
                <button onclick="updateQty('${item.id}', 1)" style="border: 1px solid #ddd; padding: 2px 8px; border-radius: 4px;">+</button>
            </div>
            <button onclick="removeItem('${item.id}')" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">🗑️</button>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
    updateSummary(subtotal);
}

window.updateQty = (id, delta) => {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeItem(id);
        else {
            saveCart(cart);
            renderCart();
        }
    }
};

window.removeItem = (id) => {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
};

function updateSummary(subtotal) {
    const platform = subtotal * 0.10;
    const delivery = subtotal > 0 ? 30 : 0;
    const total = subtotal + platform + delivery;

    document.getElementById('subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('platform').innerText = `₹${platform.toFixed(2)}`;
    document.getElementById('delivery').innerText = `₹${delivery.toFixed(2)}`;
    document.getElementById('total-amount').innerText = `₹${total.toFixed(2)}`;
}

// Handle Order Placement
const checkoutForm = document.getElementById('checkout-form');
checkoutForm.onsubmit = (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Your cart is empty", "error");
        return;
    }

    const btn = checkoutForm.querySelector('button');
    const formData = new FormData(checkoutForm);
    
    toggleLoading(btn, true);

    setTimeout(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
        const orders = JSON.parse(localStorage.getItem('kisan_orders')) || [];
        
        // Simple order creation (one order for all items)
        const orderId = 'ORD' + Date.now();
        const newOrder = {
            id: orderId,
            consumerId: currentUser ? currentUser.uid : 'guest',
            consumerName: currentUser ? currentUser.name : 'Guest',
            items: cart,
            subtotal: subtotal,
            platformFee: subtotal * 0.10,
            deliveryFee: 30,
            totalAmount: subtotal + (subtotal * 0.10) + 30,
            address: formData.get('address'),
            deliverySlot: formData.get('slot'),
            paymentMethod: formData.get('payment'),
            status: "Ordered",
            createdAt: new Date().toISOString(),
            farmerId: cart[0].farmerId // In dummy version, just pick first farmer
        };

        orders.push(newOrder);
        localStorage.setItem('kisan_orders', JSON.stringify(orders));
        
        // Update product stock locally
        const products = JSON.parse(localStorage.getItem('kisan_products')) || [];
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) product.quantityAvailable -= cartItem.quantity;
        });
        localStorage.setItem('kisan_products', JSON.stringify(products));

        showToast("Order placed successfully!");
        saveCart([]); // Clear cart
        window.location.href = `order-tracking.html?id=${orderId}`;
    }, 1500);
};

init();
