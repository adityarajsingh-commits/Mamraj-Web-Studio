
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let subtotal = 0;

let discount = 0;

function loadCheckoutItems(){

    const container = document.getElementById("checkoutItems");

    container.innerHTML = "";

    subtotal = 0;

    if(cart.length === 0){

        container.innerHTML = `
            <p style="text-align:center;padding:25px;">
                Your cart is empty.
            </p>
        `;

        document.getElementById("subtotal").innerHTML = "0";
        document.getElementById("grandTotal").innerHTML = "0";

        return;

    }

    cart.forEach(item=>{

        const total=item.price*item.quantity;

        subtotal += total;

        container.innerHTML += `

<div class="cart-item-row">

<div>

<h4>${item.name}</h4>

<p>

₹${item.price.toLocaleString("en-IN")}

× ${item.quantity}

</p>

</div>

<strong>

₹${total.toLocaleString("en-IN")}

</strong>

</div>

`;

    });

    updateTotal();

}

function updateTotal(){

    let grandTotal = subtotal-discount;

    if(grandTotal<0){

        grandTotal=0;

    }

    document.getElementById("subtotal").innerHTML =
    subtotal.toLocaleString("en-IN");

    document.getElementById("grandTotal").innerHTML =
    grandTotal.toLocaleString("en-IN");

}

function applyCoupon(){

    const code=document.getElementById("coupon").value.trim().toUpperCase();

    const msg=document.getElementById("couponMessage");

    if(code==="MAMRAJ10"){

        discount=Math.round(subtotal*0.10);

        msg.style.color="green";

        msg.innerHTML="10% Discount Applied";

    }

    else if(code==="WELCOME500"){

        discount=500;

        msg.style.color="green";

        msg.innerHTML="₹500 Discount Applied";

    }

    else{

        discount=0;

        msg.style.color="red";

        msg.innerHTML="Invalid Coupon";

    }

    updateTotal();

}

function initiateRazorpayPayment(){

    const name=document.getElementById("name").value.trim();

    const email=document.getElementById("email").value.trim();

    const phone=document.getElementById("phone").value.trim();

    const address=document.getElementById("address").value.trim();

    if(!name||!email||!phone||!address){

        alert("Please fill all required billing details.");

        return;

    }

    let finalAmount=subtotal-discount;

    if(finalAmount<0){

        finalAmount=0;

    }

    var options={

        key:"rzp_live_TH1wKGPDAZVVKo",

        amount:finalAmount*100,

        currency:"INR",

        name:"MamRaj Web Studio",

        description:"Website Development Services",

        image:"images/logo.png",

        handler:function(response){

            localStorage.setItem("customerName",name);
            localStorage.setItem("customerEmail",email);
            localStorage.setItem("customerPhone",phone);
            localStorage.setItem("customerAddress",address);
            localStorage.setItem("paymentId",response.razorpay_payment_id);

            alert("Payment Successful!");

            localStorage.removeItem("cart");

            window.location.href="success.html";

        },

        prefill:{

            name:name,

            email:email,

            contact:phone

        },

        theme:{

            color:"#1E2A5A"

        }

    };

    var rzp=new Razorpay(options);

    rzp.open();

}

loadCheckoutItems();


