// =========================================
// MAMRAJ WEB STUDIO - FIREBASE & MAIN SCRIPT
// =========================================

// ----------------------
// 1. Firebase Initialization & Exports
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Yahan apni Firebase Console ki Config Details check/update kar lein
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Export for Admin Dashboard & Reviews Management
export { db, auth, ref, update, remove, onValue, signInWithEmailAndPassword, signOut, onAuthStateChanged };


// =========================================
// MAMRAJ WEB STUDIO
// PART 1 - UI & THEME LOGIC
// =========================================

// ----------------------
// Theme Toggle
// ----------------------
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const icon = themeToggle.querySelector("i");

        if (document.body.classList.contains("dark")) {
            if (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            }
            localStorage.setItem("theme", "dark");
        } else {
            if (icon) {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            }
            localStorage.setItem("theme", "light");
        }
    });
}

// ----------------------
// Load Saved Theme
// ----------------------
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (themeToggle) {
            const icon = themeToggle.querySelector("i");
            if (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            }
        }
    }
});

// ----------------------
// Sticky Navbar
// ----------------------
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,.15)";
        navbar.style.padding = "15px 8%";
    } else {
        navbar.style.boxShadow = "none";
        navbar.style.padding = "20px 8%";
    }
});


// =========================================
// MAMRAJ WEB STUDIO
// PART 2 - MENU & SCROLL ANIMATIONS
// =========================================

// ----------------------
// Mobile Hamburger Menu
// ----------------------
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const closeMenu = document.getElementById("close-menu");
const overlay = document.getElementById("overlay");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.add("active");
        if (overlay) overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    });
}

if (closeMenu && navLinks) {
    closeMenu.addEventListener("click", () => {
        navLinks.classList.remove("active");
        if (overlay) overlay.classList.remove("show");
        document.body.style.overflow = "auto";
    });
}

if (overlay) {
    overlay.addEventListener("click", () => {
        if (navLinks) navLinks.classList.remove("active");
        overlay.classList.remove("show");
        document.body.style.overflow = "auto";
    });
}

// Close menu after clicking any menu link
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("active");
            if (overlay) overlay.classList.remove("show");
            document.body.style.overflow = "auto";
        }
    });
});

// ----------------------
// Smooth Scroll
// ----------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// ----------------------
// Scroll Reveal Animation
// ----------------------
const revealElements = document.querySelectorAll(".card, .price-card, .testimonial-box, .about");

revealElements.forEach(element => {
    element.style.opacity = "0";
    element.style.transform = "translateY(40px)";
    element.style.transition = "all .7s ease";
});

function revealOnScroll() {
    revealElements.forEach(element => {
        const windowHeight = window.innerHeight;
        const revealTop = element.getBoundingClientRect().top;

        if (revealTop < windowHeight - 120) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ----------------------
// Testimonial Slider
// ----------------------
const testimonials = document.querySelectorAll(".testimonial-box");
let currentTestimonial = 0;

if (testimonials.length > 0) {
    function showTestimonial(index) {
        testimonials.forEach(item => {
            item.style.display = "none";
        });
        testimonials[index].style.display = "block";
    }

    showTestimonial(currentTestimonial);

    setInterval(() => {
        currentTestimonial++;
        if (currentTestimonial >= testimonials.length) {
            currentTestimonial = 0;
        }
        showTestimonial(currentTestimonial);
    }, 4000);
}


// =========================================
// MAMRAJ WEB STUDIO
// PART 3 - CART, FORMS & PAYMENT
// =========================================

// ----------------------
// Shopping Cart
// ----------------------
window.addToCart = function(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: name, price: price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(name + " added to cart successfully!");
};

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = document.getElementById("cart-count");
    if (count) {
        count.innerText = cart.length;
    }
}

// ----------------------
// Contact Form Validation & EmailJS
// ----------------------
if (typeof emailjs !== "undefined") {
    emailjs.init("-lpDLEthvMF803enK");
}

const emailForm = document.getElementById("contactForm");

if (emailForm && typeof emailjs !== "undefined") {
    emailForm.addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.send(
            "service_55pjnkk",
            "YOUR_TEMPLATE_ID",
            {
                from_name: document.getElementById("name").value,
                from_email: document.getElementById("email").value,
                message: document.getElementById("message").value
            }
        ).then(() => {
            alert("Message Sent Successfully!");
            emailForm.reset();
        }).catch((error) => {
            console.log(error);
            alert("Failed to send message.");
        });
    });
}

// ----------------------
// Counter Animation
// ----------------------
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    counter.innerText = "0";
    const target = +counter.dataset.target;

    const updateCounter = () => {
        const current = +counter.innerText;
        const increment = target / 100;

        if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(updateCounter, 20);
        } else {
            counter.innerText = target;
        }
    };
    updateCounter();
});

// ----------------------
// Custom Cursor
// ----------------------
const cursor = document.querySelector(".cursor");
if (cursor) {
    document.addEventListener("mousemove", e => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });
}

// ----------------------
// Razorpay Payment Integration
// ----------------------
window.payWithRazorpay = function() {
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const phoneEl = document.getElementById('userPhone');

    const name = nameEl ? nameEl.value : '';
    const email = emailEl ? emailEl.value : '';
    const phone = phoneEl ? phoneEl.value : '';
    
    if (!name || !email || !phone) {
        alert("Please fill all your billing details!");
        return;
    }

    const totalAmountInRupees = 19998; 
    const amountInPaise = totalAmountInRupees * 100;

    var options = {
        "key": "rzp_test_TF2luj9K5VkNZJ",
        "amount": amountInPaise, 
        "currency": "INR",
        "name": "MamRaj Web Studio",
        "description": "Professional Website Development Service",
        "image": "https://mamrajwebstudio.in/logo.png",
        "handler": function (response){
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            window.location.href = "/success.html";
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": phone
        },
        "theme": {
            "color": "#2b1055"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
};

// Ready Initialization
window.addEventListener("load", () => {
    updateCartCount();
    console.log("MamRaj Web Studio Ready 🚀");
});
