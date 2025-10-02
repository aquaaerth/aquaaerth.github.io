/**
 * AquaEarth Secure Login (Firestore HTML/URL Loader with Agreement)
 *
 * v2.4
 * - If Firestore app field is a URL:
 *   - Mobile → use InitLoad() to open Google Earth link
 *   - Desktop → open fullscreen popup window
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

        const formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
        const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
        const docId = `${username}_${mmddyy}_${hhmm}`;

        await setDoc(doc(collection(db, "login_logs"), docId), {
          username: formattedUser,
          timestamp: serverTimestamp(),
          status: "success login, awaiting agreement",
          userAgent: navigator.userAgent
        });

        const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
        if (ok) {
          const appHtml = userSnap.data().app;
          if (appHtml) {
            if (/^https?:\/\//i.test(appHtml.trim())) {
              // 🚀 URL case
              window.GoogleEarthURL = appHtml.trim();
              if (isMobileDevice()) {
                InitLoad(); // open directly on mobile
              } else {
                openFullscreenUrl(appHtml.trim()); // desktop fullscreen
              }
            } else {
              // 🚀 Inline HTML case
              document.open();
              document.write(appHtml);
              document.close();
            }

            await setDoc(doc(db, "login_logs", docId), {
              username: formattedUser,
              timestamp: serverTimestamp(),
              status: "agreed and accessed AquaEarth app",
              userAgent: navigator.userAgent
            });
          } else {
            alert("No app code found for this user.");
          }
        } else {
          alert("Loading Aqua-Earth has been cancelled!");
        }

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

// 🔳 Mobile function
function InitLoad() {
  var link = document.createElement("a");
  link.href = window.GoogleEarthURL;
  link.target = "_blank";
  link.click();
}

// 🔳 Desktop popup
function openFullscreenUrl(url) {
  const features = `
    top=0,left=0,
    width=${screen.availWidth},
    height=${screen.availHeight},
    fullscreen=yes,
    toolbar=no,
    menubar=no,
    location=no,
    status=no,
    scrollbars=yes,
    resizable=yes
  `.replace(/\s+/g, '');

  const win = window.open(url, "_blank", features);
  if (!win) {
    alert("Popup was blocked. Please allow popups for this site.");
  }
}

// 🔳 Detect mobile
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
