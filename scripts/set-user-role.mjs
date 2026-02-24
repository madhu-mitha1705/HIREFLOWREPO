import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, updateDoc, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAp4DuGQbARwiNgjh3l_0Fp38lCCCQPDYw",
  authDomain: "hireflow-33f2e.firebaseapp.com",
  projectId: "hireflow-33f2e",
  storageBucket: "hireflow-33f2e.firebasestorage.app",
  messagingSenderId: "832971842392",
  appId: "1:832971842392:android:2f99c5e68d9c4fdd11fb2d",
  databaseURL: "https://hireflow-33f2e.firebaseio.com",
};

const allowedRoles = new Set(["admin", "recruiter", "candidate"]);

function usage() {
  console.log(
    "Usage:\n" +
      "  npm run set-role -- <adminEmail> <adminPassword> <targetEmail> <targetRole>\n\n" +
      "Example:\n" +
      "  npm run set-role -- owner@mail.com secret123 recruiter@mail.com recruiter"
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 4) {
    usage();
    process.exit(1);
  }

  const [adminEmailRaw, adminPassword, targetEmailRaw, targetRoleRaw] = args;
  const adminEmail = String(adminEmailRaw || "").trim().toLowerCase();
  const targetEmail = String(targetEmailRaw || "").trim().toLowerCase();
  const targetRole = String(targetRoleRaw || "").trim().toLowerCase();

  if (!adminEmail || !adminPassword || !targetEmail || !targetRole) {
    usage();
    process.exit(1);
  }

  if (!allowedRoles.has(targetRole)) {
    console.error(`Invalid role: ${targetRole}. Allowed: admin | recruiter | candidate`);
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", targetEmail), limit(1));
    const result = await getDocs(userQuery);

    if (result.empty) {
      console.error(
        `No profile found for ${targetEmail} in users collection.\n` +
          "Have that user login once first so their profile document is created."
      );
      process.exit(1);
    }

    const userDoc = result.docs[0];
    const patch = { role: targetRole };

    if (targetRole === "admin") {
      patch.isVerified = true;
      patch.verificationStatus = "approved";
    } else if (targetRole === "candidate") {
      patch.isVerified = true;
      patch.verificationStatus = "approved";
    } else if (targetRole === "recruiter") {
      if (!userDoc.data()?.verificationStatus) {
        patch.verificationStatus = "pending";
      }
      if (typeof userDoc.data()?.isVerified !== "boolean") {
        patch.isVerified = false;
      }
    }

    await updateDoc(userDoc.ref, patch);

    console.log(`Updated ${targetEmail} -> role: ${targetRole} (doc: ${userDoc.id})`);
  } catch (error) {
    console.error("Role update failed:", error?.code || error?.message || error);
    process.exit(1);
  } finally {
    try {
      await signOut(auth);
    } catch {}
  }
}

main();

