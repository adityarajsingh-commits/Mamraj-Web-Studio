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

// --- Razorpay Standard Web Checkout Integration ---
const RAZORPAY_KEY_ID = "rzp_test_TFattys1zBhps1"; 

async function payWithRazorpay(event) {
    if (event) event.preventDefault();

    // 1. Gather Billing Details & Validate inputs
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

    // Convert total to paise (minimum 100 paise = 1 INR)
    const amountInPaise = Math.round(total * 100);
    if (amountInPaise < 100) {
        alert("Minimum purchase amount must be at least ₹1.00");
        return;
    }

    const payBtn = document.getElementById("pay-button") || (event && event.target);
    const originalText = payBtn ? payBtn.innerText : "Pay Now Securely";

    try {
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.textContent = "Processing...";
        }

        // STEP 1: Securely create order on your Node.js backend
        const orderResponse = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amountInPaise,
                receipt: "rcpt_" + Date.now()
            })
        });

        if (!orderResponse.ok) {
            throw new Error("Unable to create order with billing server.");
        }

        const orderData = await orderResponse.json();

        // STEP 2: Configure Razorpay Checkout options
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "MamRaj Web Studio",
            description: "Shopping Cart Checkout",
            order_id: orderData.order_id,
            handler: async function (response) {
                try {
                    if (payBtn) payBtn.textContent = "Verifying payment...";
                    
                    // STEP 3: Verify Razorpay Signature on your backend
                    const verifyResponse = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verificationResult = await verifyResponse.json();

                    if (verifyResponse.ok && verificationResult.status === "success") {
                        alert("Thank you! Your transaction was successful and verified.");
                        localStorage.removeItem("cart");
                        location.reload();
                    } else {
                        alert("Verification Error: " + (verificationResult.message || "Payment signature invalid."));
                        resetBtn();
                    }
                } catch (err) {
                    console.error("Payment verification failure:", err);
                    alert("Error reaching validation backend. Contact support.");
                    resetBtn();
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: "#1E2A5A"
            },
            modal: {
                ondismiss: function () {
                    alert("Transaction cancelled by user.");
                    resetBtn();
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
            alert("Payment failed: " + resp.error.description);
            resetBtn();
        });
        rzp.open();

    } catch (error) {
        console.error("Checkout setup failure:", error);
        alert("Failed to initialize transaction. Make sure your local Node.js server (server.js) is running.");
        resetBtn();
    }

    function resetBtn() {
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = originalText;
        }
    }
}
