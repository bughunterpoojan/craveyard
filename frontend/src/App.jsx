import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MenuSection } from './components/MenuSection';
import { BillingPortal } from './components/BillingPortal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { apiUrl } from './utils/api';

const FALLBACK_MENU = [
  // Maggi & Taco
  { id: 1, name: "Simple Maggie", category: "maggi_taco", brand: "maggie", price_single: 49, description: "Classic spicy college noodles cooked with Craveyard's signature spice seasoning.", badge: "Classic", has_wafer_options: false },
  { id: 2, name: "Classic Cheesy", category: "maggi_taco", brand: "maggie", price_single: 79, description: "Gooey mozzarella & cheddar blend melted over steaming hot spicy Maggi.", badge: "Cheesy", has_wafer_options: false },
  { id: 3, name: "Cheesy Massala", category: "maggi_taco", brand: "maggie", price_single: 99, description: "Double shot of roasted Indian masala with a molten cheese crown on top.", badge: "Spicy & Cheesy", has_wafer_options: false },
  { id: 4, name: "Tandooriyat e Khaas", category: "maggi_taco", brand: "maggie", price_single: 119, description: "Smoky char tandoori sauce with aromatic whole spices and festival heat.", badge: "Chef Special", has_wafer_options: false },
  { id: 5, name: "Maggie Crunch Box", category: "maggi_taco", brand: "maggie", price_single: 149, description: "Our signature loaded box! Pick 2 of your favourite wafers to toss in with Maggi.", badge: "Craveyard Star", has_wafer_options: true },
  { id: 6, name: "Tandoori Taco Blast", category: "maggi_taco", brand: "taco", price_single: 179, description: "Crispy taco shells loaded with smoky tandoori noodles, cheese & crunchy chips.", badge: "Must Try", has_wafer_options: false },
  // BYOB Balaji
  { id: 10, name: "Balaji Masala Masti", category: "byob", brand: "balaji", price_small: 59, price_large: 99, description: "Crispy wafers with explosive chatpata spice seasoning.", badge: "Popular" },
  { id: 11, name: "Balaji Chat Chaska", category: "byob", brand: "balaji", price_small: 59, price_large: 99, description: "Tangy zesty Indian street-style chat flavours.", badge: "" },
  { id: 12, name: "Balaji Crunchex", category: "byob", brand: "balaji", price_small: 59, price_large: 99, description: "Extra crunchy ridged potato chips with fine seasoning.", badge: "" },
  { id: 13, name: "Balaji Rumbles", category: "byob", brand: "balaji", price_small: 59, price_large: 99, description: "Deep-cut wavy crunch with savory spice dusting.", badge: "" },
  { id: 14, name: "Balaji Flamigo", category: "byob", brand: "balaji", price_small: 59, price_large: 99, description: "Fiery flaming hot punch for the brave snack lover.", badge: "Hot" },
  // BYOB Doritos
  { id: 20, name: "Doritos", category: "byob", brand: "doritos", price_small: null, price_large: 149, description: "Bold nacho-flavoured triangular corn tortilla chips.", badge: "Premium" },
  // BYOB Bingo
  { id: 25, name: "Bingo PeriPeri", category: "byob", brand: "bingo", price_small: null, price_large: 109, description: "African bird's eye chili kick with tangy citrus swirls.", badge: "Spicy" },
  { id: 26, name: "Bingo Achari", category: "byob", brand: "bingo", price_small: null, price_large: 109, description: "Traditional pickle spice mix on crispy curved chips.", badge: "Tangy" },
  // BYOB Kurkure
  { id: 30, name: "Kurkure Solid Masti", category: "byob", brand: "kurkure", price_small: null, price_large: 69, description: "Twisted corn crunch with explosive Indian street seasoning.", badge: "" },
  { id: 31, name: "Kurkure Green Chatni", category: "byob", brand: "kurkure", price_small: null, price_large: 69, description: "Minty, herbaceous coriander-chutney blast.", badge: "" },
  { id: 32, name: "Kurkure Chili Chataka", category: "byob", brand: "kurkure", price_small: null, price_large: 69, description: "Red chili chatpata twists with addictive punch.", badge: "Spicy" },
  // BYOB Lays
  { id: 35, name: "Lays Masala Magic", category: "byob", brand: "lays", price_small: 69, price_large: 109, description: "India's favourite spicy blue-packet classic wafers.", badge: "Best Seller" },
  { id: 36, name: "Lays Chilli Lemon", category: "byob", brand: "lays", price_small: 69, price_large: null, description: "Tangy lemon punch with sharp green chili zest.", badge: "" },
  { id: 37, name: "Lays Sizzling Hot", category: "byob", brand: "lays", price_small: 69, price_large: null, description: "Intense chili heat in every feather-light crisp.", badge: "Extra Hot" },
  // BYOB Nachos
  { id: 40, name: "Cheese Nachos", category: "byob", brand: "nachos", price_single: null, price_small: null, price_large: 149, description: "Crispy corn nachos loaded with warm melted cheese dip.", badge: "Cheese Flavour" },
  { id: 41, name: "Jalapenos Nachos", category: "byob", brand: "nachos", price_single: null, price_small: null, price_large: 149, description: "Crispy corn nachos loaded with zesty pickled jalapeno peppers & cheese.", badge: "Jalapeno Flavour" },
];

export default function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Manual URL navigation (via #billing or /billing)
  useEffect(() => {
    const sync = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      if (hash.includes('billing') || path.includes('billing')) {
        setCurrentView('billing');
      } else {
        setCurrentView('menu');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  // Fetch live menu from Django
  useEffect(() => {
    fetch(apiUrl('/api/menu/'))
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setMenuItems(data); })
      .catch(() => {});
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'billing') {
      window.location.hash = 'billing';
    } else {
      if (window.location.hash) window.location.hash = '';
      if (window.location.pathname !== '/') window.history.pushState(null, '', '/');
    }
  };

  const handleOrderCompleted = (order) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0b0f', color: '#f1f2f5' }}>
      {/* Top wavy doodle */}
      <div className="wavy-top" />

      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main style={{ flex: 1 }}>
        {currentView === 'menu' ? (
          <MenuSection menuItems={menuItems} />
        ) : (
          <BillingPortal
            menuItems={menuItems}
            onBackToMenu={() => handleViewChange('menu')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#080910',
        borderTop: '1px solid rgba(255,199,0,0.12)',
        padding: '1.75rem 1.5rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '1.1rem', color: '#fff' }}>CRAVEYARD</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: '#6b7280' }}>
              Echoes 2026 · IITRAM Ahmedabad
            </span>
          </div>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.05rem', color: 'rgba(255,199,0,0.7)' }}>
            "Cooked with love, served with crunch!"
          </p>
        </div>
      </footer>

      {/* Bottom wavy doodle */}
      <div className="wavy-bottom" />

      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        order={receiptOrder}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}
