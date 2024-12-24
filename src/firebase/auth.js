import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

export class AuthService {
    static async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user.uid, {
                email: userCredential.user.email,
                createdAt: new Date().toISOString()
            });
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    static async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    static async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            await createUserProfile(userCredential.user.uid, {
                email: userCredential.user.email,
                name: userCredential.user.displayName,
                createdAt: new Date().toISOString()
            });
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    static async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    static async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    static onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }

    static handleAuthError(error) {
        let message = 'Une erreur est survenue';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Cette adresse email est déjà utilisée';
                break;
            case 'auth/invalid-email':
                message = 'Adresse email invalide';
                break;
            case 'auth/operation-not-allowed':
                message = 'Opération non autorisée';
                break;
            case 'auth/weak-password':
                message = 'Le mot de passe est trop faible';
                break;
            case 'auth/user-disabled':
                message = 'Ce compte a été désactivé';
                break;
            case 'auth/user-not-found':
                message = 'Aucun compte trouvé avec cette adresse email';
                break;
            case 'auth/wrong-password':
                message = 'Mot de passe incorrect';
                break;
            case 'auth/too-many-requests':
                message = 'Trop de tentatives, veuillez réessayer plus tard';
                break;
        }
        return new Error(message);
    }
}
