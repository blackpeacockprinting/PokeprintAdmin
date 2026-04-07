// Pokemon Data
const pokemonData = [
    { id: 1, name: 'Bulbasaur', type: 'grass', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
    { id: 2, name: 'Ivysaur', type: 'grass', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png' },
    { id: 3, name: 'Venusaur', type: 'grass', category: 'Mega', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png' },
    { id: 4, name: 'Charmander', type: 'fire', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
    { id: 5, name: 'Charmeleon', type: 'fire', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png' },
    { id: 6, name: 'Charizard', type: 'fire', category: 'Mega', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
    { id: 7, name: 'Squirtle', type: 'water', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
    { id: 8, name: 'Wartortle', type: 'water', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png' },
    { id: 9, name: 'Blastoise', type: 'water', category: 'Mega', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png' },
    { id: 25, name: 'Pikachu', type: 'electric', category: 'Special', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { id: 26, name: 'Raichu', type: 'electric', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png' },
    { id: 133, name: 'Eevee', type: 'normal', category: 'Special', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' },
    { id: 134, name: 'Vaporeon', type: 'water', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png' },
    { id: 135, name: 'Jolteon', type: 'electric', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png' },
    { id: 136, name: 'Flareon', type: 'fire', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png' },
    { id: 196, name: 'Espeon', type: 'psychic', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png' },
    { id: 197, name: 'Umbreon', type: 'dark', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png' },
    { id: 150, name: 'Mewtwo', type: 'psychic', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png' },
    { id: 151, name: 'Mew', type: 'psychic', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png' },
    { id: 384, name: 'Rayquaza', type: 'dragon', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png' },
    { id: 483, name: 'Dialga', type: 'steel', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/483.png' },
    { id: 484, name: 'Palkia', type: 'water', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/484.png' },
    { id: 487, name: 'Giratina', type: 'ghost', category: 'Legendary', price: 10, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/487.png' },
    { id: 94, name: 'Gengar', type: 'ghost', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png' },
    { id: 65, name: 'Alakazam', type: 'psychic', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png' },
    { id: 68, name: 'Machamp', type: 'fighting', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png' },
    { id: 130, name: 'Gyarados', type: 'water', category: 'Mega', price: 12, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png' },
    { id: 149, name: 'Dragonite', type: 'dragon', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png' },
    { id: 448, name: 'Lucario', type: 'fighting', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png' },
    { id: 445, name: 'Garchomp', type: 'dragon', category: 'Standard', price: 8, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png' },
    { id: 0, name: 'Mystery Pokéball', type: 'normal', category: 'Mystery', price: 6, image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }
];

// Type Colors
const typeColors = {
    fire: '#EF4444',
    water: '#3B82F6',
    electric: '#EAB308',
    grass: '#22C55E',
    ice: '#06B6D4',
    fighting: '#DC2626',
    poison: '#A855F7',
    ground: '#D97706',
    flying: '#8B5CF6',
    psychic: '#EC4899',
    bug: '#65A30D',
    rock: '#78716C',
    ghost: '#7C3AED',
    dragon: '#4F46E5',
    dark: '#374151',
    steel: '#6B7280',
    fairy: '#F472B6',
    normal: '#9CA3AF'
};

// State
let cart = JSON.parse(localStorage.getItem('pokeprint_cart')) || [];
let team = JSON.parse(localStorage.getItem('pokeprint_team')) || [];
let activeTypeFilter = 'all';
let searchQuery = '';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const typeFilters = document.getElementById('typeFilters');
const searchInput = document.getElementById('searchInput');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const headerCheckoutBtn = document.getElementById('headerCheckoutBtn');
const subtotalEl = document.getElementById('subtotal');
const discountRow = document.getElementById('discountRow');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const resultsCount = document.getElementById('resultsCount');
const teamSlots = document.querySelectorAll('.team-slot');
const teamProgress = document.getElementById('teamProgress');
const teamCount = document.getElementById('teamCount');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

// Initialize
function init() {
    renderTypeFilters();
    renderProducts();
    updateCartUI();
    updateTeamUI();
    setupEventListeners();
}

// Render Type Filters
function renderTypeFilters() {
    const types = ['all', ...new Set(pokemonData.map(p => p.type))];
    typeFilters.innerHTML = types.map(type => `
        <button class="type-btn ${type === 'all' ? 'active' : ''}" 
                data-type="${type}"
                style="background: ${type === 'all' ? '#404040' : typeColors[type]}; color: white;">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
    `).join('');
}

// Render Products
function renderProducts() {
    let filtered = pokemonData;
    
    if (activeTypeFilter !== 'all') {
        filtered = filtered.filter(p => p.type === activeTypeFilter);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    resultsCount.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    
    productGrid.innerHTML = filtered.map(pokemon => `
        <div class="product-card ${pokemon.category === 'Mystery' ? 'mystery-card' : ''}" data-id="${pokemon.id}">
            <div class="product-image">
                <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
                <span class="product-type" style="background: ${typeColors[pokemon.type]}">
                    ${pokemon.type}
                </span>
                <span class="product-category">${pokemon.category}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${pokemon.name}</h3>
                <p class="product-price">$${pokemon.price}</p>
                <button class="add-to-cart" data-id="${pokemon.id}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Type filter clicks
    typeFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('type-btn')) {
            document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            activeTypeFilter = e.target.dataset.type;
            renderProducts();
        }
    });
    
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });
    
    // Add to cart clicks
    productGrid.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            const id = parseInt(addBtn.dataset.id);
            addToCart(id);
        }
        
        // Also handle clicking on product card to add to team
        const card = e.target.closest('.product-card');
        if (card && !addBtn) {
            const id = parseInt(card.dataset.id);
            toggleTeamMember(id);
        }
    });
    
    // Cart drawer
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // Checkout buttons
    checkoutBtn.addEventListener('click', proceedToCheckout);
    headerCheckoutBtn.addEventListener('click', proceedToCheckout);
    
    // Cart item actions
    cartItems.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.qty-btn');
        const removeBtn = e.target.closest('.remove-item');
        
        if (qtyBtn) {
            const id = parseInt(qtyBtn.dataset.id);
            const change = parseInt(qtyBtn.dataset.change);
            updateQuantity(id, change);
        }
        
        if (removeBtn) {
            const id = parseInt(removeBtn.dataset.id);
            removeFromCart(id);
        }
    });
    
    // Bundle deals
    document.querySelectorAll('.bundle-item').forEach(bundle => {
        bundle.addEventListener('click', () => {
            addBundleToCart(bundle.dataset.bundle);
        });
    });
}

// Add to Cart
function addToCart(id) {
    const pokemon = pokemonData.find(p => p.id === id);
    if (!pokemon) return;
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: pokemon.id,
            name: pokemon.name,
            price: pokemon.price,
            image: pokemon.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${pokemon.name} added to cart!`);
}

// Add Bundle to Cart
function addBundleToCart(bundleType) {
    const bundles = {
        starter: [1, 4, 7], // Bulbasaur, Charmander, Squirtle
        eevee: [133, 134, 135, 136, 196], // Eevee + evolutions
        legendary: [150, 384, 483] // Mewtwo, Rayquaza, Dialga
    };
    
    const bundleIds = bundles[bundleType];
    if (!bundleIds) return;
    
    bundleIds.forEach(id => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const pokemon = pokemonData.find(p => p.id === id);
            if (pokemon) {
                cart.push({
                    id: pokemon.id,
                    name: pokemon.name,
                    price: pokemon.price,
                    image: pokemon.image,
                    quantity: 1
                });
            }
        }
    });
    
    saveCart();
    updateCartUI();
    showToast('Bundle added to cart!');
}

// Update Quantity
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }
    
    saveCart();
    updateCartUI();
}

// Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

// Save Cart
function saveCart() {
    localStorage.setItem('pokeprint_cart', JSON.stringify(cart));
}

// Update Cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p>Your cart is empty</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Add some Pokéballs!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${item.price}</p>
                    <div class="cart-item-actions">
                        <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const uniqueItems = cart.length;
    const teamDiscount = uniqueItems >= 6 ? subtotal * 0.15 : 0;
    const total = subtotal - teamDiscount;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    if (teamDiscount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-$${teamDiscount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    totalEl.textContent = `$${total.toFixed(2)}`;
}

// Toggle Team Member
function toggleTeamMember(id) {
    const index = team.indexOf(id);
    if (index > -1) {
        team.splice(index, 1);
    } else if (team.length < 6) {
        team.push(id);
    } else {
        showToast('Team is full! Remove a Pokémon first.');
        return;
    }
    
    localStorage.setItem('pokeprint_team', JSON.stringify(team));
    updateTeamUI();
}

// Update Team UI
function updateTeamUI() {
    teamSlots.forEach((slot, index) => {
        const pokemonId = team[index];
        if (pokemonId) {
            const pokemon = pokemonData.find(p => p.id === pokemonId);
            slot.innerHTML = `<img src="${pokemon.image}" alt="${pokemon.name}">`;
            slot.classList.add('filled');
        } else {
            slot.textContent = '+';
            slot.classList.remove('filled');
        }
    });
    
    const progress = (team.length / 6) * 100;
    teamProgress.style.width = `${progress}%`;
    teamCount.textContent = team.length;
}

// Open/Close Cart
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    // Save cart to localStorage (already done, but ensure it's there)
    saveCart();
    
    // Navigate to checkout
    window.location.href = 'checkout.html';
}

// Show Toast
function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Initialize app
init();
