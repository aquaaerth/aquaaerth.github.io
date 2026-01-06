/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.11
 * - Keeps login session in localStorage.
 * - Enforces 10-hour session limit.
 * - VERSION CHECK: Expires session if server version differs from stored version.
 * - Displays countdown timer.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// UPDATED VERSION
const VERSION = "v3.12"; 
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

// --- SECURITY CONFIGURATION ---
// 10 hours in milliseconds
const SESSION_DURATION_MS = 10 * 60 * 60 * 1000; 

let currentUser = null;
let currentDocId = null;
let currentAppHtml = null;
let timerInterval = null;

// --- Helper: Format Milliseconds to HH:MM:SS ---
function formatTimeRemaining(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// --- Helper: Start Countdown Timer ---
function startSessionTimer(loginTimestamp) {
  const timerEl = document.getElementById("sessionTimer");
  
  if (timerInterval) clearInterval(timerInterval);

  const updateTimer = () => {
    const now = Date.now();
    const expiresAt = loginTimestamp + SESSION_DURATION_MS;
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (timerEl) timerEl.textContent = "Session Expired";
      forceLogout(); 
    } else {
      if (timerEl) timerEl.textContent = `Session expires in: ${formatTimeRemaining(remaining)}`;
    }
  };

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// --- Helper: Force Logout ---
function forceLogout() {
  localStorage.removeItem(STORAGE_KEY);
  currentUser = null;
  currentDocId = null;
  currentAppHtml = null;
  
  if (timerInterval) clearInterval(timerInterval);
  
  document.getElementById("welcomeDiv").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

// --- RESTORE SESSION HANDLER ---
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = Date.now();

      // 1. CHECK VERSION
      // If the stored version is strictly not equal to current VERSION,
      // or if it doesn't exist (old session), logout immediately.
      if (data.version !== VERSION) {
        console.log(`Version mismatch (Stored: ${data.version} vs Current: ${VERSION}). Expiring session.`);
        forceLogout();
        return;
      }

      // 2. CHECK TIME LIMIT
      if (!data.loginTime || (now - data.loginTime > SESSION_DURATION_MS)) {
        console.log("Session expired (10h limit). Clearing storage.");
        forceLogout();
        return; 
      }

      // Restore State
      currentUser = data.user;
      currentDocId = data.docId;
      currentAppHtml = data.appHtml;

      startSessionTimer(data.loginTime);

      document.getElementById("loginForm").style.display = "none";
      document.getElementById("welcomeMsg").textContent = `Welcome, ${currentUser}`;
      document.getElementById("welcomeDiv").style.display = "block";
    } catch (err) {
      console.warn("Invalid session data, clearing...");
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});

// --- LOGIN HANDLER ---
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
    const loginTime = Date.now();

    // SAVE SESSION (Now includes 'version')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: currentUser,
      docId: currentDocId,
      appHtml: currentAppHtml,
      loginTime: loginTime,
      version: VERSION // <--- Added this to track version
    }));

    startSessionTimer(loginTime);

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
  forceLogout();
});