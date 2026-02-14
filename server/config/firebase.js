import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    getCountFromServer,
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmSp7YpPk6tO6icBqGw1y9yzV3u7f3auw",
    authDomain: "student-olx.firebaseapp.com",
    projectId: "student-olx",
    storageBucket: "student-olx.firebasestorage.app",
    messagingSenderId: "239768743365",
    appId: "1:239768743365:web:3b90d5f715dabddab92fac",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

console.log('✅ Firebase connected to project: student-olx');

// ──────────────────────────────────────────────
// Compatibility wrapper — provides admin-SDK-like API
// so all controllers work without any changes
// ──────────────────────────────────────────────

function wrapDocSnap(docSnap) {
    return {
        id: docSnap.id,
        exists: docSnap.exists(),
        data: () => docSnap.data(),
        ref: {
            id: docSnap.id,
            delete: () => deleteDoc(docSnap.ref),
        },
    };
}

function wrapQuerySnap(querySnap) {
    return {
        empty: querySnap.empty,
        size: querySnap.size,
        docs: querySnap.docs.map(wrapDocSnap),
    };
}

class CollectionRef {
    constructor(name, constraints = []) {
        this._name = name;
        this._ref = collection(firestore, name);
        this._constraints = constraints;
    }

    where(field, op, value) {
        return new CollectionRef(this._name, [...this._constraints, where(field, op, value)]);
    }

    orderBy(field, direction = 'asc') {
        return new CollectionRef(this._name, [...this._constraints, orderBy(field, direction)]);
    }

    limit(n) {
        return new CollectionRef(this._name, [...this._constraints, limit(n)]);
    }

    async get() {
        const q = query(this._ref, ...this._constraints);
        const snap = await getDocs(q);
        return wrapQuerySnap(snap);
    }

    async add(data) {
        const docRef = await addDoc(this._ref, data);
        return docRef; // has .id property
    }

    async count() {
        const q = query(this._ref, ...this._constraints);
        try {
            const snap = await getCountFromServer(q);
            return { data: () => snap.data() };
        } catch {
            const snap = await getDocs(q);
            return { data: () => ({ count: snap.size }) };
        }
    }

    doc(id) {
        return new DocRef(this._name, id);
    }
}

class DocRef {
    constructor(collectionName, id) {
        this._ref = doc(firestore, collectionName, id);
        this.id = id;
    }

    async get() {
        const snap = await getDoc(this._ref);
        return wrapDocSnap(snap);
    }

    async update(data) {
        return await updateDoc(this._ref, data);
    }

    async delete() {
        return await deleteDoc(this._ref);
    }
}

// Public API — matches admin SDK: db.collection('name').doc('id').get(), etc.
const db = {
    collection: (name) => new CollectionRef(name),
};

export { db };
