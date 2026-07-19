import { db, ref, push, update, remove, onValue } from "./script.js";

// Helper function to escape text and protect against malicious HTML injections
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const starSelector = document.getElementById("star-selector");
    const ratingValueInput = document.getElementById("rating-value");
    const reviewForm = document.getElementById("review-form");
    const reviewsContainer = document.getElementById("reviews-list");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const submitBtn = document.getElementById("submit-btn");
    const formTitle = document.getElementById("form-title");
    const formFeedback = document.getElementById("form-feedback");
    const activeEditId = document.getElementById("edit-review-id");

    // Star Selection Interaction UI Logic
    if (starSelector) {
        const stars = starSelector.querySelectorAll(".star-btn");
        stars.forEach(star => {
            star.addEventListener("click", () => {
                const ratingValue = star.getAttribute("data-value");
                ratingValueInput.value = ratingValue;
                updateStarHighlight(ratingValue);
            });
        });
    }

    function updateStarHighlight(val) {
        const stars = starSelector.querySelectorAll(".star-btn");
        stars.forEach(star => {
            const starVal = star.getAttribute("data-value");
            if (parseInt(starVal) <= parseInt(val)) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }
        });
    }

    // Capture submissions (Create & Update operations)
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const email = document.getElementById("review-email").value.trim();
        const rating = parseInt(ratingValueInput.value);
        let photoUrl = document.getElementById("review-photo").value.trim();
        const message = document.getElementById("review-message").value.trim();

        if (!name || isNaN(rating) || !message) {
            showFeedback("Please complete all required fields.", "red");
            return;
        }

        if (!photoUrl) {
            photoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        }

        const now = Date.now();
        const editId = activeEditId.value;

        if (editId) {
            // Update operation
            const reviewRef = ref(db, `reviews/${editId}`);
            const updatePayload = {
                name,
                email,
                rating,
                photoUrl,
                message,
                updatedTimestamp: now
            };

            update(reviewRef, updatePayload)
                .then(() => {
                    showFeedback("Review updated successfully! It will go live after admin approval.", "green");
                    resetForm();
                })
                .catch(err => {
                    showFeedback("Update failed: Approved reviews cannot be modified directly.", "red");
                    console.error(err);
                });
        } else {
            // Create operation
            const reviewsRef = ref(db, "reviews");
            const newReviewRef = push(reviewsRef);
            const reviewId = newReviewRef.key;

            const reviewData = {
                id: reviewId,
                name,
                email,
                photoUrl,
                rating,
                message,
                createdTimestamp: now,
                updatedTimestamp: now,
                verified: false,
                status: "pending"
            };

            update(ref(db, `reviews/${reviewId}`), reviewData)
                .then(() => {
                    showFeedback("Review submitted! It will appear publicly once approved by our moderator.", "green");
                    trackOwnedReview(reviewId);
                    resetForm();
                })
                .catch(err => {
                    showFeedback("Error saving review. Please try again.", "red");
                    console.error(err);
                });
        }
    });

    cancelEditBtn.addEventListener("click", resetForm);

    function trackOwnedReview(id) {
        let list = JSON.parse(localStorage.getItem("my_reviews") || "[]");
        if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem("my_reviews", JSON.stringify(list));
        }
    }

    function isOwnReview(id) {
        let list = JSON.parse(localStorage.getItem("my_reviews") || "[]");
        return list.includes(id);
    }

    function showFeedback(msg, color) {
        formFeedback.innerText = msg;
        formFeedback.style.color = color === "green" ? "var(--success)" : "var(--danger)";
    }

    function resetForm() {
        reviewForm.reset();
        activeEditId.value = "";
        ratingValueInput.value = "";
        formTitle.innerText = "Write a Review";
        submitBtn.innerText = "Submit Review";
        cancelEditBtn.style.display = "none";
        const stars = starSelector.querySelectorAll(".star-btn");
        stars.forEach(s => s.classList.remove("active"));
    }

    // Setup active listeners for incoming live reviews
    const reviewsRef = ref(db, "reviews");
    onValue(reviewsRef, (snapshot) => {
        const rawData = snapshot.val();
        const allReviews = rawData ? Object.values(rawData) : [];
        
        // Split data: Display approved reviews to the public, compute dynamic aggregate statistics
        const approvedReviews = allReviews.filter(r => r.status === "approved" || r.verified === true);
        
        recalculateAndRenderStats(approvedReviews);
        renderPublicReviews(approvedReviews, allReviews);
    });

    function recalculateAndRenderStats(reviews) {
        const total = reviews.length;
        const totalReviewsText = document.getElementById("total-reviews-count");
        const avgRatingText = document.getElementById("avg-rating");
        const avgStarsFill = document.getElementById("avg-stars-fill");
        const statsBarsContainer = document.getElementById("stats-bars-container");

        if (total === 0) {
            avgRatingText.innerText = "0.0";
            avgStarsFill.style.width = "0%";
            totalReviewsText.innerText = "Based on no reviews yet";
            statsBarsContainer.innerHTML = "";
            return;
        }

        let sum = 0;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviews.forEach(r => {
            sum += r.rating;
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });

        const average = (sum / total).toFixed(1);
        avgRatingText.innerText = average;
        avgStarsFill.style.width = `${(average / 5) * 100}%`;
        totalReviewsText.innerText = `Based on ${total} verified ${total === 1 ? 'review' : 'reviews'}`;

        statsBarsContainer.innerHTML = "";
        for (let starCount = 5; starCount >= 1; starCount--) {
            const count = distribution[starCount];
            const pct = ((count / total) * 100).toFixed(0);
            
            const row = document.createElement("div");
            row.classList.add("bar-row");
            row.innerHTML = `
                <span class="bar-label">${starCount} Stars</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-count">${count}</span>
            `;
            statsBarsContainer.appendChild(row);
        }
    }

    function renderPublicReviews(approvedReviews, allReviews) {
        reviewsContainer.innerHTML = "";
        
        if (approvedReviews.length === 0) {
            reviewsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px 0;">Be the first to leave a feedback rating!</p>`;
            return;
        }

        // Sort: newest first
        approvedReviews.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

        approvedReviews.forEach(rev => {
            const card = document.createElement("div");
            card.classList.add("review-card");

            const escapedName = escapeHTML(rev.name);
            const escapedMessage = escapeHTML(rev.message);
            const dateStr = new Date(rev.createdTimestamp).toLocaleString();
            
            let badgeHtml = rev.verified ? `<span class="verified-badge">✔ Verified</span>` : "";
            
            // Check ownership capabilities
            let actionButtonsHtml = "";
            if (isOwnReview(rev.id)) {
                actionButtonsHtml = `
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-small edit-client-btn" data-id="${rev.id}">Edit</button>
                        <button class="btn btn-secondary btn-small delete-client-btn" style="background-color: var(--danger); color: white;" data-id="${rev.id}">Delete</button>
                    </div>
                `;
            }

            let starsStr = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);

            card.innerHTML = `
                <div class="card-header">
                    <div class="user-profile">
                        <img src="${rev.photoUrl}" alt="${escapedName}" class="avatar">
                        <div class="user-meta">
                            <h4>${escapedName} ${badgeHtml}</h4>
                            <span class="date-text">${dateStr}</span>
                        </div>
                    </div>
                </div>
                <div class="card-rating">${starsStr}</div>
                <p class="card-message">${escapedMessage}</p>
                ${actionButtonsHtml}
            `;
            reviewsContainer.appendChild(card);
        });

        attachClientCardActions(allReviews);
    }

    function attachClientCardActions(allReviews) {
        // Edit action
        document.querySelectorAll(".edit-client-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const rId = btn.getAttribute("data-id");
                const matched = allReviews.find(r => r.id === rId);
                if (matched) {
                    document.getElementById("review-name").value = matched.name;
                    document.getElementById("review-email").value = matched.email || "";
                    document.getElementById("review-photo").value = matched.photoUrl || "";
                    ratingValueInput.value = matched.rating;
                    updateStarHighlight(matched.rating);
                    document.getElementById("review-message").value = matched.message;
                    activeEditId.value = matched.id;

                    formTitle.innerText = "Edit Your Review";
                    submitBtn.innerText = "Update Review";
                    cancelEditBtn.style.display = "inline-block";
                    reviewForm.scrollIntoView({ behavior: "smooth" });
                }
            });
        });

        // Delete action
        document.querySelectorAll(".delete-client-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const rId = btn.getAttribute("data-id");
                if (confirm("Are you sure you want to permanently delete your review?")) {
                    remove(ref(db, `reviews/${rId}`))
                        .then(() => {
                            showFeedback("Review deleted successfully.", "green");
                        })
                        .catch(err => {
                            showFeedback("Delete failed. You cannot modify an approved review.", "red");
                            console.error(err);
                        });
                }
            });
        });
    }
});
