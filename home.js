/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.9
 * - Keeps login session in localStorage.
 * - On refresh, shows Welcome page (not auto-launch).
 * - User can launch app or logout manually.
 * - Improved username placeholder text.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const VERSION = "v3.9";
console.log(`🔐 AquaEarth Secure Login ${VERSION}`);

const firebaseConfig = {
  apiKey: "AIzaSyCQaPz_Ph1xEKQP6rb6FlRY7haL9_ns8wk",
  authDomain: "aqua-earth-b2da7.firebaseapp.com",
  projectId: "aqua-earth-b2da7",
  storageBucket: "aqua-earth-b2da7.firebasestorage.app",
  messagingSenderId: "794773574573",
  appId: "1:794773574573:web:966db3e78218ea69b40724"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STORAGE_KEY = "aquaearth_session";
let currentUser = null;
let currentDocId = null;
let currentAppHtml = null;

// Restore session if exists
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      currentUser = data.user;
      currentDocId = data.docId;
      currentAppHtml = data.appHtml;

      // Skip login → show welcome page
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("welcomeMsg").textContent = `Welcome, ${currentUser}`;
      document.getElementById("welcomeDiv").style.display = "block";
    } catch (err) {
      console.warn("Invalid session data, clearing...");
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});

// Login handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let username = document.getElementById("username").value.trim().toLowerCase();
  const accessCode = document.getElementById("accessCode").value;

  try {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return alert("User not found.");
    if (userSnap.data().accessCode !== accessCode) return alert("Incorrect access code.");

    const formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

    // Create log ID
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
    const docId = `${username}_${mmddyy}_${hhmm}`;

    await setDoc(doc(collection(db, "login_logs"), docId), {
      username: formattedUser,
      timestamp: serverTimestamp(),
      status: "login success – welcome page",
      userAgent: navigator.userAgent
    });

    currentUser = formattedUser;
    currentDocId = docId;
    currentAppHtml = userSnap.data().app;

    // Save session
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: currentUser,
      docId: currentDocId,
      appHtml: currentAppHtml
    }));

    // Show welcome
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("welcomeMsg").textContent = `Welcome, ${formattedUser}`;
    document.getElementById("welcomeDiv").style.display = "block";

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
});

// Launch
document.getElementById("launchBtn").addEventListener("click", async () => {
  if (!currentAppHtml) return alert("No app code found for this user.");

  const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
  if (!ok) return alert("Loading AquaEarth has been cancelled!");

  if (/^https?:\/\//i.test(currentAppHtml.trim())) {
    window.open(currentAppHtml.trim(), "_blank");
  } else {
    document.open();
    document.write(currentAppHtml);
    document.close();
  }

  if (currentDocId && currentUser) {
    await setDoc(doc(db, "login_logs", currentDocId), {
      username: currentUser,
      timestamp: serverTimestamp(),
      status: "agreed and launched AquaEarth app",
      userAgent: navigator.userAgent
    });
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  currentUser = null;
  currentDocId = null;
  currentAppHtml = null;
  document.getElementById("welcomeDiv").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});
