// N3D Sync Service
// Handles syncing designs and filament data from N3D API

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTp9aLB3VaKIKpztrR029mG3mVEw5MNOQ",
    authDomain: "blackpeacockprinting-fbb65.firebaseapp.com",
    projectId: "blackpeacockprinting-fbb65",
    storageBucket: "blackpeacockprinting-fbb65.firebasestorage.app",
    messagingSenderId: "1025287520257",
    appId: "1:1025287520257:web:ff8d4ab1b69fd859c20000"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// N3D API Configuration
const N3D_API_BASE = 'https://api.n3d.io/v1';
// You'll need to add your N3D API key here
const N3D_API_KEY = localStorage.getItem('n3d_api_key') || '';

// N3D Sync Service
export class N3DSyncService {
    constructor() {
        this.db = db;
    }

    // Set API Key
    setApiKey(key) {
        localStorage.setItem('n3d_api_key', key);
    }

    // Get API Key
    getApiKey() {
        return localStorage.getItem('n3d_api_key') || '';
    }

    // Fetch designs from N3D API
    async fetchDesignsFromN3D() {
        try {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error('N3D API key not configured');
            }

            const response = await fetch(`${N3D_API_BASE}/designs`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`N3D API error: ${response.status}`);
            }

            const data = await response.json();
            return data.designs || [];
        } catch (error) {
            console.error('Error fetching designs from N3D:', error);
            // Fallback to mock data for development
            return this.getMockDesigns();
        }
    }

    // Fetch filament colors from N3D
    async fetchFilamentsFromN3D() {
        try {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error('N3D API key not configured');
            }

            const response = await fetch(`${N3D_API_BASE}/filaments`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`N3D API error: ${response.status}`);
            }

            const data = await response.json();
            return data.filaments || [];
        } catch (error) {
            console.error('Error fetching filaments from N3D:', error);
            return this.getMockFilaments();
        }
    }

    // Sync designs to Firestore
    async syncDesigns() {
        try {
            const designs = await this.fetchDesignsFromN3D();
            const batch = writeBatch(this.db);

            for (const design of designs) {
                const designRef = doc(this.db, 'pokeprint', 'designs', 'items', design.id || design.name);
                batch.set(designRef, {
                    ...design,
                    source: 'n3d',
                    lastSynced: serverTimestamp(),
                    active: true
                }, { merge: true });
            }

            await batch.commit();
            console.log(`Synced ${designs.length} designs from N3D`);
            return { success: true, count: designs.length };
        } catch (error) {
            console.error('Error syncing designs:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync filaments to Firestore
    async syncFilaments() {
        try {
            const filaments = await this.fetchFilamentsFromN3D();
            const batch = writeBatch(this.db);

            for (const filament of filaments) {
                const filamentRef = doc(this.db, 'pokeprint', 'filaments', 'inventory', filament.id || filament.color);
                
                // Get existing inventory data
                const existingDoc = await getDoc(filamentRef);
                const existingData = existingDoc.exists() ? existingDoc.data() : {};

                batch.set(filamentRef, {
                    ...filament,
                    source: 'n3d',
                    lastSynced: serverTimestamp(),
                    // Preserve existing inventory data
                    currentStock: existingData.currentStock || 0,
                    reorderPoint: existingData.reorderPoint || 100,
                    costPerGram: existingData.costPerGram || 0.013,
                    notes: existingData.notes || ''
                }, { merge: true });
            }

            await batch.commit();
            console.log(`Synced ${filaments.length} filaments from N3D`);
            return { success: true, count: filaments.length };
        } catch (error) {
            console.error('Error syncing filaments:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all designs from Firestore
    async getDesigns() {
        try {
            const designsRef = collection(this.db, 'pokeprint', 'designs', 'items');
            const q = query(designsRef, where('active', '!=', false));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting designs:', error);
            return [];
        }
    }

    // Get all filaments from Firestore
    async getFilaments() {
        try {
            const filamentsRef = collection(this.db, 'pokeprint', 'filaments', 'inventory');
            const snapshot = await getDocs(filamentsRef);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting filaments:', error);
            return [];
        }
    }

    // Get design with filament breakdown
    async getDesignWithFilaments(designId) {
        try {
            const designRef = doc(this.db, 'pokeprint', 'designs', 'items', designId);
            const designDoc = await getDoc(designRef);
            
            if (!designDoc.exists()) {
                return null;
            }

            const design = designDoc.data();
            
            // Get filament details for each color used
            const filamentBreakdown = [];
            if (design.filamentUsage) {
                for (const usage of design.filamentUsage) {
                    const filamentRef = doc(this.db, 'pokeprint', 'filaments', 'inventory', usage.color);
                    const filamentDoc = await getDoc(filamentRef);
                    
                    if (filamentDoc.exists()) {
                        const filament = filamentDoc.data();
                        filamentBreakdown.push({
                            color: usage.color,
                            grams: usage.grams,
                            costPerGram: filament.costPerGram || 0.013,
                            totalCost: usage.grams * (filament.costPerGram || 0.013)
                        });
                    }
                }
            }

            const totalMaterialCost = filamentBreakdown.reduce((sum, f) => sum + f.totalCost, 0);
            
            return {
                ...design,
                filamentBreakdown,
                totalMaterialCost
            };
        } catch (error) {
            console.error('Error getting design with filaments:', error);
            return null;
        }
    }

    // Update filament inventory (subtract used grams)
    async subtractFilament(color, grams) {
        try {
            const filamentRef = doc(this.db, 'pokeprint', 'filaments', 'inventory', color);
            const filamentDoc = await getDoc(filamentRef);
            
            if (!filamentDoc.exists()) {
                throw new Error(`Filament ${color} not found`);
            }

            const currentStock = filamentDoc.data().currentStock || 0;
            const newStock = Math.max(0, currentStock - grams);

            await updateDoc(filamentRef, {
                currentStock: newStock,
                lastUpdated: serverTimestamp()
            });

            return { success: true, newStock };
        } catch (error) {
            console.error('Error subtracting filament:', error);
            return { success: false, error: error.message };
        }
    }

    // Add custom design
    async addCustomDesign(designData) {
        try {
            const designRef = doc(this.db, 'pokeprint', 'designs', 'items', designData.id || designData.name);
            await setDoc(designRef, {
                ...designData,
                source: 'custom',
                createdAt: serverTimestamp(),
                active: true
            });
            return { success: true };
        } catch (error) {
            console.error('Error adding custom design:', error);
            return { success: false, error: error.message };
        }
    }

    // Update design
    async updateDesign(designId, updates) {
        try {
            const designRef = doc(this.db, 'pokeprint', 'designs', 'items', designId);
            await updateDoc(designRef, {
                ...updates,
                lastUpdated: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating design:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete design
    async deleteDesign(designId) {
        try {
            const designRef = doc(this.db, 'pokeprint', 'designs', 'items', designId);
            await deleteDoc(designRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting design:', error);
            return { success: false, error: error.message };
        }
    }

    // Get low stock filaments
    async getLowStockFilaments() {
        try {
            const filamentsRef = collection(this.db, 'pokeprint', 'filaments', 'inventory');
            const snapshot = await getDocs(filamentsRef);
            
            const lowStock = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const currentStock = data.currentStock || 0;
                const reorderPoint = data.reorderPoint || 100;
                
                if (currentStock <= reorderPoint) {
                    lowStock.push({
                        id: doc.id,
                        ...data,
                        deficit: reorderPoint - currentStock
                    });
                }
            });
            
            return lowStock;
        } catch (error) {
            console.error('Error getting low stock filaments:', error);
            return [];
        }
    }

    // Mock designs for development
    getMockDesigns() {
        return [
            {
                id: 'bulbasaur',
                name: 'Bulbasaur',
                description: '3D printed Bulbasaur Pokéball',
                category: 'Standard',
                basePrice: 8,
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
                filamentUsage: [
                    { color: 'Green', grams: 45 },
                    { color: 'Ivory', grams: 30 },
                    { color: 'Red', grams: 5 }
                ],
                totalGrams: 80,
                printTime: 120
            },
            {
                id: 'charmander',
                name: 'Charmander',
                description: '3D printed Charmander Pokéball',
                category: 'Standard',
                basePrice: 8,
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
                filamentUsage: [
                    { color: 'Orange', grams: 50 },
                    { color: 'Ivory', grams: 25 },
                    { color: 'Red', grams: 5 }
                ],
                totalGrams: 80,
                printTime: 120
            },
            {
                id: 'squirtle',
                name: 'Squirtle',
                description: '3D printed Squirtle Pokéball',
                category: 'Standard',
                basePrice: 8,
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
                filamentUsage: [
                    { color: 'Blue', grams: 50 },
                    { color: 'Ivory', grams: 25 },
                    { color: 'Red', grams: 5 }
                ],
                totalGrams: 80,
                printTime: 120
            },
            {
                id: 'pikachu',
                name: 'Pikachu',
                description: '3D printed Pikachu Pokéball',
                category: 'Special',
                basePrice: 12,
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                filamentUsage: [
                    { color: 'Yellow', grams: 55 },
                    { color: 'Ivory', grams: 20 },
                    { color: 'Red', grams: 5 },
                    { color: 'Black', grams: 5 }
                ],
                totalGrams: 85,
                printTime: 135
            },
            {
                id: 'mewtwo',
                name: 'Mewtwo',
                description: '3D printed Mewtwo Pokéball',
                category: 'Legendary',
                basePrice: 10,
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
                filamentUsage: [
                    { color: 'Purple', grams: 60 },
                    { color: 'Ivory', grams: 20 },
                    { color: 'Red', grams: 5 }
                ],
                totalGrams: 85,
                printTime: 140
            }
        ];
    }

    // Mock filaments for development
    getMockFilaments() {
        return [
            { id: 'red', color: 'Red', type: 'PLA', currentStock: 500, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'blue', color: 'Blue', type: 'PLA', currentStock: 450, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'green', color: 'Green', type: 'PLA', currentStock: 80, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'yellow', color: 'Yellow', type: 'PLA', currentStock: 300, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'orange', color: 'Orange', type: 'PLA', currentStock: 200, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'purple', color: 'Purple', type: 'PLA', currentStock: 50, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'ivory', color: 'Ivory', type: 'PLA', currentStock: 1000, reorderPoint: 200, costPerGram: 0.018 },
            { id: 'black', color: 'Black', type: 'PLA', currentStock: 600, reorderPoint: 100, costPerGram: 0.013 },
            { id: 'white', color: 'White', type: 'PLA', currentStock: 800, reorderPoint: 150, costPerGram: 0.018 },
            { id: 'silver', color: 'Silver', type: 'PLA', currentStock: 150, reorderPoint: 50, costPerGram: 0.0135 },
            { id: 'gold', color: 'Gold', type: 'PLA', currentStock: 30, reorderPoint: 50, costPerGram: 0.0135 }
        ];
    }
}

// Export singleton instance
export const n3dSync = new N3DSyncService();

// Default export
export default n3dSync;
