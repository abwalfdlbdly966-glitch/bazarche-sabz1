// ========================================
// STATE MANAGEMENT
// ========================================
let state = {
    currentUser: null,
    products: [],
    savedProducts: [],
    notifications: [],
    theme: 'light',
    currentPage: 'home',
    currentCategory: 'all',
    searchTerm: '',
    filters: {
        minPrice: 0,
        maxPrice: 100000000,
        category: 'all',
        condition: 'all',
        location: ''
    },
    sortBy: 'newest',
    currentPageNum: 1,
    itemsPerPage: 12
};

// ========================================
// INITIAL DATA
// ========================================
const categories = [
    { id: 'الکترونیک', name: 'الکترونیک', icon: 'fa-mobile-alt', color: '#3498db' },
    { id: 'خانه و آشپزخانه', name: 'خانه و آشپزخانه', icon: 'fa-home', color: '#e74c3c' },
    { id: 'مد و پوشاک', name: 'مد و پوشاک', icon: 'fa-tshirt', color: '#9b59b6' },
    { id: 'کتاب', name: 'کتاب و محصولات فرهنگی', icon: 'fa-book', color: '#f39c12' },
    { id: 'خودرو', name: 'خودرو', icon: 'fa-car', color: '#1abc9c' }
];

const sampleProducts = [
    {
        id: 1,
        name: "گوشی سامسونگ گلکسی A54",
        price: 15999000,
        category: "الکترونیک",
        condition: "new",
        desc: "گوشی سامسونگ با 8GB رم و 256GB حافظه",
        location: "تهران",
        address: "تهرانپارس",
        images: ["https://picsum.photos/400/400?random=1"],
        seller: "user1",
        views: 245,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: "مبل راحتی ۳ نفره",
        price: 12800000,
        category: "خانه و آشپزخانه",
        condition: "like_new",
        desc: "مبل شیک و با کیفیت",
        location: "اصفهان",
        address: "خیابان آمادگاه",
        images: ["https://picsum.photos/400/400?random=2"],
        seller: "user2",
        views: 89,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: "کتاب هوش مصنوعی",
        price: 850000,
        category: "کتاب",
        condition: "good",
        desc: "کتاب یادگیری ماشین",
        location: "مشهد",
        address: "دانشگاه فردوسی",
        images: ["https://picsum.photos/400/400?random=3"],
        seller: "user1",
        views: 156,
        createdAt: new Date().toISOString()
    }
];

// ========================================
// UTILITY FUNCTIONS
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatPrice(price) {
    return price.toLocaleString('fa-IR') + ' تومان';
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    modal.style.display = 'block';
    
    const handleConfirm = () => {
        onConfirm();
        modal.style.display = 'none';
        cleanup();
    };
    
    const handleCancel = () => {
        modal.style.display = 'none';
        cleanup();
    };
    
    const cleanup = () => {
        confirmYes.removeEventListener('click', handleConfirm);
        confirmNo.removeEventListener('click', handleCancel);
    };
    
    confirmYes.addEventListener('click', handleConfirm);
    confirmNo.addEventListener('click', handleCancel);
}

// ========================================
// LOCAL STORAGE
// ========================================
function saveToLocalStorage() {
    localStorage.setItem('green_market_products', JSON.stringify(state.products));
    localStorage.setItem('green_market_saved', JSON.stringify(state.savedProducts));
    localStorage.setItem('green_market_user', JSON.stringify(state.currentUser));
    localStorage.setItem('green_market_theme', state.theme);
}

function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('green_market_products');
    if (savedProducts) {
        state.products = JSON.parse(savedProducts);
    } else {
        state.products = JSON.parse(JSON.stringify(sampleProducts));
    }
    
    const savedItems = localStorage.getItem('green_market_saved');
    if (savedItems) {
        state.savedProducts = JSON.parse(savedItems);
    }
    
    const savedUser = localStorage.getItem('green_market_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateUserUI();
    } else {
        state.currentUser = {
            id: 'user1',
            name: 'کاربر نمونه',
            email: 'user@example.com',
            phone: '09123456789',
            address: 'تهران، خیابان آزادی',
            avatar: null,
            joinedAt: new Date().toISOString()
        };
        updateUserUI();
    }
    
    const savedTheme = localStorage.getItem('green_market_theme');
    if (savedTheme) {
        state.theme = savedTheme;
        applyTheme();
    }
}

// ========================================
// USER MANAGEMENT
// ========================================
function updateUserUI() {
    if (state.currentUser) {
        const avatarUrl = state.currentUser.avatar || `https://ui-avatars.com/api/?background=2ecc71&color=fff&name=${state.currentUser.name}&rounded=true`;
        const profileAvatar = document.getElementById('profileAvatar');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarName = document.getElementById('sidebarName');
        const sidebarEmail = document.getElementById('sidebarEmail');
        
        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
        if (sidebarName) sidebarName.textContent = state.currentUser.name;
        if (sidebarEmail) sidebarEmail.textContent = state.currentUser.email || 'user@example.com';
        
        const userProducts = state.products.filter(p => p.seller === state.currentUser.id);
        const totalProductsElem = document.getElementById('totalProducts');
        const totalViewsElem = document.getElementById('totalViews');
        const totalSalesElem = document.getElementById('totalSales');
        
        if (totalProductsElem) totalProductsElem.textContent = userProducts.length;
        if (totalViewsElem) totalViewsElem.textContent = userProducts.reduce((sum, p) => sum + (p.views || 0), 0);
        if (totalSalesElem) totalSalesElem.textContent = userProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString();
    }
}

function logout() {
    state.currentUser = null;
    saveToLocalStorage();
    updateUserUI();
    showToast('از حساب خارج شدید');
    state.currentPage = 'home';
    renderPage();
}

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
let uploadedImages = [];

function addProduct(productData) {
    const newProduct = {
        id: Date.now(),
        ...productData,
        seller: state.currentUser?.id || 'guest',
        views: 0,
        createdAt: new Date().toISOString()
    };
    state.products.unshift(newProduct);
    saveToLocalStorage();
    showToast('محصول با موفقیت ثبت شد');
    renderProducts();
    closeModal('productModal');
}

function deleteProduct(productId) {
    showConfirm('حذف محصول', 'آیا از حذف این محصول مطمئن هستید؟', () => {
        state.products = state.products.filter(p => p.id !== productId);
        saveToLocalStorage();
        showToast('محصول حذف شد');
        renderProducts();
        const detailModal = document.getElementById('productDetailModal');
        if (detailModal) detailModal.style.display = 'none';
    });
}

function toggleSaveProduct(productId) {
    const index = state.savedProducts.indexOf(productId);
    if (index === -1) {
        state.savedProducts.push(productId);
        showToast('به لیست ذخیره شده اضافه شد');
    } else {
        state.savedProducts.splice(index, 1);
        showToast('از لیست ذخیره شده حذف شد');
    }
    saveToLocalStorage();
    renderProducts();
}

function isSaved(productId) {
    return state.savedProducts.includes(productId);
}

// ========================================
// RENDER FUNCTIONS
// ========================================
function productCardTemplate(product) {
    return `
        <div class="product-card fade-in-up" data-id="${product.id}">
            ${state.currentUser && product.seller === state.currentUser.id ? `
                <button class="delete-btn" onclick="event.stopPropagation(); deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
            <div class="product-image" onclick="viewProduct(${product.id})">
                <img src="${product.images[0] || 'https://picsum.photos/400/400'}" alt="${product.name}">
            </div>
            <div class="product-info" onclick="viewProduct(${product.id})">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> ${product.location}
                </div>
            </div>
        </div>
    `;
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card fade-in-up" data-category="${cat.id}">
            <i class="fas ${cat.icon}" style="color: ${cat.color}"></i>
            <h3>${cat.name}</h3>
            <p>${state.products.filter(p => p.category === cat.id).length} محصول</p>
        </div>
    `).join('');
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            state.currentCategory = card.dataset.category;
            state.currentPage = 'products';
            renderPage();
        });
    });
}

function getFilteredProducts() {
    let filtered = [...state.products];
    
    if (state.searchTerm) {
        filtered = filtered.filter(p => 
            p.name.includes(state.searchTerm) || 
            (p.desc && p.desc.includes(state.searchTerm)) ||
            p.location.includes(state.searchTerm)
        );
    }
    
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === state.currentCategory);
    }
    
    filtered = filtered.filter(p => 
        p.price >= state.filters.minPrice && 
        p.price <= state.filters.maxPrice
    );
    
    if (state.filters.condition !== 'all') {
        filtered = filtered.filter(p => p.condition === state.filters.condition);
    }
    
    if (state.filters.location) {
        filtered = filtered.filter(p => p.location.includes(state.filters.location));
    }
    
    return filtered;
}

function sortProducts(products) {
    const sorted = [...products];
    switch (state.sortBy) {
        case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
        case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
        case 'newest': return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'popular': return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        default: return sorted;
    }
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const container = document.getElementById('pagination');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(`<button class="${i === state.currentPageNum ? 'active' : ''}" data-page="${i}">${i}</button>`);
    }
    
    container.innerHTML = pages.join('');
    
    document.querySelectorAll('#pagination button').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentPageNum = parseInt(btn.dataset.page);
            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function renderProducts(productsToRender = null) {
    const grid = document.getElementById('productsGrid');
    const featuredGrid = document.getElementById('featuredProducts');
    const myProductsGrid = document.getElementById('myProductsGrid');
    const savedProductsGrid = document.getElementById('savedProductsGrid');
    
    let products = productsToRender || getFilteredProducts();
    products = sortProducts(products);
    
    const start = (state.currentPageNum - 1) * state.itemsPerPage;
    const paginatedProducts = products.slice(start, start + state.itemsPerPage);
    
    const productHTML = paginatedProducts.map(product => productCardTemplate(product)).join('');
    
    if (grid) grid.innerHTML = productHTML || '<div class="no-products">محصولی یافت نشد</div>';
    if (featuredGrid && !productsToRender) {
        featuredGrid.innerHTML = products.slice(0, 4).map(p => productCardTemplate(p)).join('');
    }
    if (myProductsGrid && state.currentUser) {
        const myProducts = state.products.filter(p => p.seller === state.currentUser.id);
        myProductsGrid.innerHTML = myProducts.map(p => productCardTemplate(p)).join('');
    }
    if (savedProductsGrid) {
        const saved = state.products.filter(p => state.savedProducts.includes(p.id));
        savedProductsGrid.innerHTML = saved.map(p => productCardTemplate(p)).join('');
    }
    
    renderPagination(products.length);
}

function renderPage() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    const activePage = document.getElementById(`${state.currentPage}Page`);
    if (activePage) activePage.classList.add('active-page');
    
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === state.currentPage) link.classList.add('active');
    });
    
    switch (state.currentPage) {
        case 'home':
            renderCategories();
            renderProducts(getFilteredProducts().slice(0, 8));
            break;
        case 'products':
        case 'dashboard':
        case 'saved':
            renderProducts();
            break;
    }
}

// ========================================
// PRODUCT DETAIL VIEW
// ========================================
function viewProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    product.views = (product.views || 0) + 1;
    saveToLocalStorage();
    
    const modal = document.getElementById('productDetailModal');
    modal.innerHTML = `
        <div class="product-detail-content">
            <div style="padding: 20px; text-align: right;">
                <button onclick="closeModal('productDetailModal')" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; float: left;">&times;</button>
                <div style="clear: both;"></div>
            </div>
            <div class="product-detail-info" style="padding: 30px;">
                <h1>${product.name}</h1>
                <div class="product-detail-price">${formatPrice(product.price)}</div>
                <div><i class="fas fa-tag"></i> ${product.category}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${product.location}</div>
                <div><i class="fas fa-eye"></i> ${product.views || 0} بازدید</div>
                <p style="margin-top: 20px;">${product.desc || 'توضیحاتی ثبت نشده است.'}</p>
                <div class="product-detail-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="detail-chat-btn" onclick="showToast('در حال اتصال...')">گفتگو</button>
                    <button class="detail-save-btn" onclick="toggleSaveProduct(${product.id}); viewProduct(${product.id});">ذخیره</button>
                </div>
                ${state.currentUser && product.seller === state.currentUser.id ? `
                    <button class="delete-product-btn" onclick="deleteProduct(${product.id});">حذف محصول</button>
                ` : ''}
            </div>
        </div>
    `;
    modal.style.display = 'block';
    window.currentDetailProductId = productId;
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ========================================
// THEME MANAGEMENT
// ========================================
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveToLocalStorage();
}

function applyTheme() {
    if (state.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// ========================================
// SLIDER
// ========================================
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const slider = document.getElementById('slider');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!slider || slides.length === 0) return;
    
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
        resetAutoSlide();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        goToSlide((currentSlide + 1) % slides.length);
        resetAutoSlide();
    });
    
    function goToSlide(index) {
        currentSlide = index;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    function resetAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            goToSlide((currentSlide + 1) % slides.length);
        }, 5000);
    }
    
    resetAutoSlide();
    window.goToSlide = goToSlide;
}

// ========================================
// IMAGE UPLOAD
// ========================================
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('productImages');
    
    if (!uploadArea) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedImages.push(event.target.result);
                    renderImagePreviews();
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;
    
    container.innerHTML = uploadedImages.map((img, index) => `
        <div class="image-preview">
            <img src="${img}" width="80" height="80" style="object-fit: cover;">
            <button onclick="removeImage(${index})">x</button>
        </div>
    `).join('');
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
}

// ========================================
// BOTTOM NAVIGATION
// ========================================
let lastScrollTop = 0;

function initBottomNav() {
    const bottomNav = document.getElementById('mobileBottomNav');
    bottomNav.innerHTML = `
        <button class="bottom-nav-item" data-page="home"><i class="fas fa-home"></i><span>خانه</span></button>
        <button class="bottom-nav-item" data-page="products"><i class="fas fa-store"></i><span>محصولات</span></button>
        <button class="bottom-nav-item fab-add-btn" id="fabAddBtn"><i class="fas fa-plus"></i></button>
        <button class="bottom-nav-item" data-page="dashboard"><i class="fas fa-chart-line"></i><span>داشبورد</span></button>
        <button class="bottom-nav-item" id="bottomProfileBtn"><i class="fas fa-user"></i><span>پروفایل</span></button>
    `;
    
    window.addEventListener('scroll', () => {
        const st = window.pageYOffset;
        if (st > lastScrollTop && st > 100) {
            bottomNav.classList.remove('show');
        } else if (st < lastScrollTop || st < 50) {
            bottomNav.classList.add('show');
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });
    
    setTimeout(() => bottomNav.classList.add('show'), 500);
    
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            state.currentPage = item.dataset.page;
            state.currentPageNum = 1;
            renderPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    const fabBtn = document.getElementById('fabAddBtn');
    if (fabBtn) {
        fabBtn.addEventListener('click', () => {
            if (state.currentUser) openModal('productModal');
            else showToast('لطفاً وارد شوید', 'error');
        });
    }
    
    const bottomProfileBtn = document.getElementById('bottomProfileBtn');
    if (bottomProfileBtn) {
        bottomProfileBtn.addEventListener('click', () => showProfileDetail());
    }
}

// ========================================
// VOICE SEARCH
// ========================================
function initVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearch');
    if (!voiceBtn) return;
    
    voiceBtn.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'fa-IR';
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = transcript;
                    state.searchTerm = transcript;
                    state.currentPageNum = 1;
                    renderProducts();
                }
            };
            recognition.start();
            showToast('در حال گوش دادن...');
        } else {
            showToast('مرورگر پشتیبانی نمی‌کند', 'error');
        }
    });
}

// ========================================
// FILTERS
// ========================================
function setupFilters() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const minPriceVal = document.getElementById('minPriceVal');
    const maxPriceVal = document.getElementById('maxPriceVal');
    const categoryFilter = document.getElementById('categoryFilter');
    const conditionFilter = document.getElementById('conditionFilter');
    const locationFilter = document.getElementById('locationFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    if (priceMin) {
        priceMin.addEventListener('input', (e) => {
            state.filters.minPrice = parseInt(e.target.value);
            if (minPriceVal) minPriceVal.textContent = state.filters.minPrice.toLocaleString();
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    if (priceMax) {
        priceMax.addEventListener('input', (e) => {
            state.filters.maxPrice = parseInt(e.target.value);
            if (maxPriceVal) maxPriceVal.textContent = state.filters.maxPrice.toLocaleString();
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    if (conditionFilter) {
        conditionFilter.addEventListener('change', (e) => {
            state.filters.condition = e.target.value;
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('input', (e) => {
            state.filters.location = e.target.value;
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            state.filters = {
                minPrice: 0,
                maxPrice: 100000000,
                category: 'all',
                condition: 'all',
                location: ''
            };
            if (priceMin) priceMin.value = 0;
            if (priceMax) priceMax.value = 100000000;
            if (minPriceVal) minPriceVal.textContent = '۰';
            if (maxPriceVal) maxPriceVal.textContent = '۱۰۰ میلیون';
            if (categoryFilter) categoryFilter.value = 'all';
            if (conditionFilter) conditionFilter.value = 'all';
            if (locationFilter) locationFilter.value = '';
            state.currentPageNum = 1;
            renderProducts();
            showToast('فیلترها بازنشانی شدند');
        });
    }
    
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.filter-sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        });
    }
}

// ========================================
// SIDEBAR & PROFILE
// ========================================
function initSidebar() {
    const profileBtn = document.getElementById('profileBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
    
    const sidebarProfileBtn = document.getElementById('sidebarProfileBtn');
    if (sidebarProfileBtn) {
        sidebarProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showProfileDetail();
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
    
    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentPage = link.dataset.page;
            renderPage();
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    });
}

function showProfileDetail() {
    if (!state.currentUser) {
        showToast('لطفاً وارد شوید', 'error');
        return;
    }
    
    alert(`پروفایل کاربر: ${state.currentUser.name}\nایمیل: ${state.currentUser.email}\nتلفن: ${state.currentUser.phone}`);
}

// ========================================
// EVENT LISTENERS
// ========================================
function initEventListeners() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentPage = link.dataset.page;
            state.currentPageNum = 1;
            renderPage();
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            state.currentPageNum = 1;
            renderProducts();
        });
    }
    
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => openModal('productModal'));
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) notifBtn.addEventListener('click', () => openModal('notificationModal'));
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!state.currentUser) {
                showToast('برای ثبت محصول وارد شوید', 'error');
                return;
            }
            
            const newProduct = {
                name: document.getElementById('productName').value,
                price: parseInt(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                condition: document.getElementById('productCondition').value,
                desc: document.getElementById('productDesc').value,
                location: document.getElementById('productLocation').value,
                address: document.getElementById('productAddress').value,
                images: uploadedImages.length > 0 ? uploadedImages : ['https://picsum.photos/400/400']
            };
            
            if (!newProduct.name || !newProduct.price || !newProduct.location) {
                showToast('فیلدهای ضروری را پر کنید', 'error');
                return;
            }
            
            addProduct(newProduct);
            productForm.reset();
            uploadedImages = [];
            renderImagePreviews();
        });
    }
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initEventListeners();
    initSlider();
    initVoiceSearch();
    initImageUpload();
    initSidebar();
    initBottomNav();
    setupFilters();
    renderPage();
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.style.display = 'none';
    }, 1500);
});

// Global functions
window.deleteProduct = deleteProduct;
window.toggleSaveProduct = toggleSaveProduct;
window.viewProduct = viewProduct;
window.removeImage = removeImage;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.showProfileDetail = showProfileDetail;
window.showToast = showToast;
