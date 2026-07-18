const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

console.log("Firebase connected successfully");

// =====================================
// TOTAL WEBSITE VISITS
// =====================================

const totalVisitsElement = document.getElementById("total-visits");

const visitsRef = database.ref("websiteStats/totalVisits");

// Count only once per browser session
if (!sessionStorage.getItem("mamrajVisitCounted")) {

    visitsRef.transaction((currentVisits) => {

        return (currentVisits || 0) + 1;

    }).then(() => {

        sessionStorage.setItem("mamrajVisitCounted", "true");

    }).catch((error) => {

        console.error("Visitor count error:", error);

    });

}

// Show live total visits
visitsRef.on("value", (snapshot) => {

    const totalVisits = snapshot.val() || 0;

    if (totalVisitsElement) {
        totalVisitsElement.textContent = totalVisits.toLocaleString();
    }

});
