// Firebase configuration and initialization

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBJSyhae-k3McariycR14uB5jgNflcIBk0",
    authDomain: "jilani-agro.firebaseapp.com",
    projectId: "jilani-agro",
    storageBucket: "jilani-agro.firebasestorage.app",
    messagingSenderId: "2464879199",
    appId: "1:2464879199:web:7254456ce25881970e41ea"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

export function logoutAdmin() {
  return signOut(auth);
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Product functions
export async function getProducts() {
  try {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    const productsList = productsSnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
    return productsList;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
}

export async function addProduct(productData) {
  try {
    // Upload image to Firebase Storage if there's a file
    if (productData.imageFile) {
      const storageRef = ref(storage, `product_images/${Date.now()}_${productData.imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, productData.imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      productData.image = downloadURL;
      delete productData.imageFile; // Remove the file object before storing in Firestore
    }
    
    const docRef = await addDoc(collection(db, "products"), productData);
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function updateProduct(productId, productData) {
  try {
    // Upload image to Firebase Storage if there's a new file
    if (productData.imageFile) {
      const storageRef = ref(storage, `product_images/${Date.now()}_${productData.imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, productData.imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      productData.image = downloadURL;
      delete productData.imageFile; // Remove the file object before storing in Firestore
    }
    
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, productData);
    return { id: productId, ...productData };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// Cart functions
export async function saveUserCart(userId, cartItems) {
  try {
    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, { items: cartItems });
    return { success: true };
  } catch (error) {
    // If the document doesn't exist, create it
    if (error.code === 'not-found') {
      try {
        await addDoc(collection(db, "carts"), {
          userId: userId,
          items: cartItems
        });
        return { success: true };
      } catch (innerError) {
        console.error("Error creating cart:", innerError);
        throw innerError;
      }
    }
    console.error("Error saving cart:", error);
    throw error;
  }
}

export async function getUserCart(userId) {
  try {
    const cartsRef = collection(db, "carts");
    const q = query(cartsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const cartDoc = querySnapshot.docs[0];
      return { id: cartDoc.id, ...cartDoc.data() };
    }
    
    return { userId, items: [] };
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
}

// Export Firebase instances for direct access if needed
export { auth, db, storage };