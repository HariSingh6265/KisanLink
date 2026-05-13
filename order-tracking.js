const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');

function init() {
    if (!orderId) {
        window.location.href = 'index.html';
        return;
    }
    loadOrder();
}

function loadOrder() {
    const orders = JSON.parse(localStorage.getItem('kisan_orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (order) {
        renderOrder(order);
    } else {
        document.getElementById('display-order-id').innerText = "#NOT-FOUND";
    }
}

function renderOrder(order) {
    document.getElementById('display-order-id').innerText = `#${order.id.slice(-6).toUpperCase()}`;
    
    const summary = document.getElementById('order-summary');
    summary.innerHTML = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px;">
            <span>${item.cropName} x ${item.quantity}kg</span>
            <span>₹${(item.pricePerKg * item.quantity).toFixed(2)}</span>
        </div>
    `).join('') + `
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span>Total</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
        </div>
    `;

    // Update tracking steps based on status
    const statuses = ["Ordered", "Packed", "Dispatched", "Delivered"];
    const currentStatusIndex = statuses.indexOf(order.status);
    const steps = document.querySelectorAll('.t-step');
    
    steps.forEach((step, index) => {
        if (index <= currentStatusIndex) {
            step.classList.add('active');
            step.querySelector('.step-dot').style.background = 'var(--primary)';
            step.querySelector('.step-dot').style.color = 'white';
        }
    });
}

init();
