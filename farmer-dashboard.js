let currentUser = null;

function init() {
    currentUser = checkAuthState('farmer');
    if (!currentUser) return;

    document.getElementById('farmer-name').innerText = currentUser.name;
    loadDashboardData();
}

function loadDashboardData() {
    const products = JSON.parse(localStorage.getItem('kisan_products')) || [];
    const myProducts = products.filter(p => p.farmerId === currentUser.uid);
    renderProducts(myProducts);
    document.getElementById('total-listed').innerText = myProducts.length;

    const orders = JSON.parse(localStorage.getItem('kisan_orders')) || [];
    const myOrders = orders.filter(o => o.farmerId === currentUser.uid);
    renderOrders(myOrders);
    document.getElementById('total-orders').innerText = myOrders.length;

    const earnings = myOrders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (o.subtotal || 0), 0);
    document.getElementById('total-earnings').innerText = '₹' + earnings.toFixed(2);
}

function renderProducts(products) {
    const container = document.getElementById('my-products-list');
    container.innerHTML = products.map(p => `
        <div class="card mb-1" style="display: flex; gap: 15px; align-items: center;">
            <img src="${p.imageURL || 'https://via.placeholder.com/60'}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 0.9rem;">${p.cropName}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted);">₹${p.pricePerKg}/kg | ${p.quantityAvailable}kg left</p>
            </div>
            <div style="display: flex; gap: 5px;">
                <button onclick="deleteProduct('${p.id}')" style="background: #fee2e2; color: #ef4444; padding: 5px; border-radius: 5px;">🗑️</button>
            </div>
        </div>
    `).join('') || '<p class="text-center mt-2">No products listed yet.</p>';
}

function renderOrders(orders) {
    const container = document.getElementById('my-orders-list');
    container.innerHTML = orders.map(o => `
        <div class="card mb-1">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
                <span>Order #${o.id.slice(-6).toUpperCase()}</span>
                <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
            </div>
            <div class="mt-1" style="font-size: 0.8rem;">
                ${o.items.map(i => `${i.cropName} (${i.quantity}kg)`).join(', ')}
            </div>
            <div class="mt-1">
                <select class="form-control" style="font-size: 0.7rem; padding: 4px;" onchange="updateOrderStatus('${o.id}', this.value)">
                    <option value="Ordered" ${o.status === 'Ordered' ? 'selected' : ''}>Ordered</option>
                    <option value="Packed" ${o.status === 'Packed' ? 'selected' : ''}>Packed</option>
                    <option value="Dispatched" ${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </div>
        </div>
    `).join('') || '<p class="text-center mt-2">No orders received yet.</p>';
}

window.deleteProduct = (id) => {
    if (confirm('Delete this product?')) {
        let products = JSON.parse(localStorage.getItem('kisan_products')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('kisan_products', JSON.stringify(products));
        showToast("Product deleted");
        loadDashboardData();
    }
};

window.updateOrderStatus = (orderId, newStatus) => {
    let orders = JSON.parse(localStorage.getItem('kisan_orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('kisan_orders', JSON.stringify(orders));
        showToast(`Order updated to ${newStatus}`);
        loadDashboardData();
    }
};

// Modal Logic
const modal = document.getElementById('product-modal');
const addProductBtn = document.getElementById('add-product-btn');
const productForm = document.getElementById('product-form');

addProductBtn.onclick = () => modal.style.display = 'flex';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

productForm.onsubmit = (e) => {
    e.preventDefault();
    const btn = productForm.querySelector('button');
    const formData = new FormData(productForm);
    
    toggleLoading(btn, true);

    setTimeout(() => {
        const products = JSON.parse(localStorage.getItem('kisan_products')) || [];
        const newProduct = {
            id: 'p' + Date.now(),
            farmerId: currentUser.uid,
            farmerName: currentUser.name,
            farmerLocation: `${currentUser.village}, ${currentUser.state}`,
            cropName: formData.get('cropName'),
            category: formData.get('category'),
            pricePerKg: parseFloat(formData.get('price')),
            quantityAvailable: parseFloat(formData.get('stock')),
            harvestDate: formData.get('harvestDate'),
            description: formData.get('desc'),
            imageURL: formData.get('photo') || "https://images.unsplash.com/photo-1546473427-e1bc638c4e94?auto=format&fit=crop&w=400&h=300",
            rating: 4.5,
            isAvailable: true,
            createdAt: new Date().toISOString()
        };

        products.push(newProduct);
        localStorage.setItem('kisan_products', JSON.stringify(products));

        showToast("Product added successfully!");
        modal.style.display = 'none';
        productForm.reset();
        toggleLoading(btn, false);
        loadDashboardData();
    }, 1000);
};

init();
