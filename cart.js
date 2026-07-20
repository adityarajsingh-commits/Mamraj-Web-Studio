// Initialize cart and elements
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartItems = document.getElementById("cart-items");
let total = 0;

// Render Cart Items dynamically
if (cartItems) {
    cartItems.innerHTML = "";
    cart.forEach((item, index) => {
        total += Number(item.price);
        cartItems.innerHTML += `
            <div class="cart-item" style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: #1E2A5A;">${item.name}</h3>
                    <p style="margin: 5px 0 0; color: #C58B73; font-weight: 600;">₹${item.price}</p>
                </div>
                <button onclick="removeItem(${index})" style="background: #e63946; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remove</button>
            </div>
        `;
    });
}

// Update the visible total metrics across the layout
if (document.getElementById("total")) {
    document.getElementById("total").innerText = "Total: ₹" + total;
}
if (document.getElementById("cart-total-val")) {
    document.getElementById("cart-total-val").innerText = total;
}

// Remove item from cart
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}

// AUTO-FILL CLIENT PROFILE IN CART FORM
document.addEventListener("DOMContentLoaded", () => {
    const savedProfile = JSON.parse(localStorage.getItem("clientProfile"));
    if (savedProfile) {
        if (document.getElementById("userName") && savedProfile.name) {
            document.getElementById("userName").value = savedProfile.name;
        }
        if (document.getElementById("userEmail") && savedProfile.email) {
            document.getElementById("userEmail").value = savedProfile.email;
        }
        if (document.getElementById("userPhone") && savedProfile.phone) {
            document.getElementById("userPhone").value = savedProfile.phone;
        }
    }
});

// Direct Razorpay Checkout Function
function payWithRazorpay(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("userName") ? document.getElementById("userName").value.trim() : "";
    const email = document.getElementById("userEmail") ? document.getElementById("userEmail").value.trim() : "";
    const phone = document.getElementById("userPhone") ? document.getElementById("userPhone").value.trim() : "";

    if (!name || !email || !phone) {
        alert("Please enter all Billing Details (Full Name, Email, and Mobile) to proceed.");
        return;
    }

    if (total <= 0) {
        alert("Your shopping cart is empty.");
        return;
    }

    // Direct Modal Configuration
    const options = {
        "key": "rzp_test_TFattys1zBhps1",
        "amount": Math.round(total * 100),
        "currency": "INR",
        "name": "MamRaj Web Studio",
        "description": "Shopping Cart Checkout",
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            localStorage.removeItem("cart");
            location.reload();
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
}
