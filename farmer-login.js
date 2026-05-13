const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleBtns = document.querySelectorAll('.toggle-btn');

// Toggle between Login and Register
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.target === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    });
});

// Farmer Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button');
    const phone = loginForm.phone.value;
    const password = loginForm.password.value;

    toggleLoading(btn, true);
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('kisan_users')) || [];
        const user = users.find(u => u.phone === phone && u.password === password && u.role === 'farmer');

        if (user) {
            localStorage.setItem('kisan_current_user', JSON.stringify(user));
            showToast("Login successful!");
            window.location.href = 'farmer-dashboard.html';
        } else {
            showToast("Invalid phone or password", 'error');
            toggleLoading(btn, false);
        }
    }, 1000);
});

// Farmer Registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button');
    const formData = new FormData(registerForm);
    const phone = formData.get('phone');
    const password = formData.get('password');

    toggleLoading(btn, true);

    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('kisan_users')) || [];
        if (users.find(u => u.phone === phone)) {
            showToast("Phone number already registered", 'error');
            toggleLoading(btn, false);
            return;
        }

        const newUser = {
            uid: 'f' + Date.now(),
            name: formData.get('name'),
            phone: phone,
            password: password,
            role: "farmer",
            village: formData.get('village'),
            state: formData.get('state'),
            aadhaarNumber: formData.get('aadhaar'),
            bankAccount: formData.get('bank'),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('kisan_users', JSON.stringify(users));
        localStorage.setItem('kisan_current_user', JSON.stringify(newUser));

        showToast("Account created successfully!");
        window.location.href = 'farmer-dashboard.html';
    }, 1500);
});
