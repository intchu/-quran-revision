import {
    doc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from './config';

export class FirestoreService {
    static async createUserProfile(userId, userData) {
        try {
            await setDoc(doc(db, 'users', userId), {
                ...userData,
                settings: {
                    notificationsEnabled: true,
                    theme: 'light'
                }
            });
        } catch (error) {
            throw new Error('Erreur lors de la création du profil: ' + error.message);
        }
    }

    static async addRevision(userId, revisionData) {
        try {
            const revisionRef = await addDoc(
                collection(db, 'revisions', userId, 'userRevisions'),
                {
                    ...revisionData,
                    createdAt: serverTimestamp()
                }
            );
            return revisionRef.id;
        } catch (error) {
            throw new Error('Erreur lors de l\'ajout de la révision: ' + error.message);
        }
    }

    static async updateRevision(userId, revisionId, updateData) {
        try {
            const revisionRef = doc(db, 'revisions', userId, 'userRevisions', revisionId);
            await updateDoc(revisionRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw new Error('Erreur lors de la mise à jour de la révision: ' + error.message);
        }
    }

    static async deleteRevision(userId, revisionId) {
        try {
            await deleteDoc(doc(db, 'revisions', userId, 'userRevisions', revisionId));
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la révision: ' + error.message);
        }
    }

    static async getUserRevisions(userId) {
        try {
            const q = query(
                collection(db, 'revisions', userId, 'userRevisions'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des révisions: ' + error.message);
        }
    }

    static async getUpcomingRevisions(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        try {
            const q = query(
                collection(db, 'revisions', userId, 'userRevisions'),
                where('revisions.date', '>=', today),
                where('revisions.completed', '==', false)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des révisions à venir: ' + error.message);
        }
    }

    static async updateUserStatistics(userId, statistics) {
        try {
            await setDoc(doc(db, 'statistics', userId), {
                ...statistics,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            throw new Error('Erreur lors de la mise à jour des statistiques: ' + error.message);
        }
    }

    static async getUserStatistics(userId) {
        try {
            const docRef = doc(db, 'statistics', userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return {
                    totalVersesMemorized: 0,
                    completedRevisions: 0,
                    lastUpdateDate: new Date().toISOString()
                };
            }
        } catch (error) {
            throw new Error('Erreur lors de la récupération des statistiques: ' + error.message);
        }
    }

    static async syncLocalData(userId) {
        try {
            const localRevisions = JSON.parse(localStorage.getItem('revisions')) || [];
            
            for (const revision of localRevisions) {
                await this.addRevision(userId, {
                    ...revision,
                    synced: true
                });
            }
            
            localStorage.removeItem('revisions');
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la synchronisation: ' + error.message);
        }
    }
}
