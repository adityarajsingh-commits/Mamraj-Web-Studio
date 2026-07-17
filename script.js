// =========================
// MAMRAJ WEB STUDIO
// script.js
// =========================

// Dark Mode Toggle

const themeToggle = document.getElementById("theme-toggle");

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

// Load Saved Theme

window.addEventListener("load", () => {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");

        const icon = themeToggle.querySelector("i");
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }
});
const logoutBtn =
document.getElementById("logoutBtn");

if(localStorage.getItem("loggedIn") === "true"){
    logoutBtn.style.display = "block";
}

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("loggedIn");

    alert("Logged Out Successfully");

    window.location.reload();

});

// Sticky Navbar Shadow

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
        navbar.style.padding = "15px 8%";
    } else {
        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
        navbar.style.padding = "20px 8%";
    }
});


// Scroll Reveal Animation

const revealElements = document.querySelectorAll(
    ".card, .price-card, .testimonial-box, .about"
);

const revealOnScroll = () => {

    revealElements.forEach((element) => {

        const windowHeight = window.innerHeight;
        const revealTop = element.getBoundingClientRect().top;
        const revealPoint = 120;

        if (revealTop < windowHeight - revealPoint) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
};

revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(50px)";
    element.style.transition = "all 0.8s ease";
});

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// Testimonial Auto Slider

const testimonials = document.querySelectorAll(".testimonial-box");

let currentTestimonial = 0;

function showTestimonial(index) {

    testimonials.forEach((testimonial) => {
        testimonial.style.display = "none";
    });

    testimonials[index].style.display = "block";
}

if (testimonials.length > 0) {

    showTestimonial(currentTestimonial);

    setInterval(() => {

        currentTestimonial++;

        if (currentTestimonial >= testimonials.length) {
            currentTestimonial = 0;
        }

        showTestimonial(currentTestimonial);

    }, 4000);
}


// Contact Form Validation

const form = document.querySelector("form");

if (form) {

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const name =
            form.querySelector('input[type="text"]').value.trim();

        const email =
            form.querySelector('input[type="email"]').value.trim();

        const message =
            form.querySelector("textarea").value.trim();

        if (
            name === "" ||
            email === "" ||
            message === ""
        ) {
            alert("Please fill all fields.");
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        alert(
            "Thank you for contacting MamRaj Web Studio! We will get back to you soon."
        );

        form.reset();
    });
}


// Smooth Scrolling

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


// Counter Animation (Optional)

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    counter.innerText = "0";

    const updateCounter = () => {

        const target = +counter.getAttribute("data-target");

        const count = +counter.innerText;

        const increment = target / 100;

        if (count < target) {

            counter.innerText =
                `${Math.ceil(count + increment)}`;

            setTimeout(updateCounter, 20);

        } else {

            counter.innerText = target;
        }
    };

    updateCounter();
});


// Welcome Message

window.addEventListener("load", () => {

    console.log("MamRaj Web Studio Loaded Successfully 🚀");
});
function addToCart(name, price){

    let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
        name:name,
        price:price
    });

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    alert(name + " added to cart");
}

function updateCartCount(){

    let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

    let count =
    document.getElementById("cart-count");

    if(count){
        count.innerText = cart.length;
    }
}

updateCartCount();
const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove",(e)=>{

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

});
