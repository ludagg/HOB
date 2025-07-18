import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fonction pour récupérer la configuration Firebase
async function getFirebaseConfig() {
    const response = await fetch('/firebase-config');
    return await response.json();
}

// Initialiser Firebase
let app, auth, db;
getFirebaseConfig().then(firebaseConfig => {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    createTestCandidate();
});

async function createTestCandidate() {
    const email = "candidate-test@example.com";
    const password = "password123";
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "candidate",
            fullName: "Test Candidate",
            location: "Douala, Cameroon"
        });
        console.log("Test candidate created successfully:", user.uid);
    } catch (error) {
        console.error("Error creating test candidate:", error);
    }
}
