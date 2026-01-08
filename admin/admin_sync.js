import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// ⚠️ IMPORTANT: REPLACE THIS WITH THE EXACT CONFIG USED IN YOUR ANDROID APP
const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "britium-express.firebaseapp.com",
    databaseURL: "https://britium-express-default-rtdb.firebaseio.com",
    projectId: "britium-express",
    storageBucket: "britium-express.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// FUNCTION: Listen for All Shipment Activities
export function loadLiveShipments(tableBodyId) {
    const shipmentsRef = ref(db, 'shipments');
    
    // onValue runs EVERY TIME the App changes data. Real-time sync.
    onValue(shipmentsRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = ""; // Clear current list

        if (data) {
            Object.keys(data).forEach((key) => {
                const shipment = data[key];
                
                // Create Table Row
                const row = `
                    <tr>
                        <td class="fw-bold text-primary">${key}</td>
                        <td>${shipment.sender}</td>
                        <td>${shipment.receiver}</td>
                        <td>
                            <span class="badge ${getStatusBadge(shipment.status)}">
                                ${shipment.status}
                            </span>
                        </td>
                        <td>${shipment.driver_id ? shipment.driver_id : '<span class="text-muted">Unassigned</span>'}</td>
                        <td>${new Date(shipment.timestamp).toLocaleDateString()}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No active shipments found in App.</td></tr>';
        }
    });
}

// Helper for Badge Colors
function getStatusBadge(status) {
    if(status === 'Delivered') return 'bg-success';
    if(status === 'Pending') return 'bg-warning text-dark';
    if(status === 'Cancelled') return 'bg-danger';
    return 'bg-primary';
}
