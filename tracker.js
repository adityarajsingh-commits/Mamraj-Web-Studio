import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, onDisconnect, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    projectId: "mamraj-web-studio-1d78b",
    databaseURL: "https://mamraj-web-studio-1d78b-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1. Unique Visitor Determination
let visitorId = localStorage.getItem("mamraj_visitor_id");
let isReturning = true;

if (!visitorId) {
    visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("mamraj_visitor_id", visitorId);
    isReturning = false;
}

// Helper to detect Device and Browser
function getDeviceAndBrowser() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let device = "Desktop";

    if (/Mobi|Android|iPhone/i.test(ua)) device = "Mobile";
    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";

    return { device, browser };
}

// 2. Main Analytics Logging
async function logVisit() {
    const { device, browser } = getDeviceAndBrowser();
    let country = "Unknown";

    // Grab public geolocation without APIs requiring payment keys
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data && data.country_name) country = data.country_name;
    } catch (e) {
        console.warn("Geolocation service unavailable, falling back to Unknown.");
    }

    const visitorRef = ref(db, `visitors/${visitorId}`);
    
    // Save or update visitor metadata
    onValue(visitorRef, (snapshot) => {
        const data = snapshot.val();
        const now = Date.now();
        
        if (!data) {
            // First time visitor
            set(visitorRef, {
                firstVisited: now,
                lastVisited: now,
                country,
                device,
                browser,
                pageviews: 1,
                isReturning: false
            });
        } else {
            // Returning visitor updates
            update(visitorRef, {
                lastVisited: now,
                pageviews: (data.pageviews || 0) + 1,
                isReturning: true
            });
        }
    }, { onlyOnce: true });

    // Increment overall page views globally via transactional operation
    const globalPvRef = ref(db, "globalStats/totalPageViews");
    runTransaction(globalPvRef, (currentPv) => (currentPv || 0) + 1);

    // 3. Live Presence Tracking System
    const presenceRef = ref(db, `status/${visitorId}`);
    const connectedRef = ref(db, ".info/connected");

    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            // Set offline status on disconnection
            onDisconnect(presenceRef).set({
                state: "offline",
                lastActive: serverTimestamp()
            });
            // Mark online status immediately
            set(presenceRef, {
                state: "online",
                lastActive: serverTimestamp()
            });
        }
    });
}

logVisit();
