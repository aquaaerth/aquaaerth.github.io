    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, doc, setDoc, getDoc,collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const script = document.createElement("script");
script.src = "https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js";
script.async = false; // preserves execution order if needed
document.head.appendChild(script);



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
         
            //alert("Login successful!");

            // Log successful login
        // Create a custom ID for the document
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');   
const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
const mmddyy = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}`;
const id = `${mmddyy}_${hhmm}`;
const docId = `${username}_${id}`;

// Set the document with a specific ID
await setDoc(doc(collection(db, "login_logs"), docId), {
  username: username,
  timestamp: serverTimestamp(),
  status: "success accessing AquaEarth page",
  userAgent: navigator.userAgent
});
//await addDoc(collection(db, "login_logs"), {
//    username: username,
//    timestamp: serverTimestamp(),
//    status: "success accessing AquaEarth page",
//    userAgent: navigator.userAgent
//  });
            const myHTML = "'" + userSnap.data().app + "'";
            createAndOpenHTML(myHTML);
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
    
  function createAndOpenHTML(htmlContent) {
    document.body.innerHTML = "";
  document.write("");
  document.write(htmlContent);
}
