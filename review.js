// Import standard Firebase Modules (Replace with actual CDN URLs)
import { initializeApp } from "FIREBASE_APP_SDK_URL";
import { getDatabase, ref, push, set, onValue } from "FIREBASE_DATABASE_SDK_URL";

// Your Firebase Config (Connecting to your active project)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mamraj-web-studio-1d78b.firebaseapp.com",
  databaseURL: "https://mamraj-web-studio-1d78b-default-rtdb.firebaseio.com",
  projectId: "mamraj-web-studio-1d78b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');
const statsEl = document.getElementById('stats');

// 1. Submit Review (CREATE)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const rating = parseInt(document.getElementById('rating').value);
  const message = document.getElementById('message').value.trim();

  // Create a new unique ID in the "reviews" folder
  const newReviewRef = push(ref(db, 'reviews'));

  set(newReviewRef, {
    id: newReviewRef.key,
    name: name,
    email: email || "Guest",
    rating: rating,
    message: message,
    createdAt: Date.now(),
    verified: false // Set to false so that admin can approve it first
  }).then(() => {
    alert("Thank you! Your review has been submitted for admin approval.");
    form.reset();
  }).catch((error) => {
    alert("Error: " + error.message);
  });
});

// 2. Read and Display Verified Reviews (READ)
onValue(ref(db, 'reviews'), (snapshot) => {
  reviewsList.innerHTML = "";
  
  if (!snapshot.exists()) {
    statsEl.textContent = "No reviews yet. Be the first!";
    return;
  }

  const allReviews = Object.values(snapshot.val());
  
  // Filter only verified reviews (Admin approved)
  const approvedReviews = allReviews.filter(r => r.verified === true);
  
  // Calculate Average Stats
  const totalReviews = approvedReviews.length;
  let totalStars = 0;
  approvedReviews.forEach(r => totalStars += r.rating);
  const average = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : 0;

  statsEl.textContent = `★★★★★ ${average}/5 (${totalReviews} Reviews)`;

  // Render Reviews
  approvedReviews.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <strong>${r.name}</strong> 
      <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
      <p style="margin: 5px 0;">${r.message}</p>
      <small style="color: #888;">${new Date(r.createdAt).toLocaleDateString()}</small>
    `;
    reviewsList.appendChild(card);
  });
});
