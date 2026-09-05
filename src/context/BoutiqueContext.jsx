import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
  uploadFile,
} from '../api/client';

const DEFAULT_SETTINGS = {
  whatsapp_number: '917382891980',
  razorpay_payment_link: 'https://rzp.io/l/buttabomma',
  upi_id: 'buttabomma@upi',
  cod_enabled: 1,
  upi_enabled: 1,
  logo_url: '/logo.png',
};

const PRICE_TIERS = [
  { id: 'all', title: 'All Prices', desc: 'Complete Range' },
  { id: 'under1000', title: 'Under ₹1,000', desc: 'Everyday Luxury' },
  { id: '1000to3000', title: '₹1,000 – ₹3,000', desc: 'Kurtis & Sets' },
  { id: '3000to7000', title: '₹3,000 – ₹7,000', desc: 'Silk Sarees' },
  { id: 'above15000', title: 'Above ₹15,000', desc: 'Bridal Couture' },
];

const BoutiqueContext = createContext(null);

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem('bb_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Normalize product.sizes from DB (JSON array, CSV, or space-separated string). */
export function normalizeSizes(sizes) {
  if (Array.isArray(sizes) && sizes.length) return sizes;
  if (typeof sizes === 'string' && sizes.trim()) {
    try {
      const parsed = JSON.parse(sizes);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      /* not JSON */
    }
    if (sizes.includes(',')) {
      return sizes.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const parts = sizes.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) return parts;
    return [sizes.trim()];
  }
  return ['Standard'];
}

export function BoutiqueProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storeSettings, setStoreSettings] = useState(DEFAULT_SETTINGS);
  const [cart, setCart] = useState(() => loadCartFromStorage());
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriceTier, setActivePriceTier] = useState('all');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModalSize, setSelectedModalSize] = useState('Standard');
  const [editingHeroSlide, setEditingHeroSlide] = useState(null);
  const [currentAdminTab, setCurrentAdminTab] = useState('overview');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modals, setModals] = useState({
    productDetailModal: false,
    checkoutModal: false,
    writeReviewModal: false,
    orderSuccessModal: false,
    accountModal: false,
    adminLoginModal: false,
    heroSlideModal: false,
    adminDashboardModal: false,
  });
  const [loading, setLoading] = useState(true);

  const openModal = useCallback((name) => {
    setModals((prev) => ({ ...prev, [name]: true }));
  }, []);

  const closeModal = useCallback((name) => {
    setModals((prev) => ({ ...prev, [name]: false }));
  }, []);

  const persistCart = useCallback((next) => {
    setCart(next);
    localStorage.setItem('bb_cart', JSON.stringify(next));
  }, []);

  const fetchStoreSettings = useCallback(async () => {
    try {
      const data = await apiGet('/api/settings');
      if (data.success && data.settings) {
        setStoreSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (err) {
      console.warn('Using default store settings:', err.message);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiGet('/api/products');
      if (data.success) setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, []);

  const fetchHeroSlides = useCallback(async () => {
    try {
      const data = await apiGet('/api/hero-slides');
      if (data.success && data.slides?.length) setHeroSlides(data.slides);
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiGet('/api/categories');
      if (data.success) setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await apiGet('/api/reviews');
      if (data.success) {
        setReviews(data.reviews || []);
        setActiveReviewIndex(0);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchStoreSettings(),
        fetchHeroSlides(),
        fetchCategories(),
        fetchProducts(),
        fetchReviews(),
      ]);
      setLoading(false);
    })();
  }, [fetchStoreSettings, fetchHeroSlides, fetchCategories, fetchProducts, fetchReviews]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === '8' || e.key === '*' || e.code === 'Digit8' || e.code === 'Numpad8')) {
        e.preventDefault();
        openModal('adminLoginModal');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openModal]);

  const openAdminDashboard = useCallback(() => {
    openModal('adminDashboardModal');
  }, [openModal]);

  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin') {
        if (getAdminToken()) openAdminDashboard();
        else openModal('adminLoginModal');
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [openAdminDashboard, openModal]);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'all' && p.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (activePriceTier === 'under1000' && p.price >= 1000) return false;
      if (activePriceTier === '1000to3000' && (p.price < 1000 || p.price > 3000)) return false;
      if (activePriceTier === '3000to7000' && (p.price < 3000 || p.price > 7000)) return false;
      if (activePriceTier === '7000to15000' && (p.price < 7000 || p.price > 15000)) return false;
      if (activePriceTier === 'above15000' && p.price <= 15000) return false;
      return true;
    });
  }, [products, activeCategory, activePriceTier]);

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        (p.fabric && p.fabric.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const filterStatusText = useMemo(() => {
    let text = `Showing ${activeCategory === 'all' ? 'All Masterpieces' : activeCategory.toUpperCase()}`;
    if (activePriceTier !== 'all') text += ` • Price Filter: ${activePriceTier}`;
    return text;
  }, [activeCategory, activePriceTier]);

  const filterCategory = useCallback((cat) => {
    setActiveCategory(cat);
  }, []);

  const setPriceTier = useCallback((tier) => {
    setActivePriceTier(tier);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveCategory('all');
    setActivePriceTier('all');
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback(
    (productId, size = 'Standard') => {
      const product = products.find((p) => p.id === productId);
      if (!product || product.stock <= 0) return;

      setCart((prev) => {
        const existing = prev.find((item) => item.id === productId && item.size === size);
        let next;
        if (existing) {
          if (existing.qty < product.stock) {
            next = prev.map((item) =>
              item.id === productId && item.size === size ? { ...item, qty: item.qty + 1 } : item
            );
          } else {
            alert(`Only ${product.stock} units of ${product.name} are available in stock.`);
            return prev;
          }
        } else {
          next = [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              size,
              qty: 1,
            },
          ];
        }
        localStorage.setItem('bb_cart', JSON.stringify(next));
        return next;
      });
    },
    [products]
  );

  const updateCartQty = useCallback(
    (productId, size, delta) => {
      const product = products.find((p) => p.id === productId);
      setCart((prev) => {
        let next = prev
          .map((item) => {
            if (item.id !== productId || item.size !== size) return item;
            let qty = item.qty + delta;
            if (product && qty > product.stock) {
              alert(`Only ${product.stock} units available.`);
              qty = product.stock;
            }
            return { ...item, qty };
          })
          .filter((item) => item.qty > 0);
        localStorage.setItem('bb_cart', JSON.stringify(next));
        return next;
      });
    },
    [products]
  );

  const addToCartDirect = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId);
      const size = normalizeSizes(product?.sizes)[0];
      addToCart(productId, size);
      openCart();
    },
    [products, addToCart, openCart]
  );

  const openProductDetail = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const sizes = normalizeSizes(product.sizes);
      setSelectedProduct(product);
      setSelectedModalSize(sizes[0] || 'Standard');
      openModal('productDetailModal');
      setSearchOpen(false);
    },
    [products, openModal]
  );

  const addToCartFromModal = useCallback(() => {
    if (!selectedProduct) return;
    addToCart(selectedProduct.id, selectedModalSize);
    closeModal('productDetailModal');
    openCart();
  }, [selectedProduct, selectedModalSize, addToCart, closeModal, openCart]);

  const openCheckoutModal = useCallback(() => {
    if (!cart.length) {
      alert('Your shopping bag is empty!');
      return;
    }
    closeCart();
    openModal('checkoutModal');
  }, [cart.length, closeCart, openModal]);

  const handleCheckoutSubmit = useCallback(
    async (formData) => {
      if (!cart.length) {
        alert('Cart is empty.');
        return;
      }
      try {
        const data = await apiPost('/api/orders', {
          customer_name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          payment_method: formData.paymentMethod,
          notes: formData.notes,
          items: cart,
        });
        if (!data.success) {
          alert(data.error || 'Failed to place order.');
          return;
        }
        setLastCreatedOrder(data.order);
        persistCart([]);
        closeModal('checkoutModal');
        openModal('orderSuccessModal');
        await fetchProducts();
      } catch (err) {
        alert('Failed to connect to server: ' + err.message);
      }
    },
    [cart, persistCart, closeModal, openModal, fetchProducts]
  );

  const openWhatsAppInquiry = useCallback(
    (message) => {
      const num = storeSettings.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number;
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    },
    [storeSettings.whatsapp_number]
  );

  const sendWhatsAppReceipt = useCallback(() => {
    if (!lastCreatedOrder) return;
    const num = storeSettings.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number;
    const itemsText = (lastCreatedOrder.items || [])
      .map((i) => `• ${i.name} (Size: ${i.size}, Qty: ${i.qty}) - ₹${i.price * i.qty}`)
      .join('%0A');
    const msg =
      `👑 *BUTTA BOMMA COLLECTIONS - ORDER CONFIRMATION*%0A%0A` +
      `*Order Number:* #${lastCreatedOrder.order_number}%0A` +
      `*Customer Name:* ${lastCreatedOrder.customer_name}%0A` +
      `*Mobile:* ${lastCreatedOrder.mobile}%0A` +
      `*City/Address:* ${lastCreatedOrder.address}, ${lastCreatedOrder.city} - ${lastCreatedOrder.pincode}%0A` +
      `*Payment Method:* ${lastCreatedOrder.payment_method}%0A` +
      (lastCreatedOrder.cod_advance ? `*COD Advance:* ₹${lastCreatedOrder.cod_advance}%0A` : '') +
      `*Total Amount:* ₹${lastCreatedOrder.total_amount}%0A%0A` +
      `*Items:*%0A${itemsText}%0A%0A` +
      `Please confirm my piece dispatch and send courier tracking. Thank you!`;
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  }, [lastCreatedOrder, storeSettings.whatsapp_number]);

  const orderCartOnWhatsApp = useCallback(() => {
    if (!cart.length) return;
    const num = storeSettings.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number;
    const itemsText = cart
      .map((i) => `• ${i.name} (Size: ${i.size}, Qty: ${i.qty}) - ₹${i.price * i.qty}`)
      .join('%0A');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const msg =
      `👑 *BUTTA BOMMA - BAG ORDER INQUIRY*%0A%0A` +
      `Hello Butta Bomma, I would like to place an order for the following pieces:%0A%0A` +
      `${itemsText}%0A%0A` +
      `*Total Value:* ₹${total}%0A` +
      `Please assist me with sizing and delivery!`;
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  }, [cart, storeSettings.whatsapp_number]);

  const lookupCustomerOrders = useCallback(async (mobile) => {
    if (String(mobile).replace(/\D/g, '').length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return null;
    }
    try {
      const data = await apiPost('/api/orders/lookup', { mobile });
      return data.orders || [];
    } catch (err) {
      alert('Lookup failed: ' + err.message);
      return null;
    }
  }, []);

  const triggerStackNext = useCallback(() => {
    setActiveReviewIndex((prev) => (reviews.length ? (prev + 1) % reviews.length : 0));
  }, [reviews.length]);

  const handleReviewSubmit = useCallback(
    async (payload) => {
      try {
        const data = await apiPost('/api/reviews', payload);
        if (data.success) {
          alert(data.message);
          closeModal('writeReviewModal');
          await fetchReviews();
        }
      } catch (err) {
        alert('Failed to submit review: ' + err.message);
      }
    },
    [closeModal, fetchReviews]
  );

  const handleReviewMediaUpload = useCallback(async (file) => {
    if (!file) return null;
    try {
      const data = await uploadFile(file);
      if (data.success) {
        return { url: data.url, isVideo: file.type.startsWith('video') };
      }
    } catch {
      /* fallback to data URL */
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target.result, isVideo: file.type.startsWith('video') });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleAdminLogin = useCallback(
    async (username, password) => {
      try {
        const data = await apiPost('/api/auth/login', { username, password });
        if (!data.success) {
          alert(data.error || 'Invalid credentials.');
          return false;
        }
        setAdminToken(data.token);
        closeModal('adminLoginModal');
        openAdminDashboard();
        return true;
      } catch (err) {
        alert('Login connection error: ' + err.message);
        return false;
      }
    },
    [closeModal, openAdminDashboard]
  );

  const logoutAdmin = useCallback(() => {
    clearAdminToken();
    closeModal('adminDashboardModal');
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    alert('You have logged out of the Atelier Control Room.');
  }, [closeModal]);

  const switchAdminTab = useCallback((tabName) => {
    setCurrentAdminTab(tabName);
  }, []);

  const openAddHeroModal = useCallback(() => {
    setEditingHeroSlide({
      id: null,
      label: '',
      link: '#categories',
      sort_order: heroSlides.length + 1,
      image_url: '',
    });
    openModal('heroSlideModal');
  }, [heroSlides.length, openModal]);

  const openEditHeroModal = useCallback(
    (id) => {
      const slide = heroSlides.find((s) => s.id === id);
      if (!slide) return;
      setEditingHeroSlide({ ...slide });
      openModal('heroSlideModal');
    },
    [heroSlides, openModal]
  );

  const handleHeroSlideSave = useCallback(
    async (form) => {
      const { editId, label, link, sort_order, image_url } = form;
      if (!label || !image_url) {
        alert('Slide label and image are required.');
        return;
      }
      try {
        const data = editId
          ? await apiPut(`/api/hero-slides/${editId}`, { label, link, sort_order, image_url }, { auth: true })
          : await apiPost('/api/hero-slides', { label, link, sort_order, image_url }, { auth: true });
        if (data.success) {
          alert(editId ? 'Hero slide updated successfully!' : 'New hero slide added successfully!');
          closeModal('heroSlideModal');
          await fetchHeroSlides();
          setCurrentAdminTab('hero');
        } else {
          alert(data.error || 'Failed to save hero slide.');
        }
      } catch (err) {
        alert('Hero slide save error: ' + err.message);
      }
    },
    [closeModal, fetchHeroSlides]
  );

  const deleteHeroSlide = useCallback(
    async (id) => {
      if (!confirm('Are you sure you want to delete this hero slide?')) return;
      try {
        const data = await apiDelete(`/api/hero-slides/${id}`, { auth: true });
        if (data.success) {
          await fetchHeroSlides();
          setCurrentAdminTab('hero');
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert('Delete error: ' + err.message);
      }
    },
    [fetchHeroSlides]
  );

  const updateCategory = useCallback(
    async (id, payload) => {
      try {
        const data = await apiPut(`/api/categories/${id}`, payload, { auth: true });
        if (data.success) {
          await fetchCategories();
          return true;
        }
        alert(data.error || 'Failed to update category.');
        return false;
      } catch (err) {
        alert('Category update error: ' + err.message);
        return false;
      }
    },
    [fetchCategories]
  );

  const adjustProductStock = useCallback(
    async (id, delta) => {
      try {
        const data = await apiPatch(`/api/products/${id}/stock`, { delta }, { auth: true });
        if (data.success) await fetchProducts();
      } catch (err) {
        alert('Stock update failed: ' + err.message);
      }
    },
    [fetchProducts]
  );

  const setProductStock = useCallback(
    async (id, value) => {
      try {
        const data = await apiPatch(
          `/api/products/${id}/stock`,
          { stock: parseInt(value, 10) || 0 },
          { auth: true }
        );
        if (data.success) await fetchProducts();
      } catch (err) {
        alert('Stock update failed: ' + err.message);
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      if (!confirm('Are you sure you want to permanently delete this product from the database?')) return;
      try {
        const data = await apiDelete(`/api/products/${id}`, { auth: true });
        if (data.success) await fetchProducts();
        else alert(data.error);
      } catch (err) {
        alert('Delete error: ' + err.message);
      }
    },
    [fetchProducts]
  );

  const handleAdminAddProduct = useCallback(
    async (payload) => {
      if (!payload.image_url) {
        alert('Please provide a product image.');
        return;
      }
      try {
        const data = await apiPost('/api/products', payload, { auth: true });
        if (data.success) {
          alert('Piece published successfully!');
          await fetchProducts();
          setCurrentAdminTab('inventory');
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert('Add product failed: ' + err.message);
      }
    },
    [fetchProducts]
  );

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await apiPatch(`/api/admin/orders/${orderId}/status`, { order_status: newStatus }, { auth: true });
    } catch (err) {
      alert('Status update error: ' + err.message);
    }
  }, []);

  const deleteAdminOrder = useCallback(async (orderId, orderNumber) => {
    if (!confirm(`Are you sure you want to delete Order #${orderNumber}?`)) return;
    if (!confirm(`CONFIRM AGAIN: This will permanently remove Order #${orderNumber} from the database.`)) return;
    try {
      const data = await apiDelete(`/api/admin/orders/${orderId}`, { auth: true });
      if (!data.success) alert(data.error);
      return data.success;
    } catch (err) {
      alert('Delete error: ' + err.message);
      return false;
    }
  }, []);

  const deleteReviewItem = useCallback(
    async (id) => {
      if (!confirm('Are you sure you want to delete this review?')) return;
      try {
        const data = await apiDelete(`/api/reviews/${id}`, { auth: true });
        if (data.success) await fetchReviews();
      } catch (err) {
        alert('Delete error: ' + err.message);
      }
    },
    [fetchReviews]
  );

  const handleSavePaymentSettings = useCallback(
    async (settings) => {
      try {
        const data = await apiPut('/api/admin/settings', settings, { auth: true });
        if (data.success) {
          setStoreSettings(data.settings);
          alert('Payment settings updated successfully!');
        }
      } catch (err) {
        alert('Settings update error: ' + err.message);
      }
    },
    []
  );

  const handleChangePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      alert('New passcodes do not match.');
      return false;
    }
    try {
      const data = await apiPost(
        '/api/auth/change-password',
        { currentPassword, newPassword },
        { auth: true }
      );
      if (data.success) {
        alert('Admin passcode updated successfully!');
        return true;
      }
      alert(data.error);
      return false;
    } catch (err) {
      alert('Error changing password: ' + err.message);
      return false;
    }
  }, []);

  const value = {
    products,
    heroSlides,
    categories,
    reviews,
    storeSettings,
    cart,
    cartCount,
    cartTotal,
    filteredProducts,
    activeCategory,
    activePriceTier,
    priceTiers: PRICE_TIERS,
    filterStatusText,
    activeReviewIndex,
    lastCreatedOrder,
    selectedProduct,
    selectedModalSize,
    setSelectedModalSize,
    editingHeroSlide,
    setEditingHeroSlide,
    currentAdminTab,
    cartOpen,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    modals,
    loading,
    openModal,
    closeModal,
    filterCategory,
    setPriceTier,
    resetFilters,
    openCart,
    closeCart,
    addToCart,
    addToCartDirect,
    addToCartFromModal,
    updateCartQty,
    openProductDetail,
    openCheckoutModal,
    handleCheckoutSubmit,
    openWhatsAppInquiry,
    sendWhatsAppReceipt,
    orderCartOnWhatsApp,
    lookupCustomerOrders,
    triggerStackNext,
    handleReviewSubmit,
    handleReviewMediaUpload,
    handleAdminLogin,
    logoutAdmin,
    openAdminDashboard,
    switchAdminTab,
    openAddHeroModal,
    openEditHeroModal,
    handleHeroSlideSave,
    deleteHeroSlide,
    updateCategory,
    adjustProductStock,
    setProductStock,
    deleteProduct,
    handleAdminAddProduct,
    updateOrderStatus,
    deleteAdminOrder,
    deleteReviewItem,
    handleSavePaymentSettings,
    handleChangePassword,
    fetchProducts,
    fetchHeroSlides,
    fetchCategories,
    fetchReviews,
    uploadFile,
  };

  return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
}

export function useBoutique() {
  const ctx = useContext(BoutiqueContext);
  if (!ctx) throw new Error('useBoutique must be used within BoutiqueProvider');
  return ctx;
}

export { PRICE_TIERS, DEFAULT_SETTINGS };
