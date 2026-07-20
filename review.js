import { db, ref, push, onValue } from "./script.js";

let selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {
    const starContainer = document.getElementById("star-rating-select"); // UI ka star container
    const reviewForm = document.getElementById("review-form"); // Form ID

    // ------------------------------------
    // 1. STAR SELECTION LOGIC (1 to 5 Stars)
    // ------------------------------------
    if (starContainer) {
        const stars = starContainer.querySelectorAll("i");
        stars.forEach((star, index) => {
            // Hover effect
            star.addEventListener("mouseover", () => {
                highlightStars(stars, index + 1);
            });

            // Mouse leave -> Restore selected rating
            star.addEventListener("mouseleave", () => {
                highlightStars(stars, selectedRating);
            });

            // Click -> Set Rating (e.g. 4 click kiye to 4 tak gold honge)
            star.addEventListener("click", () => {
                selectedRating = index + 1;
                highlightStars(stars, selectedRating);
            });
        });
    }

    function highlightStars(stars, count) {
        stars.forEach((star, index) => {
            if (index < count) {
                star.style.color = "#f1c40f"; // Gold color
                star.classList.remove("fa-regular");
                star.classList.add("fa-solid");
            } else {
                star.style.color = "#ccc"; // Gray color
                star.classList.remove("fa-solid");
                star.classList.add("fa-regular");
            }
        });
    }

    // ------------------------------------
    // 2. SUBMIT REVIEW TO FIREBASE REALTIME
    // ------------------------------------
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("reviewName").value.trim();
            const email = document.getElementById("reviewEmail").value.trim();
            const avatar = document.getElementById("reviewAvatar") ? document.getElementById("reviewAvatar").value.trim() : "";
            const reviewText = document.getElementById("reviewText").value.trim();

            if (selectedRating === 0) {
                alert("Please select a star rating!");
                return;
            }

            try {
                // New Review Firebase me Push karein (Status 'pending' ya 'approved' rakhein)
                await push(ref(db, "reviews"), {
                    name: name,
                    email: email,
                    avatar: avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(name),
                    rating: selectedRating,
                    review: reviewText,
                    status: "approved", // Agar Admin Approve karta hai to 'pending' karein
                    timestamp: Date.now()
                });

                alert("Thank you! Your review has been submitted.");
                reviewForm.reset();
                selectedRating = 0;
                if (starContainer) highlightStars(starContainer.querySelectorAll("i"), 0);

            } catch (error) {
                console.error("Error submitting review:", error);
                alert("Failed to submit review.");
            }
        });
    }

    // ------------------------------------
    // 3. REALTIME LISTENER FOR REVIEWS & SUMMARY
    // ------------------------------------
    const reviewsRef = ref(db, "reviews");
    onValue(reviewsRef, (snapshot) => {
        const rawData = snapshot.val();
        const reviewsList = rawData ? Object.values(rawData) : [];

        // Only show approved reviews
        const approvedReviews = reviewsList.filter(item => item.status === "approved");

        renderSummary(approvedReviews);
        renderReviewsUI(approvedReviews);
    });
});

// Helper: Dynamic Star Render Function (e.g. 4 Rating -> 4 Gold Stars + 1 Gray Star)
function getStarHTML(rating) {
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += `<i class="fa-solid fa-star" style="color: #f1c40f;"></i>`;
        } else {
            starsHTML += `<i class="fa-regular fa-star" style="color: #ccc;"></i>`;
        }
    }
    return starsHTML;
}

// ------------------------------------
// 4. RENDER SUMMARY (Overall Rating calculation)
// ------------------------------------
function renderSummary(reviews) {
    const totalReviews = reviews.length;
    const avgRatingEl = document.getElementById("avg-rating-val"); // Visual Summary Target ID
    const totalCountEl = document.getElementById("total-reviews-count");

    if (totalReviews === 0) {
        if (avgRatingEl) avgRatingEl.innerText = "0.0";
        if (totalCountEl) totalCountEl.innerText = "Based on 0 reviews";
        return;
    }

    const totalStars = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    const avgRating = (totalStars / totalReviews).toFixed(1);

    if (avgRatingEl) avgRatingEl.innerText = avgRating;
    if (totalCountEl) totalCountEl.innerText = `Based on ${totalReviews} reviews`;
}

// ------------------------------------
// 5. RENDER REVIEWS LIST ON PAGE
// ------------------------------------
function renderReviewsUI(reviews) {
    const reviewsContainer = document.getElementById("public-reviews-container");
    if (!reviewsContainer) return;

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `<p style="color: #777;">No reviews yet. Be the first to write one!</p>`;
        return;
    }

    // Newest reviews first
    reviews.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    reviewsContainer.innerHTML = reviews.map(item => `
        <div class="review-card" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <img src="${item.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4 style="margin:0;">${item.name}</h4>
                    <div>${getStarHTML(item.rating)}</div>
                </div>
            </div>
            <p style="margin: 0; color: #555;">${item.review}</p>
        </div>
    `).join("");
}
