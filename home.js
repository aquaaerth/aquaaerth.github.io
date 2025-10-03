/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v3.8
 * - Added launchApp() reusable function.
 * - On refresh, if user is logged in, app auto-launches immediately.
 * - Reused launch logic across both manual button click and auto-restore.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const VERSION = "v3.8";
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

/**
 * Launch AquaEarth resource
 */
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

  // Log access
  if (docId && username) {
    await setDoc(doc(db, "login_logs", docId), {
      username,
      timestamp: serverTimestamp(),
      status: "agreed and accessed AquaEarth app (auto-launch or manual)",
      userAgent: navigator.userAgent
    });
  }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let username = document.getElementById("username").value.trim().toLowerCase();
  const accessCode = document.getElementById("accessCode").value;

  try {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const storedCode = userSnap.data().accessCode;
      if (storedCode === accessCode) {
        const formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
        const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
        const id = `${mmddyy}_${hhmm}`;
        const docId = `${username}_${id}`;

        await setDoc(doc(collection(db, "login_logs"), docId), {
          username: formattedUser,
          timestamp: serverTimestamp(),
          status: "success login, awaiting agreement",
          userAgent: navigator.userAgent
        });

        // Hide login form and show welcome
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("welcomeDiv").style.display = "block";
        document.getElementById("welcomeMsg").innerText = `Welcome, ${formattedUser}`;

        const appHtml = userSnap.data().app;

        // Setup Launch button
        document.getElementById("launchBtn").onclick = async () => {
          const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
          if (ok) {
            await launchApp(appHtml, docId, formattedUser);
          } else {
            alert("Loading Aqua-Earth has been cancelled!");
          }
        };

        // Setup Logout button
        document.getElementById("logoutBtn").onclick = () => {
          localStorage.removeItem("aquaUser");
          location.reload();
        };

        // Save session
        localStorage.setItem("aquaUser", JSON.stringify({
          username: formattedUser,
          app: appHtml,
          docId
        }));

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

// Auto-launch after refresh if logged in
window.addEventListener("load", async () => {
  const session = localStorage.getItem("aquaUser");
  if (session) {
    const { username, app, docId } = JSON.parse(session);
    console.log(`⚡ Auto-launching app for ${username}...`);
    await launchApp(app, docId, username);
  }
});
