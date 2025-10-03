/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.5
 * - Kept user logged in until logout is pressed.
 * - On refresh, reloads resource automatically.
 * - Added Logout button.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const VERSION = "v3.5";
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

// Restore session and auto-launch
window.addEventListener("DOMContentLoaded", () => {
  const session = localStorage.getItem(STORAGE_KEY);
  if (session) {
    const { username, appHtml, docId } = JSON.parse(session);
    console.log(`⚡ Auto-launching app for ${username}...`);
    launchApp(appHtml, docId, username);
  }
});

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

    const formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

    // Log ID
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
    const docId = `${username}_${mmddyy}_${hhmm}`;

    await setDoc(doc(collection(db, "login_logs"), docId), {
      username: formattedUser,
      timestamp: serverTimestamp(),
      status: "login success – auto-launch",
      userAgent: navigator.userAgent
    });

    const appHtml = userSnap.data().app;

    // Save session
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: formattedUser, docId, appHtml }));

    // Launch immediately
    launchApp(appHtml, docId, formattedUser);

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
});

async function launchApp(appHtml, docId, username) {
  if (!appHtml) {
    alert("No app code found for this user.");
    return;
  }

  if (/^https?:\/\//i.test(appHtml.trim())) {
    window.open(appHtml.trim(), "_blank");
  } else {
    document.open();
    document.write(appHtml);
    document.close();
  }

  if (docId && username) {
    await setDoc(doc(db, "login_logs", docId), {
      username,
      timestamp: serverTimestamp(),
      status: "auto-launched AquaEarth app",
      userAgent: navigator.userAgent
    });
  }
}
