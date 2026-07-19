// =========================================
// MAMRAJ WEB STUDIO
// PART 1
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

            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");

            localStorage.setItem("theme", "dark");

        } else {

            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");

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
// Logout Button
// ----------------------

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    if (localStorage.getItem("loggedIn") === "true") {

        logoutBtn.style.display = "block";

    }

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("loggedIn");

        alert("Logged Out Successfully");

        window.location.reload();

    });

}

// ----------------------
// Sticky Navbar
// ----------------------

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    if (window.scrollY > 50) {

        navbar.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.15)";

        navbar.style.padding = "15px 8%";

    } else {

        navbar.style.boxShadow = "none";

        navbar.style.padding = "20px 8%";

    }

});

// ----------------------
// Welcome Message
// ----------------------

window.addEventListener("load", () => {

    console.log("MamRaj Web Studio Loaded Successfully 🚀");

});

// =========================================
// MAMRAJ WEB STUDIO
// PART 2
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

        if (overlay) {
            overlay.classList.add("show");
        }

        document.body.style.overflow = "hidden";

    });

}

if (closeMenu && navLinks) {

    closeMenu.addEventListener("click", () => {

        navLinks.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("show");
        }

        document.body.style.overflow = "auto";

    });

}

if (overlay) {

    overlay.addEventListener("click", () => {

        navLinks.classList.remove("active");
        overlay.classList.remove("show");
        document.body.style.overflow = "auto";

    });

}

// Close menu after clicking any menu item

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        if (navLinks) {

            navLinks.classList.remove("active");

            if (overlay) {
                overlay.classList.remove("show");
            }

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

        const target = document.querySelector(
            this.getAttribute("href")
        );

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

const revealElements = document.querySelectorAll(
    ".card, .price-card, .testimonial-box, .about"
);

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

const testimonials =
document.querySelectorAll(".testimonial-box");

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
// PART 3
// =========================================


// ----------------------
// Shopping Cart
// ----------------------

function addToCart(name, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
        name: name,
        price: price
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert(name + " added to cart successfully!");

}

function updateCartCount() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const count = document.getElementById("cart-count");

    if (count) {
        count.innerText = cart.length;
    }

}

updateCartCount();


// ----------------------
// Contact Form Validation
// ----------------------

const form = document.querySelector("form");

if (form) {

    form.addEventListener("submit", function (e) {

        const name =
            form.querySelector('input[name="name"]').value.trim();

        const email =
            form.querySelector('input[name="email"]').value.trim();

        const message =
            form.querySelector("textarea").value.trim();

        if (!name || !email || !message) {

            e.preventDefault();

            alert("Please fill all fields.");

            return;

        }

        const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            e.preventDefault();

            alert("Please enter a valid email address.");

            return;

        }

        // FormSubmit ko submit hone do
        alert("Thank you! Your message has been sent.");

    });

}


// ----------------------
// EmailJS
// ----------------------

// Sirf tab chalega jab contactForm page par ho

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

            counter.innerText =
            Math.ceil(current + increment);

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
// Website Loaded
// ----------------------

window.addEventListener("load", () => {

    updateCartCount();

    console.log("MamRaj Web Studio Ready 🚀");

});
function payWithRazorpay() {
    // 1. User ki bhari hui details uthao
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    
    // Agar details khali hain to aage mat badho
    if (!name || !email || !phone) {
        alert("Kripya saari billing details bharein!");
        return;
    }

    // 2. Amount uthao (Razorpay humesha paise paise me leta hai, isliye * 100)
    // Agar total ₹19998 hai, to Razorpay ke liye 1999800 hoga.
    const totalAmountInRupees = 19998; 
    const amountInPaise = totalAmountInRupees * 100;

    // 3. Razorpay ki settings configure karein
    var options = {
        "key": "YOUR_RAZORPAY_KEY_ID", // Yahan apni Razorpay Dashboard se mili Test Key dalein
        "amount": amountInPaise, 
        "currency": "INR",
        "name": "MamRaj Web Studio",
        "description": "Professional Website Development Service",
        "image": "https://mamrajwebstudio.in/logo.png", // Aapka logo URL
        "handler": function (response){
            // Jab payment SUCCESS ho jaye tab yeh code chalega
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            
            // Yahan aap user ko thank-you page par bhej sakte hain ya cart khali kar sakte hain
            window.location.href = "/success.html";
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": phone
        },
        "theme": {
            "color": "#2b1055" // Aapki website ka primary dark color
        }
    };

    // 4. Razorpay ka popup kholo
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
