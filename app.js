// --- KisanConnect Frontend Logic (LocalStorage & Dummy Data) ---

// Dummy Data Initialization
const DUMMY_PRODUCTS = [
    {
        id: 'p1',
        farmerId: 'f1',
        farmerName: 'Ramesh Kumar',
        farmerLocation: 'Dewas, MP',
        cropName: 'Organic Tomatoes',
        category: 'Vegetables',
        pricePerKg: 40,
        quantityAvailable: 150,
        harvestDate: '2024-05-12',
        description: 'Deep red, juicy organic tomatoes grown without pesticides.',
        imageURL: 'https://images.unsplash.com/photo-1546473427-e1bc638c4e94?auto=format&fit=crop&w=400&h=300',
        rating: 4.8
    },
    {
        id: 'p2',
        farmerId: 'f2',
        farmerName: 'Sunita Devi',
        farmerLocation: 'Nashik, MH',
        cropName: 'Kesar Mangoes',
        category: 'Fruits',
        pricePerKg: 120,
        quantityAvailable: 50,
        harvestDate: '2024-05-11',
        description: 'Sweet and aromatic Kesar mangoes from the orchards of Maharashtra.',
        imageURL: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&h=300',
        rating: 4.9
    },
    {
        id: 'p3',
        farmerId: 'f3',
        farmerName: 'Mohan Singh',
        farmerLocation: 'Amritsar, PB',
        cropName: 'Basmati Rice',
        category: 'Grains',
        pricePerKg: 95,
        quantityAvailable: 500,
        harvestDate: '2024-04-20',
        description: 'Extra long grain premium Basmati rice, aged for 1 year.',
        imageURL: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&h=300',
        rating: 4.7
    }
];

// Initialize LocalStorage Data if not present
if (!localStorage.getItem('kisan_products')) {
    localStorage.setItem('kisan_products', JSON.stringify(DUMMY_PRODUCTS));
}
if (!localStorage.getItem('kisan_users')) {
    localStorage.setItem('kisan_users', JSON.stringify([]));
}
if (!localStorage.getItem('kisan_orders')) {
    localStorage.setItem('kisan_orders', JSON.stringify([]));
}

// --- Shared Utilities ---

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#ef4444' : '#2d5a27';
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${bgColor}; color: white; padding: 12px 24px;
        border-radius: 30px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500; font-size: 0.9rem; transition: all 0.3s ease;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleLoading(btn, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerText;
        btn.innerHTML = '<span class="spinner"></span> Loading...';
    } else {
        btn.disabled = false;
        btn.innerText = btn.dataset.originalText || 'Submit';
    }
}

function checkAuthState(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('kisan_current_user'));
    if (!user) {
        if (!window.location.pathname.includes('login') && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        const redirectUrl = user.role === 'farmer' ? 'farmer-dashboard.html' : 'consumer-home.html';
        window.location.href = redirectUrl;
        return null;
    }
    return user;
}

function logoutUser() {
    localStorage.removeItem('kisan_current_user');
    window.location.href = 'index.html';
}

function getCart() {
    return JSON.parse(localStorage.getItem('kisan_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('kisan_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

// Initialize common UI
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => btn.addEventListener('click', logoutUser));
});
