import { auth, onAuthStateChanged } from "./script.js";

let total = 0;

// Render Cart Items & Calculate Total
function renderCart() {
    // 1. Check for both possible container IDs (cart-items OR cartList)
    const cartItems = document.getElementById("cart-items") || document.getElementById("cartList");
    let cart = JSON.parse(localStorage.getItem("cart")) || JSON.parse(localStorage.getItem("mamraj_cart")) || [];
    total = 0;

    if (cartItems) {
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `<p style="text-align:center; padding: 20px; color: #5A6578; font-size: 14px;">Your cart is empty.</p>`;
        } else {
            cart.forEach((item, index) => {
                total += Number(item.price || 0);
                cartItems.innerHTML += `
                    <div class="cart-item" style="background: white; padding: 14px 16px; margin-bottom: 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E2D9CF;">
                        <div>
                            <h3 style="margin: 0; color: #0A1128; font-size: 15px; font-weight: 700;">${item.name}</h3>
                            <p style="margin: 4px 0 0; color: #C06C4C; font-weight: 700; font-size: 13px;">₹${Number(item.price).toLocaleString('en-IN')}</p>
                        </div>
                        <button onclick="window.removeItem(${index})" style="background: #D90429; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Remove</button>
                    </div>
                `;
            });
        }
    }

    // 2. Update UI Totals across all possible ID variations
    const totalEl = document.getElementById("total");
    const cartTotalValEl = document.getElementById("cart-total-val");
    const cartTotalSpan = document.getElementById("cartTotal");

    if (totalEl) totalEl.innerText = "Total: ₹" + total.toLocaleString('en-IN');
    if (cartTotalValEl) cartTotalValEl.innerText = total.toLocaleString('en-IN');
    if (cartTotalSpan) cartTotalSpan.innerText = total.toLocaleString('en-IN');

    // Pay button disable state handle
    const payBtn = document.querySelector(".btn-pay") || document.querySelector("button[type='submit']");
    if (payBtn) {
        payBtn.disabled = total <= 0;
    }
}

// Global Add Item Function (Testing & Store sync)
window.addToCart = function(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: name, price: Number(price) });
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
};

// Global Remove Item Function
window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart(); 
};

// Global Razorpay Checkout Function
window.payWithRazorpay = function(event) {
    if (event) event.preventDefault();

    // Check all possible input ID variations
    const nameEl = document.getElementById("userName") || document.getElementById("custName") || document.querySelector("input[placeholder*='Name']");
    const emailEl = document.getElementById("userEmail") || document.getElementById("custEmail") || document.querySelector("input[type='email']");
    const phoneEl = document.getElementById("userPhone") || document.getElementById("custPhone") || document.querySelector("input[type='tel']");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";

    if (!name || !email || !phone) {
        alert("Please enter all Billing Details (Full Name, Email, and Mobile) to proceed.");
        return;
    }

    if (total <= 0) {
        alert("Your shopping cart is empty! Please add products before paying.");
        return;
    }

    const options = {
        "key": "rzp_test_TFattys1zBhps1",
        "amount": Math.round(total * 100), // Convert INR to Paise
        "currency": "INR",
        "name": "MamRaj Web Studio",
        "description": "Shopping Cart Checkout",
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            localStorage.removeItem("cart");
            window.location.href = "/success.html";
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": phone
        },
        "theme": {
            "color": "#0A1128"
        },
        "modal": {
            "ondismiss": function () {
                alert("Transaction cancelled.");
            }
        }
    };

    try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
            alert("Payment failed: " + resp.error.description);
        });
        rzp.open();
    } catch (err) {
        console.error("Razorpay Error:", err);
        alert("Razorpay checkout failed to initialize. Make sure Razorpay SDK script is included in HTML.");
    }
};

// DOM Init
document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    // Attach submit listener to Billing Form automatically
    const checkoutForm = document.getElementById("checkoutForm") || document.querySelector("form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", window.payWithRazorpay);
    }

    // Local Storage Profile Sync
    const savedProfile = JSON.parse(localStorage.getItem("clientProfile"));
    if (savedProfile) {
        const nameInput = document.getElementById("userName") || document.getElementById("custName");
        const emailInput = document.getElementById("userEmail") || document.getElementById("custEmail");
        const phoneInput = document.getElementById("userPhone") || document.getElementById("custPhone");

        if (nameInput && savedProfile.name) nameInput.value = savedProfile.name;
        if (emailInput && savedProfile.email) emailInput.value = savedProfile.email;
        if (phoneInput && savedProfile.phone) phoneInput.value = savedProfile.phone;
    }
});

// Firebase Auth Sync
onAuthStateChanged(auth, (user) => {
    if (user) {
        const nameInput = document.getElementById("userName") || document.getElementById("custName");
        const emailInput = document.getElementById("userEmail") || document.getElementById("custEmail");

        if (nameInput && user.displayName) nameInput.value = user.displayName;
        if (emailInput && user.email) emailInput.value = user.email;
    }
});
