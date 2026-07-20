import { db, auth, ref, update, remove, onValue, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./script.js";

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const loginModal = document.getElementById("admin-login-modal");
    const dashboard = document.getElementById("admin-dashboard");
    const loginForm = document.getElementById("admin-login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const errorMsg = document.getElementById("login-error-msg");

    const tableBody = document.getElementById("admin-reviews-body");
    const searchInput = document.getElementById("admin-search");
    const filterStatus = document.getElementById("filter-status");
    const filterRating = document.getElementById("filter-rating");
    const sortBy = document.getElementById("filter-sort");

    let allReviews = [];

    // ==========================================
    // 1. FIREBASE AUTHENTICATION (LOGIN / LOGOUT)
    // ==========================================
    
    // Check if user is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Admin Logged In -> Show Dashboard
            if(loginModal) loginModal.style.display = "none";
            if(dashboard) dashboard.style.display = "block";
            fetchRealtimeReviews();
        } else {
            // Admin Logged Out -> Show Login Modal
            if(loginModal) loginModal.style.display = "flex";
            if(dashboard) dashboard.style.display = "none";
        }
    });

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("admin-email").value.trim();
            const password = document.getElementById("admin-password").value.trim();

            try {
                await signInWithEmailAndPassword(auth, email, password);
                if (errorMsg) errorMsg.style.display = "none";
                loginForm.reset();
            } catch (error) {
                if (errorMsg) {
                    errorMsg.innerText = "Invalid Admin Credentials";
                    errorMsg.style.display = "block";
                }
            }
        });
    }

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth);
        });
    }

    // ==========================================
    // 2. REALTIME DATABASE RETRIEVAL & FILTERING
    // ==========================================
    
    function fetchRealtimeReviews() {
        const reviewsRef = ref(db, "reviews");
        onValue(reviewsRef, (snapshot) => {
            const rawData = snapshot.val();
            allReviews = rawData ? Object.keys(rawData).map(key => ({ id: key, ...rawData[key] })) : [];
            applyFiltersAndRender();
        });
    }

    // Control listeners
    if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
    if (filterStatus) filterStatus.addEventListener("change", applyFiltersAndRender);
    if (filterRating) filterRating.addEventListener("change", applyFiltersAndRender);
    if (sortBy) sortBy.addEventListener("change", applyFiltersAndRender);

    function applyFiltersAndRender() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const statusVal = filterStatus ? filterStatus.value : 'all';
        const ratingVal = filterRating ? filterRating.value : 'all';
        const sortVal = sortBy ? sortBy.value : 'newest';

        let filtered = allReviews.filter(item => {
            // Search Query Filter
            const matchesQuery = !query || 
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.email && item.email.toLowerCase().includes(query)) ||
                (item.review && item.review.toLowerCase().includes(query));

            // Status Filter
            const matchesStatus = (statusVal === 'all') || (item.status === statusVal);

            // Rating Filter
            const matchesRating = (ratingVal === 'all') || (String(item.rating) === String(ratingVal));

            return matchesQuery && matchesStatus && matchesRating;
        });

        // Sorting
        filtered.sort((a, b) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return sortVal === 'newest' ? timeB - timeA : timeA - timeB;
        });

        renderTable(filtered);
    }

    // Render Table Rows
    function renderTable(reviews) {
        if (!tableBody) return;

        if (reviews.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No reviews found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = reviews.map(item => `
            <tr>
                <td>
                    <strong>${escapeHTML(item.name || 'Anonymous')}</strong><br>
                    <small style="color:#666;">${escapeHTML(item.email || 'N/A')}</small>
                </td>
                <td><span style="color: #f1c40f;">★</span> ${item.rating || 5}</td>
                <td>${escapeHTML(item.review || '')}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size:12px; font-weight:600; 
                        background: ${item.status === 'approved' ? '#d4edda' : item.status === 'rejected' ? '#f8d7da' : '#fff3cd'};
                        color: ${item.status === 'approved' ? '#155724' : item.status === 'rejected' ? '#721c24' : '#856404'};">
                        ${(item.status || 'pending').toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-approve" data-id="${item.id}"><i class="fa-solid fa-check"></i></button>
                        <button class="btn-reject" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
                        <button class="btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        attachActionEvents();
    }

    // ==========================================
    // 3. ACTIONS (APPROVE, REJECT, DELETE)
    // ==========================================
    function attachActionEvents() {
        document.querySelectorAll(".btn-approve").forEach(btn => {
            btn.addEventListener("click", (e) => updateReviewStatus(e.currentTarget.dataset.id, "approved"));
        });

        document.querySelectorAll(".btn-reject").forEach(btn => {
            btn.addEventListener("click", (e) => updateReviewStatus(e.currentTarget.dataset.id, "rejected"));
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => deleteReview(e.currentTarget.dataset.id));
        });
    }

    async function updateReviewStatus(id, newStatus) {
        if (!id) return;
        try {
            await update(ref(db, `reviews/${id}`), { status: newStatus });
        } catch (err) {
            alert("Error updating status: " + err.message);
        }
    }

    async function deleteReview(id) {
        if (!id) return;
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                await remove(ref(db, `reviews/${id}`));
            } catch (err) {
                alert("Error deleting review: " + err.message);
            }
        }
    }
});
