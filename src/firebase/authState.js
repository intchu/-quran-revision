import { AuthService } from './auth';
import { FirestoreService } from './firestore';

class AuthState {
    constructor() {
        this.user = null;
        this.loading = true;
        this.error = null;
        this.listeners = new Set();
        this.initializeAuthState();
    }

    initializeAuthState() {
        AuthService.onAuthStateChange(async (user) => {
            this.loading = true;
            this.notifyListeners();

            if (user) {
                try {
                    // Synchroniser les données locales si nécessaire
                    await FirestoreService.syncLocalData(user.uid);
                    this.user = user;
                    this.error = null;
                } catch (error) {
                    this.error = error.message;
                }
            } else {
                this.user = null;
                this.error = null;
            }

            this.loading = false;
            this.notifyListeners();
        });
    }

    addListener(listener) {
        this.listeners.add(listener);
        // Notifier immédiatement le nouveau listener de l'état actuel
        listener({
            user: this.user,
            loading: this.loading,
            error: this.error
        });
        return () => this.listeners.delete(listener);
    }

    notifyListeners() {
        const state = {
            user: this.user,
            loading: this.loading,
            error: this.error
        };
        this.listeners.forEach(listener => listener(state));
    }

    async signIn(email, password) {
        try {
            this.loading = true;
            this.error = null;
            this.notifyListeners();

            await AuthService.signIn(email, password);
        } catch (error) {
            this.error = error.message;
            this.notifyListeners();
            throw error;
        }
    }

    async signUp(email, password) {
        try {
            this.loading = true;
            this.error = null;
            this.notifyListeners();

            await AuthService.signUp(email, password);
        } catch (error) {
            this.error = error.message;
            this.notifyListeners();
            throw error;
        }
    }

    async signOut() {
        try {
            this.loading = true;
            this.error = null;
            this.notifyListeners();

            await AuthService.signOut();
        } catch (error) {
            this.error = error.message;
            this.notifyListeners();
            throw error;
        }
    }
}

// Créer une instance unique de AuthState
export const authState = new AuthState();
