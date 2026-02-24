// Mock Firebase
jest.mock('./firebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {},
  realtimeDb: {},
  default: {},
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  Stack: () => null,
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
