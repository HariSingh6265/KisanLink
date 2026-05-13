let products = [];
let filteredProducts = [];
let currentCategory = 'All';
let searchQuery = '';

function init() {
    // Note: Consumer home might be accessible without login for browsing in some apps,
    // but based on earlier logic, let's keep it guarded or relaxed.
    // checkAuthState('consumer'); 
    
    loadProducts();
    setupEventListeners();
}

function loadProducts() {
    products = JSON.parse(localStorage.getItem('kisan_products')) || [];
    applyFilters();
}

function applyFilters() {
    filteredProducts = products.filter(p => {
        const matchesCategory = currentCategory === 'All' || p.category === currentCategory;
        const matchesSearch = p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = filteredProducts.map(p => {
        let freshnessText = "Freshly harvested";
        if (p.harvestDate) {
            const harvestDate = new Date(p.harvestDate);
            const now = new Date();
            const diffHours = Math.floor((now - harvestDate) / (1000 * 60 * 60));
            freshnessText = diffHours > 24 ? `Harvested ${Math.floor(diffHours/24)}d ago` : `Harvested ${diffHours}h ago`;
        }
        return `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
                <img src="${p.imageURL || 'https://via.placeholder.com/400x300'}" class="product-img">
                <div class="product-info">
                    <div class="product-name">${p.cropName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">🧑🌾 ${p.farmerName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">📍 ${p.farmerLocation}</div>
                    <div class="product-price">₹${p.pricePerKg}/kg</div>
                    <div class="freshness-tag">🌾 ${freshnessText}</div>
                    <button class="btn btn-primary btn-block mt-1" style="padding: 8px; font-size: 0.8rem;" 
                        onclick="event.stopPropagation(); addToCart('${p.id}')">Add to Cart</button>
                </div>
            </div>`;
    }).join('') || '<p class="text-center" style="grid-column: 1/-1;">No products found.</p>';
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            applyFilters();
        });
    });
    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn) {
        let isHindi = false;
        translateBtn.onclick = () => {
            isHindi = !isHindi;
            translateBtn.innerText = isHindi ? 'English' : 'Hindi/हिंदी';
            document.querySelectorAll('[data-hi]').forEach(el => {
                el.innerText = isHindi ? el.dataset.hi : el.dataset.en;
            });
        };
    }
}

window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, cropName: product.cropName, pricePerKg: product.pricePerKg, farmerId: product.farmerId, farmerName: product.farmerName, imageURL: product.imageURL, quantity: 1 });
    saveCart(cart);
    showToast(`Added ${product.cropName} to cart!`);
};

init();
