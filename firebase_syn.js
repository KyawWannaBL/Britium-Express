/* ==========================================================
 * FIREBASE SYNCHRONIZATION MODULE
 * Connects the Website to the same DB as the Mobile App
 * ========================================================== */

// 1. Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// 2. CONFIGURATION
// ⚠️ IMPORTANT: These keys MUST match the ones used in your Android App source code (google-services.json).
// Go to Firebase Console -> Project Settings -> General -> Your Apps (Web) to get these.
const firebaseConfig = {
    apiKey: "AIzaSy...",          // REPLACE WITH YOUR ACTUAL KEY
    authDomain: "britium-express.firebaseapp.com",
    databaseURL: "https://britium-express-default-rtdb.firebaseio.com",
    projectId: "britium-express",
    storageBucket: "britium-express.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ==========================================================
 * FUNCTION 1: TRACK A SHIPMENT (READ)
 * Used in: tracking.html
 * Syncs: App Driver updates status -> Website shows status
 * ========================================================== */
export function trackShipment(trackingID, callback) {
    const dbRef = ref(db);
    
    // Looks for data at: /shipments/BE-89744
    get(child(dbRef, `shipments/${trackingID}`)).then((snapshot) => {
        if (snapshot.exists()) {
            // Data found! Pass it back to the website to display
            callback(true, snapshot.val());
        } else {
            // No data found
            callback(false, null);
        }
    }).catch((error) => {
        console.error(error);
        callback(false, null);
    });
}

/* ==========================================================
 * FUNCTION 2: CREATE SHIPMENT (WRITE)
 * Used in: admin/shipments.html or register_seller.html
 * Syncs: Website creates order -> App Driver sees it
 * ========================================================== */
export function createShipment(trackingID, data) {
    set(ref(db, 'shipments/' + trackingID), {
        sender: data.sender,
        receiver: data.receiver,
        from_city: data.from_city,
        to_city: data.to_city,
        status: "Pending Pickup", // Initial status
        timestamp: new Date().toISOString(),
        driver_id: "", // Empty until assigned
        price: data.price
    })
    .then(() => {
        alert("Shipment Created! It should now appear in the App.");
    })
    .catch((error) => {
        alert("Error syncing: " + error.message);
    });
}

/* ==========================================================
 * FUNCTION 3: LIVE DRIVER TRACKING (REAL-TIME LISTENER)
 * Used in: tracking.html (Map)
 * Syncs: Driver moves -> Website map moves instantly
 * ========================================================== */
export function listenToDriverLocation(driverID, updateMapCallback) {
    const driverRef = ref(db, 'drivers/' + driverID + '/location');
    
    onValue(driverRef, (snapshot) => {
        const location = snapshot.val();
        if (location) {
            // Update the Google Map marker on the website automatically
            updateMapCallback(location.lat, location.lng);
        }
    });
}
