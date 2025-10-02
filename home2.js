/**
 * AquaEarth Secure Login (Firestore HTML Loader with Agreement)
 *
 * v2.2
 * - Added support for Firestore "app" field being a URL or raw HTML.
 * - If string looks like a URL (starts with http/https), redirect instead of writing HTML.
 * - Preserves legal agreement prompt.
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
  var username = document.getElementById('username').value.trim();
  const accessCode = document.getElementById('accessCode').value;
  username = username.toLowerCase();

  try {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const storedCode = userSnap.data().accessCode;
      if (storedCode === accessCode) {
        
        // ✅ Capitalize first letter for logs
        const formattedUser = username.charAt(0).toUpperCase() + username.slice(1);

        // ✅ Log successful login
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
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

        // ✅ Legal prompt before loading app
        const ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
        if (ok) {
          const appHtml = userSnap.data().app;
          if (appHtml) {
            // 🔍 Check if it's a URL
          if (/^https?:\/\//i.test(appHtml.trim())) {
  window.location.href = appHtml.trim(); // redirect to URL
} else {
  document.open();
  document.write(appHtml);
  document.close();
}

            // Update log to reflect acceptance
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
