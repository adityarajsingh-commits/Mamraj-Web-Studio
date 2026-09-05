// =========================================
// MAMRAJ WEB STUDIO - FIREBASE & MAIN SCRIPT
// =========================================

// =========================================
// MAMRAJ WEB STUDIO
// FIREBASE INITIALIZATION
// =========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    update,
    remove,
    get,
    child,
    onValue
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getAnalytics
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig={

apiKey:"AIzaSyA44Ou2bM7l7m-oay-pwv-4tdmn_S0f0BM",

authDomain:"mamraj-web-studio-1d78b.firebaseapp.com",

databaseURL:"https://mamraj-web-studio-1d78b-default-rtdb.firebaseio.com",

projectId:"mamraj-web-studio-1d78b",

storageBucket:"mamraj-web-studio-1d78b.firebasestorage.app",

messagingSenderId:"229677264871",

appId:"1:229677264871:web:cc3937a5733868e31c5742",

measurementId:"G-DSK1EM5RKL"

};

const app=initializeApp(firebaseConfig);

const db=getDatabase(app);

const auth=getAuth(app);

const analytics=getAnalytics(app);

export{

db,

auth,

ref,

push,

set,

update,

remove,

get,

child,

onValue,

signInWithEmailAndPassword,

signOut,

onAuthStateChanged

};
// =========================================
// REVIEW SYSTEM
// =========================================

let selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {

    const reviewForm = document.getElementById("reviewForm");

    const ratingInput = document.getElementById("rating");

    const stars = document.querySelectorAll(".rating-star");

    // ---------- STAR CLICK ----------

    stars.forEach((star,index)=>{

        star.addEventListener("mouseenter",()=>{

            stars.forEach((s,i)=>{

                if(i<=index){

                    s.classList.remove("far");

                    s.classList.add("fas","active");

                }

                else{

                    s.classList.remove("fas","active");

                    s.classList.add("far");

                }

            });

        });

        star.addEventListener("mouseleave",()=>{

            stars.forEach((s,i)=>{

                if(i<selectedRating){

                    s.classList.remove("far");

                    s.classList.add("fas","active");

                }

                else{

                    s.classList.remove("fas","active");

                    s.classList.add("far");

                }

            });

        });

        star.addEventListener("click",()=>{

            selectedRating=index+1;

            if(ratingInput){

                ratingInput.value=selectedRating;

            }

        });

    });

    // ---------- REVIEW SUBMIT ----------

    if(reviewForm){

        reviewForm.addEventListener("submit",submitReview);

    }

    loadReviews();

});


// =========================================
// SAVE REVIEW
// =========================================

function submitReview(e){

    e.preventDefault();

    const name=document.getElementById("reviewName").value.trim();

    const email=document.getElementById("reviewEmail").value.trim();

    const avatar=document.getElementById("reviewAvatar").value.trim();

    const review=document.getElementById("reviewText").value.trim();

    if(selectedRating===0){

        alert("Please select a rating.");

        return;

    }

    const reviewData={

        id:Date.now().toString(),

        name,

        email,

        avatar,

        review,

        rating:selectedRating,

        status:"approved",

        date:new Date().toLocaleString()

    };

    push(ref(db,"reviews"),reviewData);

    alert("Review submitted successfully.");

    document.getElementById("reviewForm").reset();

    selectedRating=0;

}


// =========================================
// LOAD REVIEWS
// =========================================

function loadReviews(){

    onValue(ref(db,"reviews"),snapshot=>{

        const container=document.getElementById("reviewsContainer");

        if(!container)return;

        container.innerHTML="";

        let reviews=[];

        snapshot.forEach(item=>{

            reviews.push(item.val());

        });

        renderReviews(reviews);

        updateRatingSummary(reviews);

    });

}


// =========================================
// RENDER REVIEWS
// =========================================

function renderReviews(reviews){

    const container=document.getElementById("reviewsContainer");

    if(!container)return;

    container.innerHTML="";

    reviews.forEach(review=>{

        container.innerHTML+=`

<div class="review-card">

<div class="review-header">

<img src="${review.avatar || 'images/default-avatar.png'}">

<div>

<h4>${review.name}</h4>

<div class="stars">

${"★".repeat(review.rating)}

</div>

</div>

</div>

<p>${review.review}</p>

<small>${review.date}</small>

</div>

`;

    });

}


// =========================================
// UPDATE SUMMARY
// =========================================

function updateRatingSummary(reviews){

    let total=reviews.length;

    let sum=0;

    reviews.forEach(r=>{

        sum+=Number(r.rating);

    });

    const avg=total?(sum/total).toFixed(1):"0.0";

    document.getElementById("averageRating").textContent=avg;

    document.getElementById("reviewCount").textContent=total;

}
// =========================================
// PART 3 - REVIEW FILTERS & RATING SUMMARY
// =========================================

function updateRatingSummary(reviews){

    const total = reviews.length;

    let totalStars = 0;

    let ratings = {

        5:0,

        4:0,

        3:0,

        2:0,

        1:0

    };

    reviews.forEach(review=>{

        totalStars += Number(review.rating);

        ratings[review.rating]++;

    });

    const average = total
        ? (totalStars/total).toFixed(1)
        : "0.0";

    document.getElementById("averageRating").textContent = average;

    document.getElementById("reviewCount").textContent = total;

    updateSummaryStars(average);

    updateProgressBar(5,ratings[5],total);

    updateProgressBar(4,ratings[4],total);

    updateProgressBar(3,ratings[3],total);

    updateProgressBar(2,ratings[2],total);

    updateProgressBar(1,ratings[1],total);

}

function updateSummaryStars(avg){

    const stars=document.querySelectorAll(".summary-stars i");

    stars.forEach((star,index)=>{

        if(index<Math.round(avg)){

            star.classList.remove("far");

            star.classList.add("fas","active");

        }

        else{

            star.classList.remove("fas","active");

            star.classList.add("far");

        }

    });

}

function updateProgressBar(star,count,total){

    const percentage=total
        ? (count/total)*100
        :0;

    const bar=document.getElementById(

        `${["one","two","three","four","five"][star-1]}StarBar`

    );

    const label=document.getElementById(

        `${["one","two","three","four","five"][star-1]}StarCount`

    );

    if(bar){

        bar.style.width=percentage+"%";

    }

    if(label){

        label.textContent=count;

    }

}

// =========================================
// SEARCH REVIEW
// =========================================

const reviewSearch=document.getElementById("reviewSearch");

if(reviewSearch){

reviewSearch.addEventListener("input",()=>{

const keyword=reviewSearch.value.toLowerCase();

document.querySelectorAll(".review-card").forEach(card=>{

const text=card.innerText.toLowerCase();

card.style.display=text.includes(keyword)

? "block"

: "none";

});

});

}

// =========================================
// FILTER BY RATING
// =========================================

const filter=document.getElementById("ratingFilter");

if(filter){

filter.addEventListener("change",()=>{

const value=filter.value;

document.querySelectorAll(".review-card").forEach(card=>{

const rating=card.dataset.rating;

if(value==="all"){

card.style.display="block";

}

else{

card.style.display=

rating===value

? "block"

: "none";

}

});

});

}

// =========================================
// LIKE BUTTON
// =========================================

window.likeReview=function(btn){

let count=parseInt(btn.dataset.likes||0);

count++;

btn.dataset.likes=count;

btn.innerHTML=`👍 Helpful (${count})`;

}

// =========================================
// SORT REVIEWS
// =========================================

window.sortReviews=function(type){

const container=document.getElementById("reviewsContainer");

const cards=[...container.children];

cards.sort((a,b)=>{

const ar=parseInt(a.dataset.rating);

const br=parseInt(b.dataset.rating);

if(type==="highest") return br-ar;

if(type==="lowest") return ar-br;

return 0;

});

cards.forEach(card=>container.appendChild(card));

};
// =========================================
// PART 4 - REVIEW MANAGEMENT
// =========================================

// ----------------------------
// Delete Review
// ----------------------------

window.deleteReview = function(reviewId){

    if(!confirm("Delete this review?")) return;

    remove(ref(db,"reviews/"+reviewId))
    .then(()=>{

        showToast("Review deleted successfully.","success");

    })
    .catch(err=>{

        console.error(err);

        showToast("Unable to delete review.","error");

    });

};

// ----------------------------
// Approve Review
// ----------------------------

window.approveReview = function(reviewId){

    update(ref(db,"reviews/"+reviewId),{

        status:"approved"

    })
    .then(()=>{

        showToast("Review Approved","success");

    });

};

// ----------------------------
// Reject Review
// ----------------------------

window.rejectReview = function(reviewId){

    update(ref(db,"reviews/"+reviewId),{

        status:"rejected"

    })
    .then(()=>{

        showToast("Review Rejected","warning");

    });

};

// ----------------------------
// Edit Review
// ----------------------------

window.editReview = function(reviewId){

    const newReview=prompt("Edit Review");

    if(!newReview) return;

    update(ref(db,"reviews/"+reviewId),{

        review:newReview

    })
    .then(()=>{

        showToast("Review Updated","success");

    });

};

// =========================================
// Toast Notification
// =========================================

function showToast(message,type="success"){

    let toast=document.createElement("div");

    toast.className="toast-message "+type;

    toast.innerHTML=message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },100);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },3000);

}

// =========================================
// Render Review Card
// =========================================

function createReviewCard(review,key){

    return `

<div class="review-card"

data-rating="${review.rating}">

<div class="review-header">

<img src="${review.avatar || 'images/default-avatar.png'}"
class="review-avatar">

<div>

<h3>${escapeHTML(review.name)}</h3>

<div class="review-stars">

${"★".repeat(review.rating)}

</div>

<small>${review.date}</small>

</div>

</div>

<p class="review-text">

${escapeHTML(review.review)}

</p>

<div class="review-actions">

<button
onclick="likeReview(this)"
data-likes="0">

👍 Helpful (0)

</button>

<button
onclick="editReview('${key}')">

✏ Edit

</button>

<button
onclick="approveReview('${key}')">

✅ Approve

</button>

<button
onclick="rejectReview('${key}')">

❌ Reject

</button>

<button
onclick="deleteReview('${key}')">

🗑 Delete

</button>

</div>

</div>

`;

}
// Function to toggle Chatbot Window Visibility
function toggleChat() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    // Toggle display between 'flex' and 'none'
    if (chatContainer.style.display === 'flex') {
        chatContainer.style.display = 'none';
    } else {
        chatContainer.style.display = 'flex';
        // Auto-focus input when opened
        document.getElementById('userInput')?.focus();
    }
}

// Function to handle Enter key press inside input field
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Function to Send User Message and simulate AI Response
function sendMessage() {
    const inputElement = document.getElementById('userInput');
    const messagesContainer = document.getElementById('chatMessages');

    if (!inputElement || !messagesContainer) return;

    const userText = inputElement.value.trim();
    if (userText === '') return;

    // 1. Append User Message
    appendMessage(userText, 'user');
    inputElement.value = '';

    // Auto-scroll to latest message
    scrollToBottom();

    // 2. Simulate AI Response (Replace this placeholder logic with API integration if needed)
    setTimeout(() => {
        const botResponse = getBotResponse(userText);
        appendMessage(botResponse, 'bot');
        scrollToBottom();
    }, 600);
}

// Helper function to append message bubble to chat window
function appendMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    messageDiv.classList.add('message', sender);
    messageDiv.innerText = text;
    
    messagesContainer.appendChild(messageDiv);
}

// Helper function to scroll chat body to the bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Simple rule-based bot responses for MamRaj Web Studio
function getBotResponse(input) {
    const query = input.toLowerCase();

    if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('plan')) {
        return "Our web development plans start at ₹4,999 (Starter), ₹9,999 (Professional), and ₹19,999 (E-Commerce). You can view details in the Pricing Plans section!";
    } else if (query.includes('contact') || query.includes('email') || query.includes('call') || query.includes('support')) {
        return "You can submit your query using the Contact Us form at the bottom of the page or email us directly at adityarajsingh@mamrajwebstudio.com.";
    } else if (query.includes('service') || query.includes('work') || query.includes('portfolio')) {
        return "We offer Website Development, UI/UX Design, E-Commerce Solutions, and Business Growth Services. Check out our 'Our Work' section above for samples!";
    } else if (query.includes('hello') || query.includes('hi') || query.includes('namaste') || query.includes('hey')) {
        return "Namaste! How can I assist you with MamRaj Web Studio's services today?";
    } else {
        return "Thank you for reaching out! A representative from MamRaj Web Studio will assist you further. You can also leave a message in our Contact form.";
    }
}

// Make functions globally accessible for inline HTML onclick attributes
window.toggleChat = toggleChat;
window.handleKeyPress = handleKeyPress;
window.sendMessage = sendMessage;
