import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { MOCK_APPLICATIONS, MOCK_JOBS, MOCK_USERS } from "../constants/data";
import { auth, db, storage } from "../firebaseConfig";

const AppContext = createContext();
const isFirebaseConfigured = Boolean(auth && db);

const usersCollection = "users";
const jobsCollection = "jobs";
const applicationsCollection = "applications";
const verificationCollection = "verificationRequests";
const loginRecordsCollection = "loginRecords";
const localUsersKey = "hireflow_local_users_v1";
const localVerificationRequestsKey = "hireflow_local_verification_requests_v1";
const localJobsKey = "hireflow_local_jobs_v1";
const localApplicationsKey = "hireflow_local_applications_v1";

const toArray = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const isRemoteUrl = (value = "") => /^https?:\/\//i.test(String(value || "").trim());
const normalizeVerificationStatus = (status = "") => {
  const cleanStatus = String(status || "").trim().toLowerCase();
  if (cleanStatus === "approved" || cleanStatus === "rejected" || cleanStatus === "pending") {
    return cleanStatus;
  }
  return "pending";
};
const normalizeVerificationRequest = (request) => ({
  ...request,
  status: normalizeVerificationStatus(request?.status),
});
const getRecruiterAuthStatus = (profile) => {
  const status = String(profile?.verificationStatus || "").toLowerCase();
  if (status === "verified" || profile?.isVerified) {
    return "verified";
  }
  if (status === "rejected") {
    return "rejected";
  }
  return "pending";
};
const buildFallbackProfile = (authUser) => ({
  id: authUser.uid,
  name: authUser.displayName || "User",
  email: normalizeEmail(authUser.email || ""),
  role: "candidate",
  skills: [],
  education: "",
  videoResume: null,
  isVerified: true,
  verificationStatus: "approved",
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState(MOCK_USERS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [isLocalDataHydrated, setIsLocalDataHydrated] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured) return;

    let active = true;
    const hydrateLocalData = async () => {
      try {
        const [usersValue, verificationValue, jobsValue, applicationsValue] = await AsyncStorage.multiGet([
          localUsersKey,
          localVerificationRequestsKey,
          localJobsKey,
          localApplicationsKey,
        ]);

        const usersRaw = usersValue?.[1];
        const verificationRaw = verificationValue?.[1];
        const jobsRaw = jobsValue?.[1];
        const applicationsRaw = applicationsValue?.[1];

        if (!active) return;

        if (usersRaw) {
          const parsedUsers = JSON.parse(usersRaw);
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            setAllUsers(parsedUsers);
          }
        }

        if (verificationRaw) {
          const parsedVerifications = JSON.parse(verificationRaw);
          if (Array.isArray(parsedVerifications)) {
            setVerificationRequests(parsedVerifications.map(normalizeVerificationRequest));
          }
        }

        if (jobsRaw) {
          const parsedJobs = JSON.parse(jobsRaw);
          if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
            setJobs(parsedJobs);
          }
        }

        if (applicationsRaw) {
          const parsedApplications = JSON.parse(applicationsRaw);
          if (Array.isArray(parsedApplications)) {
            setApplications(parsedApplications);
          }
        }
      } catch {
        // Ignore local hydration errors and keep in-memory defaults.
      } finally {
        if (active) setIsLocalDataHydrated(true);
      }
    };

    hydrateLocalData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured || !isLocalDataHydrated) return;
    AsyncStorage.setItem(localUsersKey, JSON.stringify(allUsers)).catch(() => {});
  }, [allUsers, isLocalDataHydrated]);

  useEffect(() => {
    if (isFirebaseConfigured || !isLocalDataHydrated) return;
    AsyncStorage.setItem(localVerificationRequestsKey, JSON.stringify(verificationRequests)).catch(() => {});
  }, [verificationRequests, isLocalDataHydrated]);

  useEffect(() => {
    if (isFirebaseConfigured || !isLocalDataHydrated) return;
    AsyncStorage.setItem(localJobsKey, JSON.stringify(jobs)).catch(() => {});
  }, [jobs, isLocalDataHydrated]);

  useEffect(() => {
    if (isFirebaseConfigured || !isLocalDataHydrated) return;
    AsyncStorage.setItem(localApplicationsKey, JSON.stringify(applications)).catch(() => {});
  }, [applications, isLocalDataHydrated]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !auth) return;
    let unsubCurrentProfile = null;
    let scopedUnsubs = [];

    const clearScopedListeners = () => {
      scopedUnsubs.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
      scopedUnsubs = [];
    };

    const listenSafely = (source, onData) =>
      onSnapshot(
        source,
        onData,
        (error) => {
          if (error?.code === "permission-denied") {
            // Rules can legitimately block some collections by role.
            return;
          }
          console.error("Firestore listener error:", error?.code || error?.message || error);
        }
      );

    const unsubAuth = onAuthStateChanged(auth, async (authUser) => {
      clearScopedListeners();
      if (unsubCurrentProfile) {
        unsubCurrentProfile();
        unsubCurrentProfile = null;
      }

      if (!authUser) {
        setUser(null);
        return;
      }

      let profile = null;
      try {
        profile = await resolveFirebaseProfile(authUser);
      } catch (error) {
        if (error?.code !== "permission-denied") {
          console.error("Profile resolution failed:", error?.code || error?.message || error);
        }
      }

      if (!profile) {
        setUser(null);
        return;
      }

      setUser(profile);

      // Jobs are needed by all roles.
      scopedUnsubs.push(
        listenSafely(collection(db, jobsCollection), (snapshot) => {
          setJobs(toArray(snapshot));
        })
      );

      if (profile.role === "admin") {
        scopedUnsubs.push(
          listenSafely(collection(db, usersCollection), (snapshot) => {
            setAllUsers(toArray(snapshot));
          })
        );
        scopedUnsubs.push(
          listenSafely(collection(db, applicationsCollection), (snapshot) => {
            setApplications(toArray(snapshot));
          })
        );
        scopedUnsubs.push(
          listenSafely(collection(db, verificationCollection), (snapshot) => {
            setVerificationRequests(toArray(snapshot).map(normalizeVerificationRequest));
          })
        );
      } else if (profile.role === "recruiter") {
        scopedUnsubs.push(
          listenSafely(collection(db, usersCollection), (snapshot) => {
            setAllUsers(toArray(snapshot));
          })
        );
        scopedUnsubs.push(
          listenSafely(collection(db, applicationsCollection), (snapshot) => {
            setApplications(toArray(snapshot));
          })
        );
        scopedUnsubs.push(
          listenSafely(collection(db, verificationCollection), (snapshot) => {
            setVerificationRequests(toArray(snapshot).map(normalizeVerificationRequest));
          })
        );
      } else if (profile.role === "candidate") {
        scopedUnsubs.push(
          listenSafely(
            query(collection(db, applicationsCollection), where("candidateId", "==", profile.id)),
            (snapshot) => {
              setApplications(toArray(snapshot));
            }
          )
        );
      }

      // Keep logged-in user profile in sync with admin actions (approve/reject).
      unsubCurrentProfile = onSnapshot(
        doc(db, usersCollection, authUser.uid),
        (snap) => {
          if (!snap.exists()) return;
          setUser({ id: snap.id, ...snap.data() });
        },
        () => {}
      );
    });

    return () => {
      clearScopedListeners();
      if (unsubCurrentProfile) {
        unsubCurrentProfile();
      }
      unsubAuth();
    };
  }, []);

  const resolveFirebaseProfile = async (authUser) => {
    const profileRef = doc(db, usersCollection, authUser.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      return { id: profileSnap.id, ...profileSnap.data() };
    }

    const email = normalizeEmail(authUser.email);
    if (!email) return null;

    const legacyQuery = query(collection(db, usersCollection), where("email", "==", email), limit(1));
    const legacySnap = await getDocs(legacyQuery);
    if (legacySnap.empty) {
      const fallbackProfile = buildFallbackProfile(authUser);
      try {
        await setDoc(profileRef, fallbackProfile, { merge: true });
      } catch {
        // Firestore rules may block this; continue with auth-backed fallback profile.
      }
      return fallbackProfile;
    }

    const legacyDoc = legacySnap.docs[0];
    const migratedProfile = { ...legacyDoc.data(), id: authUser.uid, email };
    await setDoc(profileRef, migratedProfile);
    if (legacyDoc.id !== authUser.uid) {
      await deleteDoc(legacyDoc.ref);
    }
    return migratedProfile;
  };

  const saveLoginRecord = async ({ email, success, reason = null, profile = null }) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      await addDoc(collection(db, loginRecordsCollection), {
        email: normalizeEmail(email),
        success: Boolean(success),
        reason: reason || null,
        role: profile?.role || null,
        userId: profile?.id || null,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Swallow logging failures so auth flow is never blocked.
    }
  };

  const login = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);

    if (!isFirebaseConfigured || !auth || !db) {
      const userWithEmail = allUsers.find((item) => normalizeEmail(item.email) === normalizedEmail);
      if (!userWithEmail) {
        await saveLoginRecord({
          email: normalizedEmail,
          success: false,
          reason: "invalid_credentials",
        });
        return { success: false, reason: "invalid_credentials" };
      }

      if (userWithEmail.password !== password) {
        await saveLoginRecord({
          email: normalizedEmail,
          success: false,
          reason: "wrong_password",
          profile: userWithEmail,
        });
        return { success: false, reason: "wrong_password" };
      }

      const foundUser = userWithEmail;

      if (foundUser.role === "recruiter") {
        const recruiterStatus = getRecruiterAuthStatus(foundUser);
        if (recruiterStatus !== "verified") {
          const blockedReason = recruiterStatus === "rejected" ? "verification_rejected" : "verification_pending";
          setUser(foundUser);
          await saveLoginRecord({
            email: normalizedEmail,
            success: true,
            reason: blockedReason,
            profile: foundUser,
          });
          return { success: true, user: foundUser, verificationBlocked: blockedReason };
        }
      }

      setUser(foundUser);
      await saveLoginRecord({
        email: normalizedEmail,
        success: true,
        profile: foundUser,
      });
      return { success: true, user: foundUser };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const profile = await resolveFirebaseProfile(credential.user);
      if (!profile) {
        await signOut(auth);
        await saveLoginRecord({
          email: normalizedEmail,
          success: false,
          reason: "profile_missing",
        });
        return { success: false, reason: "profile_missing" };
      }

      if (profile.role === "recruiter") {
        const recruiterStatus = getRecruiterAuthStatus(profile);
        if (recruiterStatus !== "verified") {
          const blockedReason = recruiterStatus === "rejected" ? "verification_rejected" : "verification_pending";
          setUser(profile);
          await saveLoginRecord({
            email: normalizedEmail,
            success: true,
            reason: blockedReason,
            profile,
          });
          return { success: true, user: profile, verificationBlocked: blockedReason };
        }
      }

      setUser(profile);
      await saveLoginRecord({
        email: normalizedEmail,
        success: true,
        profile,
      });
      return { success: true, user: profile };
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/invalid-login-credentials"
      ) {
        let reason = "invalid_credentials";
        try {
          const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
          if (Array.isArray(methods) && methods.length > 0) {
            reason = "wrong_password";
          }
        } catch {
          // Fallback to generic invalid credentials.
        }
        await saveLoginRecord({
          email: normalizedEmail,
          success: false,
          reason,
        });
        return { success: false, reason };
      }
      if (error.code === "auth/operation-not-allowed") {
        return { success: false, reason: "email_password_disabled", errorCode: error.code };
      }
      if (error.code === "auth/network-request-failed") {
        return { success: false, reason: "network_error", errorCode: error.code };
      }

      await saveLoginRecord({
        email: normalizedEmail,
        success: false,
        reason: "unknown_error",
      });
      return {
        success: false,
        reason: "unknown_error",
        errorCode: error?.code || "unknown",
        errorMessage: error?.message || null,
      };
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } finally {
      setUser(null);
    }
  };

  const register = async (userData) => {
    const normalizedEmail = normalizeEmail(userData.email);
    const isRecruiter = userData.role === "recruiter";
    const verificationData = userData.verificationData || null;

    if (!isFirebaseConfigured || !auth || !db) {
      const existingUser = allUsers.find((item) => normalizeEmail(item.email) === normalizedEmail);
      if (existingUser) {
        return { success: false, reason: "email_in_use" };
      }

      if (isRecruiter && !verificationData) {
        return { success: false, reason: "verification_required" };
      }

      const newUser = {
        ...userData,
        verificationData: undefined,
        email: normalizedEmail,
        id: Date.now().toString(),
        company: verificationData?.companyName || userData.company || "",
        phone: verificationData?.phone || "",
        companyContactNumber: verificationData?.companyContactNumber || "",
        companyGmail: verificationData?.companyGmail || "",
        pendingVerificationRequest: isRecruiter ? verificationData : null,
        isVerified: isRecruiter ? false : true,
        verificationStatus: isRecruiter ? "pending" : "approved",
      };

      setAllUsers((prev) => [...prev, newUser]);
      if (isRecruiter) {
        const request = {
          id: `${Date.now()}-verification`,
          recruiterId: newUser.id,
          recruiterName: verificationData.fullName || newUser.name,
          recruiterEmail: normalizedEmail,
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...verificationData,
        };
        setVerificationRequests((prev) => [normalizeVerificationRequest(request), ...prev]);
      }
      setUser(newUser);
      return { success: true, user: newUser };
    }

    try {
      if (isRecruiter && !verificationData) {
        return { success: false, reason: "verification_required" };
      }

      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, userData.password);
      const newUser = {
        id: credential.user.uid,
        name: userData.name,
        email: normalizedEmail,
        role: userData.role,
        skills: userData.skills || [],
        education: userData.education || "",
        videoResume: userData.videoResume || null,
        company: verificationData?.companyName || userData.company || "",
        phone: verificationData?.phone || "",
        companyContactNumber: verificationData?.companyContactNumber || "",
        companyGmail: verificationData?.companyGmail || "",
        pendingVerificationRequest: isRecruiter ? verificationData : null,
        isVerified: isRecruiter ? false : true,
        verificationStatus: isRecruiter ? "pending" : "approved",
      };

      try {
        await setDoc(doc(db, usersCollection, credential.user.uid), newUser);
      } catch {
        // Keep signup successful even if Firestore write is blocked.
      }
      if (isRecruiter) {
        const requestPayload = {
          recruiterId: newUser.id,
          recruiterName: verificationData.fullName || newUser.name,
          recruiterEmail: normalizedEmail,
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...verificationData,
        };
        try {
          await addDoc(collection(db, verificationCollection), requestPayload);
        } catch {
          // Fallback so admin still sees request when collection write is blocked.
          setVerificationRequests((prev) => [
            normalizeVerificationRequest({
              id: `fallback-${Date.now()}`,
              ...requestPayload,
            }),
            ...prev.filter((item) => item.recruiterId !== newUser.id),
          ]);
        }
      }
      setAllUsers((prev) => {
        const exists = prev.some((item) => item.id === newUser.id || normalizeEmail(item.email) === normalizedEmail);
        if (exists) {
          return prev.map((item) =>
            item.id === newUser.id || normalizeEmail(item.email) === normalizedEmail ? newUser : item
          );
        }
        return [newUser, ...prev];
      });
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        return { success: false, reason: "email_in_use", errorCode: error.code };
      }
      if (error.code === "auth/weak-password") {
        return { success: false, reason: "weak_password", errorCode: error.code };
      }
      if (error.code === "auth/invalid-email") {
        return { success: false, reason: "invalid_email", errorCode: error.code };
      }
      if (error.code === "auth/operation-not-allowed") {
        return { success: false, reason: "email_password_disabled", errorCode: error.code };
      }
      if (error.code === "auth/network-request-failed") {
        return { success: false, reason: "network_error", errorCode: error.code };
      }
      return {
        success: false,
        reason: "unknown_error",
        errorCode: error?.code || "unknown",
        errorMessage: error?.message || null,
      };
    }
  };

  const submitRecruiterVerification = async (verificationData) => {
    if (!user || user.role !== "recruiter") {
      return false;
    }

    if (!isFirebaseConfigured || !db) {
      const request = {
        id: Date.now().toString(),
        recruiterId: user.id,
        recruiterName: verificationData.fullName || user.name,
        recruiterEmail: user.email,
        status: "pending",
        submittedAt: new Date().toISOString(),
        ...verificationData,
      };

      setVerificationRequests((prev) => [
        normalizeVerificationRequest(request),
        ...prev.filter((item) => item.recruiterId !== user.id),
      ]);
      setAllUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                company: verificationData.companyName,
                isVerified: false,
                verificationStatus: "pending",
              }
            : item
        )
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              company: verificationData.companyName,
              isVerified: false,
              verificationStatus: "pending",
            }
          : prev
      );
      return true;
    }

    try {
      const existingQuery = query(collection(db, verificationCollection), where("recruiterId", "==", user.id));
      const existing = await getDocs(existingQuery);
      await Promise.all(existing.docs.map((item) => deleteDoc(item.ref)));

      await addDoc(collection(db, verificationCollection), {
        recruiterId: user.id,
        recruiterName: verificationData.fullName || user.name,
        recruiterEmail: user.email,
        status: "pending",
        submittedAt: new Date().toISOString(),
        ...verificationData,
      });

      const userRef = doc(db, usersCollection, user.id);
      await updateDoc(userRef, {
        company: verificationData.companyName,
        isVerified: false,
        verificationStatus: "pending",
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              company: verificationData.companyName,
              isVerified: false,
              verificationStatus: "pending",
            }
          : prev
      );

      return true;
    } catch {
      const fallbackRequest = {
        id: Date.now().toString(),
        recruiterId: user.id,
        recruiterName: verificationData.fullName || user.name,
        recruiterEmail: user.email,
        status: "pending",
        submittedAt: new Date().toISOString(),
        ...verificationData,
      };

      // Fallback for local/demo mode when remote write fails, so flow can proceed.
      setVerificationRequests((prev) => [
        normalizeVerificationRequest(fallbackRequest),
        ...prev.filter((item) => item.recruiterId !== user.id),
      ]);
      setAllUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                company: verificationData.companyName,
                isVerified: false,
                verificationStatus: "pending",
              }
            : item
        )
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              company: verificationData.companyName,
              isVerified: false,
              verificationStatus: "pending",
            }
          : prev
      );

      return true;
    }
  };

  const reviewRecruiterVerification = async (requestId, decision) => {
    const normalizedDecision = normalizeVerificationStatus(decision);
    const fallbackRecruiterId =
      typeof requestId === "string" && requestId.startsWith("profile-")
        ? requestId.replace("profile-", "")
        : null;

    if (!isFirebaseConfigured || !db) {
      setVerificationRequests((prev) => {
        let selectedRequest = null;
        const updatedRequests = prev.map((request) => {
          if (request.id !== requestId && request.recruiterId !== fallbackRecruiterId) return request;
          selectedRequest = {
            ...request,
            status: normalizedDecision,
            reviewedAt: new Date().toISOString(),
          };
          return selectedRequest;
        });

        if (selectedRequest) {
          const approved = normalizedDecision === "approved";
          setAllUsers((users) =>
            users.map((item) =>
              item.id === selectedRequest.recruiterId
                ? {
                    ...item,
                    company: selectedRequest.companyName || item.company,
                    isVerified: approved,
                    verificationStatus: approved ? "verified" : "rejected",
                  }
                : item
            )
          );
          setUser((currentUser) =>
            currentUser && currentUser.id === selectedRequest.recruiterId
              ? {
                  ...currentUser,
                  company: selectedRequest.companyName || currentUser.company,
                  isVerified: approved,
                  verificationStatus: approved ? "verified" : "rejected",
                }
              : currentUser
          );
        }

        return updatedRequests;
      });

      if (fallbackRecruiterId) {
        const approved = normalizedDecision === "approved";
        setAllUsers((users) =>
          users.map((item) =>
            item.id === fallbackRecruiterId
              ? {
                  ...item,
                  isVerified: approved,
                  verificationStatus: approved ? "verified" : "rejected",
                }
              : item
          )
        );
        setUser((currentUser) =>
          currentUser && currentUser.id === fallbackRecruiterId
            ? {
                ...currentUser,
                isVerified: approved,
                verificationStatus: approved ? "verified" : "rejected",
              }
            : currentUser
        );
      }
      return true;
    }

    try {
      const requestRef = doc(db, verificationCollection, requestId);
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists() && !fallbackRecruiterId) return false;

      let selectedRequest = null;
      if (requestSnap.exists()) {
        selectedRequest = { id: requestSnap.id, ...requestSnap.data() };
      } else {
        const fallbackUserRef = doc(db, usersCollection, fallbackRecruiterId);
        const fallbackUserSnap = await getDoc(fallbackUserRef);
        if (!fallbackUserSnap.exists()) return false;
        const fallbackUser = fallbackUserSnap.data();
        selectedRequest = {
          id: requestId,
          recruiterId: fallbackRecruiterId,
          recruiterName: fallbackUser.name || "Recruiter",
          recruiterEmail: fallbackUser.email || "",
          companyName: fallbackUser.company || "",
        };
      }
      const approved = normalizedDecision === "approved";

      if (requestSnap.exists()) {
        await updateDoc(requestRef, {
          status: normalizedDecision,
          reviewedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, verificationCollection), {
          ...selectedRequest,
          status: normalizedDecision,
          reviewedAt: new Date().toISOString(),
        });
      }

      await updateDoc(doc(db, usersCollection, selectedRequest.recruiterId), {
        company: selectedRequest.companyName || "",
        isVerified: approved,
        verificationStatus: approved ? "verified" : "rejected",
      });

      setUser((currentUser) =>
        currentUser && currentUser.id === selectedRequest.recruiterId
          ? {
              ...currentUser,
              company: selectedRequest.companyName || currentUser.company,
              isVerified: approved,
              verificationStatus: approved ? "verified" : "rejected",
            }
          : currentUser
      );

      return true;
    } catch {
      return false;
    }
  };

  const addJob = async (jobData) => {
    if (!user) return false;

    if (!isFirebaseConfigured || !db) {
      const newJob = { ...jobData, id: Date.now().toString(), postedBy: user.id, applicants: [] };
      setJobs((prev) => [newJob, ...prev]);
      return true;
    }

    await addDoc(collection(db, jobsCollection), {
      ...jobData,
      postedBy: user.id,
      applicants: [],
      createdAt: new Date().toISOString(),
    });
    return true;
  };

  const applyToJob = async (jobId) => {
    if (!user || user.role !== "candidate") return false;

    const job = jobs.find((item) => item.id === jobId);
    if (!job) return false;

    const matchedSkills = (user.skills || []).filter((skill) => (job.requiredSkills || []).includes(skill));
    const score = Math.round((matchedSkills.length / (job.requiredSkills || []).length) * 100) || 0;

    if (!isFirebaseConfigured || !db) {
      const newApplication = {
        id: Date.now().toString(),
        jobId,
        candidateId: user.id,
        status: "applied",
        score,
        timestamp: new Date().toISOString(),
      };
      setApplications((prev) => [...prev, newApplication]);
      return true;
    }

    const existingQuery = query(
      collection(db, applicationsCollection),
      where("jobId", "==", jobId),
      where("candidateId", "==", user.id)
    );
    const existingApplications = await getDocs(existingQuery);
    if (!existingApplications.empty) {
      return false;
    }

    await addDoc(collection(db, applicationsCollection), {
      jobId,
      candidateId: user.id,
      status: "applied",
      score,
      timestamp: new Date().toISOString(),
    });
    return true;
  };

  const updateApplicationStatus = async (appId, status) => {
    if (!isFirebaseConfigured || !db) {
      setApplications((apps) => apps.map((item) => (item.id === appId ? { ...item, status } : item)));
      return true;
    }

    await updateDoc(doc(db, applicationsCollection, appId), { status });
    return true;
  };

  const updateCandidateProfile = async (profileData) => {
    if (!user || user.role !== "candidate") return false;

    const normalizedSkills = Array.isArray(profileData.skills)
      ? profileData.skills
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [];

    const payload = {
      education: String(profileData.education || "").trim(),
      skills: Array.from(new Set(normalizedSkills)),
      videoResume: profileData.videoResume || null,
    };

    if (!isFirebaseConfigured || !db || !storage) {
      setAllUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, ...payload } : item))
      );
      setUser((prev) => (prev ? { ...prev, ...payload } : prev));
      return true;
    }

    try {
      const nextPayload = { ...payload };

      // Upload fresh local video files to Firebase Storage and save the download URL.
      if (nextPayload.videoResume && !isRemoteUrl(nextPayload.videoResume)) {
        try {
          const resumeUri = String(nextPayload.videoResume);
          const uriParts = resumeUri.split(".");
          const extension = uriParts.length > 1 ? uriParts.pop().split("?")[0] : "mp4";
          const storagePath = `videoResumes/${user.id}/${Date.now()}.${extension}`;
          const storageRef = ref(storage, storagePath);

          const response = await fetch(resumeUri);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob, {
            contentType: blob.type || "video/mp4",
          });
          const downloadUrl = await getDownloadURL(storageRef);
          nextPayload.videoResume = downloadUrl;
        } catch {
          // Storage may be disabled on Spark plan; keep local URI fallback.
        }
      }

      await updateDoc(doc(db, usersCollection, user.id), nextPayload);
      setUser((prev) => (prev ? { ...prev, ...nextPayload } : prev));
      return true;
    } catch {
      return false;
    }
  };

  const value = useMemo(
    () => ({
      user,
      allUsers,
      jobs,
      applications,
      verificationRequests,
      login,
      logout,
      register,
      submitRecruiterVerification,
      reviewRecruiterVerification,
      addJob,
      applyToJob,
      updateApplicationStatus,
      updateCandidateProfile,
      isFirebaseConfigured,
    }),
    [user, allUsers, jobs, applications, verificationRequests]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
