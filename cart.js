import { auth, onAuthStateChanged } from "./script.js";

let total = 0;

// Render Cart Items & Calculate Total
function renderCart() {
    const cartItems = document.getElementById("cart-items");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    total = 0;

    if (cartItems) {
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `<p style="text-align:center; padding: 20px; color: #666;">Your cart is empty.</p>`;
        } else {
            cart.forEach((item, index) => {
                total += Number(item.price || 0);
                cartItems.innerHTML += `
                    <div class="cart-item" style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div>
                            <h3 style="margin: 0; color: #1E2A5A; font-size: 16px;">${item.name}</h3>
                            <p style="margin: 5px 0 0; color: #C58B73; font-weight: 600;">₹${item.price}</p>
                        </div>
                        <button onclick="removeItem(${index})" style="background: #e63946; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">Remove</button>
                    </div>
                `;
            });
        }
    }

    // Update UI Totals
    const totalEl = document.getElementById("total");
    const cartTotalValEl = document.getElementById("cart-total-val");

    if (totalEl) totalEl.innerText = "Total: ₹" + total;
    if (cartTotalValEl) cartTotalValEl.innerText = total;
}

// Global Remove Item Function (Exposed for HTML onclick)
window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart(); // Re-render without page reload
};

// Global Razorpay Checkout Function (Exposed for HTML onclick/submit)
window.payWithRazorpay = function(event) {
    if (event) event.preventDefault();

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const phoneEl = document.getElementById("userPhone");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";

    if (!name || !email || !phone) {
        alert("Please enter all Billing Details (Full Name, Email, and Mobile) to proceed.");
        return;
    }

    if (total <= 0) {
        alert("Your shopping cart is empty.");
        return;
    }

    const options = {
        "key": "rzp_test_TFattys1zBhps1",
        "amount": Math.round(total * 100), // Convert to Paise
        "currency": "INR",
        "name": "MamRaj Web Studio",
        "description": "Shopping Cart Checkout",
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            localStorage.removeItem("cart");
            window.location.href = "/success.html"; // Redirect to success page
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": phone
        },
        "theme": {
            "color": "#1E2A5A"
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
        alert("Failed to initialize Razorpay checkout popup.");
    }
};

// Auto-fill Client Profile & Init Cart on Page Load
document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    // Local Storage Profile Sync
    const savedProfile = JSON.parse(localStorage.getItem("clientProfile"));
    if (savedProfile) {
        if (document.getElementById("userName") && savedProfile.name) document.getElementById("userName").value = savedProfile.name;
        if (document.getElementById("userEmail") && savedProfile.email) document.getElementById("userEmail").value = savedProfile.email;
        if (document.getElementById("userPhone") && savedProfile.phone) document.getElementById("userPhone").value = savedProfile.phone;
    }
});

// Firebase Auth Auto-Fill Sync (Modular v10)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userNameEl = document.getElementById("userName");
        const userEmailEl = document.getElementById("userEmail");

        if (userNameEl && user.displayName) userNameEl.value = user.displayName;
        if (userEmailEl && user.email) userEmailEl.value = user.email;
    }
});
