
// 1. Firebase SDK v10 Configuration & Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Apne web app ki exact Firebase config details yahan daalein
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Star Rating Selection Logic (UI Interaction)
let selectedRating = 0;
const stars = document.querySelectorAll('.star-btn');

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'));
        
        // Stars ko highlight karne ka logic
        stars.forEach(s => {
            if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

// 3. CREATE OPERATION: Form Submit handler
const reviewForm = document.getElementById('review-form');

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Inputs se fresh data fetch karna
        const userName = document.getElementById('reviewer-name').value.trim();
        const userEmail = document.getElementById('reviewer-email').value.trim();
        const reviewText = document.getElementById('reviewer-text').value.trim();

        // Validation checks
        if (selectedRating === 0) {
            alert("Please select a star rating before submitting.");
            return;
        }

        try {
            // Firestore ke 'reviews' collection mein document add karna
            await addDoc(collection(db, "reviews"), {
                name: userName,
                email: userEmail,
                rating: selectedRating,
                review: reviewText,
                createdAt: serverTimestamp() // Real-time server timestamp
            });

            alert("Review submitted successfully!");
            
            // Form aur stars ko reset karna
            reviewForm.reset();
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));

            // TODO: Yahan baad mein READ function call karenge real-time update ke liye

        } catch (error) {
            console.error("Error adding review: ", error);
            alert("Failed to submit review. Check console for details.");
        }
    });
}
