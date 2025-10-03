/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.9
 * - Reverted: NO auto-launch after refresh.
 * - On refresh with session, show Welcome + Launch/Logout (manual launch only).
 * - Kept session persistence until explicit logout.
 * - Launch opens in a new window (URL or inline HTML via Blob).
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

const STORAGE_KEY = "aquaSession";

let _appHtml = null;
let _docId = null;
let _formattedUser = null;

// Reusable launcher (manual, from button)
async function launchApp(appHtml, docId, username) {
  if (!appHtml) {
    alert("No app code found for this user.");
    return;
  }
  const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
  if (!ok) {
    alert("Launch cancelled.");
    return;
  }

  // Open in new tab/window
  if (/^https?:\/\//i.test(appHtml.trim())) {
    window.open(appHtml.trim(), "_blank");
  } else {
    const blob = new Blob([appHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=1200,height=800,resizable=yes,scrollbars=yes");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  if (docId && username) {
    await setDoc(doc(db, "login_logs", docId), {
      username,
      timestamp: serverTimestamp(),
      status: "agreed and launched AquaEarth app (manual)",
      userAgent: navigator.userAgent
    });
  }
}

// Restore session (NO auto-launch)
window.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem(STORAGE_KEY);
  if (!sessionRaw) return;

  try {
    const session = JSON.parse(sessionRaw);
    if (session && session.username && session.appHtml) {
      _formattedUser = session.username;
      _appHtml = session.appHtml;
      _docId = session.docId;

      // Show welcome; do NOT auto-launch
      document.getElementById("loginForm").style.display = "none";
      const help = document.getElementById("helpNote");
      if (help) help.style.display = "none";
      document.getElementById("welcomeDiv").style.display = "block";
      document.getElementById("welcomeMsg").textContent = `Welcome, ${_formattedUser}`;

      // Wire buttons on restore
      document.getElementById("launchBtn").onclick = () => launchApp(_appHtml, _docId, _formattedUser);
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      };
    }
  } catch {
    // Bad session data; clear it
    localStorage.removeItem(STORAGE_KEY);
  }
});

// Login flow
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let username = document.getElementById("username").value.trim().toLowerCase();
  const accessCode = document.getElementById("accessCode").value;

  try {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User not found.");
      return;
    }
    const storedCode = userSnap.data().accessCode;
    if (storedCode !== accessCode) {
      alert("Incorrect access code.");
      return;
    }

    _formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

    // Build log id
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
    _docId = `${username}_${mmddyy}_${hhmm}`;

    await setDoc(doc(collection(db, "login_logs"), _docId), {
      username: _formattedUser,
      timestamp: serverTimestamp(),
      status: "login success – awaiting launch",
      userAgent: navigator.userAgent
    });

    _appHtml = userSnap.data().app;

    // Persist session
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      username: _formattedUser,
      docId: _docId,
      appHtml: _appHtml
    }));

    // Switch UI (manual launch)
    document.getElementById("loginForm").style.display = "none";
    const help = document.getElementById("helpNote");
    if (help) help.style.display = "none";
    document.getElementById("welcomeDiv").style.display = "block";
    document.getElementById("welcomeMsg").textContent = `Welcome, ${_formattedUser}`;

    // Wire buttons
    document.getElementById("launchBtn").onclick = () => launchApp(_appHtml, _docId, _formattedUser);
    document.getElementById("logoutBtn").onclick = () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    };

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
});
