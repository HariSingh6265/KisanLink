const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let product = null;

function init() {
    if (!productId) {
        showToast("Product not found", "error");
        window.location.href = 'consumer-home.html';
        return;
    }
    loadProduct();
}

function loadProduct() {
    const products = JSON.parse(localStorage.getItem('kisan_products')) || [];
    product = products.find(p => p.id === productId);

    if (product) {
        renderProduct();
    } else {
        showToast("Product not found", "error");
        window.location.href = 'consumer-home.html';
    }
}

function renderProduct() {
    document.getElementById('product-name').innerText = product.cropName;
    document.getElementById('product-price').innerText = `₹${product.pricePerKg}/kg`;
    document.getElementById('product-img').src = product.imageURL || 'https://via.placeholder.com/800x400';
    document.getElementById('product-desc').innerText = product.description || "Fresh produce directly from the farm.";
    document.getElementById('product-stock').innerText = `${product.quantityAvailable} kg left`;
    document.getElementById('farmer-name').innerText = product.farmerName;
    document.getElementById('farmer-loc').innerText = product.farmerLocation;
    
    if (product.harvestDate) {
        const harvestDate = new Date(product.harvestDate);
        const now = new Date();
        const diffHours = Math.floor((now - harvestDate) / (1000 * 60 * 60));
        const freshnessText = diffHours > 24 ? `Harvested ${Math.floor(diffHours/24)}d ago` : `Harvested ${diffHours}h ago`;
        document.getElementById('harvest-info').innerText = freshnessText;
    }
}

document.getElementById('add-to-cart-btn').onclick = () => {
    const qty = parseInt(document.getElementById('qty-input').value) || 1;
    if (qty > product.quantityAvailable) {
        showToast(`Only ${product.quantityAvailable}kg available`, "error");
        return;
    }
    
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            cropName: product.cropName,
            pricePerKg: product.pricePerKg,
            farmerId: product.farmerId,
            farmerName: product.farmerName,
            imageURL: product.imageURL,
            quantity: qty
        });
    }
    saveCart(cart);
    showToast(`Added ${qty}kg of ${product.cropName} to cart!`);
};

init();
