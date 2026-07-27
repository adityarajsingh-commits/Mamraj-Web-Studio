// =====================================
// cart.js
// Part 1
// =====================================

// ----------------------------
// CART INITIALIZATION
// ----------------------------

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ----------------------------
// SAVE CART
// ----------------------------

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));

}

// ----------------------------
// LOAD CART
// ----------------------------

function refreshCart() {

    cart = JSON.parse(localStorage.getItem("cart")) || [];

}

// ----------------------------
// UPDATE CART BADGE
// ----------------------------

function updateCartBadge() {

    refreshCart();

    const badge = document.getElementById("cart-count");

    if (!badge) return;

    let count = 0;

    cart.forEach(item => {

        count += item.quantity;

    });

    badge.innerText = count;

}

// ----------------------------
// ADD TO CART
// ----------------------------

function addToCart(name, price) {

    refreshCart();

    const existing = cart.find(product => product.name === name);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: Date.now(),

            name: name,

            price: Number(price),

            quantity: 1

        });

    }

    saveCart();

    updateCartBadge();

    alert(name + " added to cart.");

}

// ----------------------------
// REMOVE ITEM
// ----------------------------

function removeItem(index) {

    refreshCart();

    cart.splice(index, 1);

    saveCart();

    updateCartBadge();

    loadCart();

}

// ----------------------------
// INCREASE QUANTITY
// ----------------------------

function increaseQty(index) {

    refreshCart();

    if (!cart[index]) return;

    cart[index].quantity++;

    saveCart();

    updateCartBadge();

    loadCart();

}

// ----------------------------
// DECREASE QUANTITY
// ----------------------------

function decreaseQty(index) {

    refreshCart();

    if (!cart[index]) return;

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    saveCart();

    updateCartBadge();

    loadCart();

}

// ----------------------------
// CLEAR CART
// ----------------------------

function clearCart() {

    cart = [];

    saveCart();

    updateCartBadge();

    loadCart();

}
// ----------------------------
// LOAD CART INTO CHECKOUT
// ----------------------------

function loadCart() {

    refreshCart();

    const container = document.getElementById("cartItems");

    const subtotal = document.getElementById("itemsSubtotal");

    const totalAmount = document.getElementById("totalAmount");

    if (!container) return;

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = `

        <div style="padding:25px;text-align:center;color:#777;">
            <h3>Your Cart is Empty</h3>
            <p>Add a service to continue.</p>
        </div>

        `;

        if (subtotal) subtotal.innerText = "0";

        if (totalAmount) totalAmount.innerText = "0";

        return;

    }

    cart.forEach((item,index)=>{

        const amount = item.price * item.quantity;

        total += amount;

        container.innerHTML += `

<div class="cart-item-row">

    <div>

        <div class="cart-item-title">

            ${item.name}

        </div>

        <div class="qty-controls">

            <button class="btn-qty"
                onclick="decreaseQty(${index})">

                -

            </button>

            <span class="qty-count">

                ${item.quantity}

            </span>

            <button class="btn-qty"
                onclick="increaseQty(${index})">

                +

            </button>

            <button class="btn-remove"
                onclick="removeItem(${index})">

                Remove

            </button>

        </div>

    </div>

    <div class="cart-item-price">

        ₹${amount.toLocaleString("en-IN")}

    </div>

</div>

`;

    });

    if (subtotal)

        subtotal.innerText = total.toLocaleString("en-IN");

    if (totalAmount)

        totalAmount.innerText = total.toLocaleString("en-IN");

}

// ----------------------------
// GET CART TOTAL
// ----------------------------

function getCartTotal(){

    refreshCart();

    let total = 0;

    cart.forEach(item=>{

        total += item.price * item.quantity;

    });

    return total;

}

// ----------------------------
// GET TOTAL ITEMS
// ----------------------------

function getTotalItems(){

    refreshCart();

    let total = 0;

    cart.forEach(item=>{

        total += item.quantity;

    });

    return total;

}

// ----------------------------
// GLOBAL FUNCTIONS
// ----------------------------

window.addToCart = addToCart;

window.removeItem = removeItem;

window.increaseQty = increaseQty;

window.decreaseQty = decreaseQty;

window.clearCart = clearCart;

window.getCartTotal = getCartTotal;

window.getTotalItems = getTotalItems;

// ----------------------------
// AUTO LOAD
// ----------------------------

document.addEventListener("DOMContentLoaded",()=>{

    updateCartBadge();

    loadCart();

});
