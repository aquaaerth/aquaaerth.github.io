/**
 * AquaEarth Secure Login – home.js
 * v3.5
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let _appHtml = null;
let _docId = null;
let _formattedUser = null;

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  let username = document.getElementById('username').value.trim().toLowerCase();
  const accessCode = document.getElementById('accessCode').value;

  try {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const storedCode = userSnap.data().accessCode;
      if (storedCode === accessCode) {
        _formattedUser = username.charAt(0).toUpperCase() + username.slice(1);
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
        const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
        const id = `${mmddyy}_${hhmm}`;
        _docId = `${username}_${id}`;

        await setDoc(doc(collection(db, "login_logs"), _docId), {
          username: _formattedUser,
          timestamp: serverTimestamp(),
          status: "login success – awaiting launch",
          userAgent: navigator.userAgent
        });

        _appHtml = userSnap.data().app;

        // Switch UI
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("welcomeDiv").style.display = "block";
        document.getElementById("welcomeMsg").textContent = `Welcome, ${_formattedUser}`;
      } else {
        alert("Incorrect access code.");
      }
    } else {
      alert("User not found.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
});

// Launch button with legal confirm
document.getElementById("launchBtn").addEventListener("click", async () => {
  if (!_appHtml) return;
  const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
  if (ok) {
    if (/^https?:\/\//i.test(_appHtml.trim())) {
      // Open external URL in new tab
      window.open(_appHtml.trim(), "_blank");
    } else {
      // Open HTML in a new window using Blob
      const blob = new Blob([_appHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const popup = window.open(url, "_blank", "width=1200,height=800,resizable=yes,scrollbars=yes");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    await setDoc(doc(db, "login_logs", _docId), {
      username: _formattedUser,
      timestamp: serverTimestamp(),
      status: "agreed and launched AquaEarth app (new window)",
      userAgent: navigator.userAgent
    });
  } else {
    alert("Launch cancelled.");
  }
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
  location.reload();
});
