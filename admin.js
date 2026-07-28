// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA44Ou2bM7l7m-oay-pwv-4tdmn_S0f0BM",
  authDomain: "mamraj-web-studio-1d78b.firebaseapp.com",
  projectId: "mamraj-web-studio-1d78b",
  storageBucket: "mamraj-web-studio-1d78b.firebasestorage.app",
  messagingSenderId: "229677264871",
  appId: "1:229677264871:web:cc3937a5733868e31c5742",
  measurementId: "G-DSK1EM5RKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// DOM Selection
const liveUsersEl = document.getElementById('live-users');
const totalUniqueEl = document.getElementById('total-unique');
const totalViewsEl = document.getElementById('total-views');
const returningRateEl = document.getElementById('returning-rate');

let deviceChart, browserChart;

// 1. Live Users Listener (Presence count)
onValue(ref(db, 'status'), (snapshot) => {
  const liveCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  liveUsersEl.textContent = liveCount;
});

// 2. Pageviews Count Listener
onValue(ref(db, 'pageviews'), (snapshot) => {
  const totalViews = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  totalViewsEl.textContent = totalViews;
});

// 3. Visitors Profile and Devices/Browsers Chart Update
onValue(ref(db, 'visitors'), (snapshot) => {
  if (!snapshot.exists()) return;
  
  const visitors = snapshot.val();
  const visitorList = Object.values(visitors);
  
  const totalUnique = visitorList.length;
  const returningCount = visitorList.filter(v => v.visitCount > 1).length;
  const returningRate = totalUnique > 0 ? Math.round((returningCount / totalUnique) * 100) : 0;

  totalUniqueEl.textContent = totalUnique;
  returningRateEl.textContent = `${returningRate}%`;

  // Draw or refresh graphs
  updateDeviceChart(visitorList);
  updateBrowserChart(visitorList);
});

// Helper to update Device Doughnut Chart
function updateDeviceChart(visitors) {
  const devices = { Mobile: 0, Desktop: 0 };
  visitors.forEach(v => {
    const type = v.device === 'Mobile' ? 'Mobile' : 'Desktop';
    devices[type]++;
  });

  if (deviceChart) {
    deviceChart.data.datasets[0].data = [devices.Desktop, devices.Mobile];
    deviceChart.update();
  } else {
    const ctx = document.getElementById('deviceChart').getContext('2d');
    deviceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Desktop', 'Mobile'],
        datasets: [{
          data: [devices.Desktop, devices.Mobile],
          backgroundColor: ['#3498db', '#e74c3c']
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Devices Used' } }
      }
    });
  }
}

// Helper to update Browser Bar Chart
function updateBrowserChart(visitors) {
  const browsers = {};
  visitors.forEach(v => {
    const name = v.browser || 'Unknown';
    browsers[name] = (browsers[name] || 0) + 1;
  });

  const labels = Object.keys(browsers);
  const data = Object.values(browsers);

  if (browserChart) {
    browserChart.data.labels = labels;
    browserChart.data.datasets[0].data = data;
    browserChart.update();
  } else {
    const ctx = document.getElementById('browserChart').getContext('2d');
    browserChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Visitor Volume',
          data: data,
          backgroundColor: '#2ecc71'
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Browsers Used' } }
      }
    });
  }
}
