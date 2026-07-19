import { db, ref, update, remove, onValue } from "./script.js";

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("admin-table-body");
    const searchInput = document.getElementById("admin-search");
    const filterStatus = document.getElementById("filter-status");
    const filterRating = document.getElementById("filter-rating");
    const sortBy = document.getElementById("sort-by");

    let allReviews = [];

    // Realtime retrieval of all review entries
    const reviewsRef = ref(db, "reviews");
    onValue(reviewsRef, (snapshot) => {
        const rawData = snapshot.val();
        allReviews = rawData ? Object.values(rawData) : [];
        applyFiltersAndRender();
    });

    // Control listeners
    searchInput.addEventListener("input", applyFiltersAndRender);
    filterStatus.addEventListener("change", applyFiltersAndRender);
    filterRating.addEventListener("change", applyFiltersAndRender);
    sortBy.addEventListener("change", applyFiltersAndRender);

    function applyFiltersAndRender() {
        const query = searchNo response
