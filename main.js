/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.4
 * - Welcome page after login with “Launch AquaEarth” button.
 * - Legal agreement prompt runs only at Launch.
 * - If declined, app does not load.
 * - No session persistence (user must log in again after refresh).
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const VERSION = "v3.4";
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

let currentUser = null;
let currentDocId = null;
let currentAppHtml = null;

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

    // Create unique log ID
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

    // Switch to welcome view
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("welcomeMsg").textContent = `Welcome, ${formattedUser}`;
    document.getElementById("welcomeDiv").style.display = "block";

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
});

document.getElementById("launchBtn").addEventListener("click", async () => {
  if (!currentAppHtml) {
    alert("No app code found for this user.");
    return;
  }

  const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
  if (!ok) {
    alert("Loading AquaEarth has been cancelled!");
    return;
  }

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

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  currentDocId = null;
  currentAppHtml = null;
  document.getElementById("welcomeDiv").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});
