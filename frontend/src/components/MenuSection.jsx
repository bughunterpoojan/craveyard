import React, { useState, useMemo } from 'react';
import { SearchIcon } from './Icons';


const WAFER_CHOICES = [
  { name: 'Lays Masala' },
  { name: 'Balaji Masala Masti' },
  { name: 'Solid Masti' },
  { name: 'Chataka Pataka / Kurkure', note: '(based on availability)' },
];

const BRAND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'balaji', label: 'Balaji' },
  { id: 'lays', label: 'Lays' },
  { id: 'kurkure', label: 'Kurkure' },
  { id: 'bingo', label: 'Bingo' },
  { id: 'doritos', label: 'Doritos' },
  { id: 'nachos', label: 'Nachos' },
];

const BRAND_SECTIONS = [
  { id: 'balaji', title: 'Balaji Wafers', subtitle: 'Classic & spicy crunchy flavours • Small & Large sizes' },
  { id: 'lays', title: 'Lays Crisps', subtitle: 'Classic thin & fiery hot wafer varieties' },
  { id: 'kurkure', title: 'Kurkure Twists', subtitle: 'Chatpata street spiced crunch • Large Only (₹69)' },
  { id: 'bingo', title: 'Bingo', subtitle: 'Peri Peri & Achari flavour blasts • Large Only (₹109)' },
  { id: 'doritos', title: 'Doritos', subtitle: 'Bold nacho cheese corn tortilla triangles • Large Only (₹149)' },
  { id: 'nachos', title: 'Nachos Flavours', subtitle: 'Loaded Cheese & Jalapeno flavours • Large Only (₹149)' },
];

// Price badge
function PriceTag({ amount, dim = false }) {
  if (!amount && amount !== 0) return null;
  return (
    <span
      style={{
        fontFamily: "'Permanent Marker', cursive",
        fontSize: '1.7rem',
        color: dim ? 'rgba(255,199,0,0.45)' : '#FFC700',
        lineHeight: 1,
      }}
    >
      ₹{amount}
    </span>
  );
}

// Small clickable badge
function BadgePill({ children, color = '#FFC700' }) {
  return (
    <span
      style={{
        background: color,
        color: '#111',
        fontSize: '0.65rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '3px 9px',
        borderRadius: 6,
        fontFamily: "'Outfit', sans-serif",
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

export function MenuSection({ menuItems }) {
  const [activeTab, setActiveTab] = useState('maggi_taco');
  const [activeBrand, setActiveBrand] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.category !== activeTab) return false;
      if (activeTab === 'byob' && activeBrand !== 'all' && item.brand !== activeBrand) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.brand || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, activeTab, activeBrand, search]);

  // Helper to render individual item card
  const renderCard = (item) => {
    const isCrunch = item.has_wafer_options || item.name.includes('Crunch Box');
    const isSingle = item.price_single !== null && item.price_single !== undefined;
    const isLargeOnly = !isSingle && item.price_small === null && item.price_large !== null;

    return (
      <div
        key={item.id || item.name}
        className="menu-card"
        style={isCrunch ? {
          borderColor: 'rgba(255,199,0,0.4)',
          background: 'linear-gradient(160deg, rgba(255,199,0,0.07) 0%, #13141b 55%)',
        } : {}}
      >
        {/* Top Row: Badge + Price */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {item.badge && <BadgePill>{item.badge}</BadgePill>}
            {isLargeOnly && (
              <BadgePill color="rgba(255,199,0,0.18)">Large Only</BadgePill>
            )}
            {isCrunch && (
              <BadgePill color="#ef4444">
                Pick 2 Wafers
              </BadgePill>
            )}
          </div>
          {isSingle && <PriceTag amount={item.price_single} />}
        </div>

        {/* Name */}
        <h4 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: '1.12rem',
          color: '#f1f2f5',
          lineHeight: 1.25,
          marginBottom: '0.5rem',
        }}>
          {item.name}
        </h4>

        {/* Description */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.82rem',
          color: '#7b7f8e',
          lineHeight: 1.55,
          flex: 1,
          marginBottom: isCrunch || !isSingle ? '1rem' : 0,
        }}>
          {item.description}
        </p>

        {/* Maggie Crunch Box — wafer picker display */}
        {isCrunch && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,199,0,0.2)',
            borderRadius: 12,
            padding: '0.85rem',
            marginTop: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ color: '#FFC700', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                ✦ Choose Any 2 Wafers:
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {WAFER_CHOICES.map(w => (
                <div
                  key={w.name}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '6px 10px',
                  }}
                >
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.73rem', color: '#e5e7eb', lineHeight: 1.3 }}>{w.name}</div>
                  {w.note && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.62rem', color: '#6b7280', marginTop: 1 }}>{w.note}</div>}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              Tell staff your 2 choices when ordering!
            </p>
          </div>
        )}

        {/* BYOB size row */}
        {!isSingle && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
            {/* Small */}
            <div style={{
              background: item.price_small !== null ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '0.65rem 0.75rem',
              opacity: item.price_small !== null ? 1 : 0.45,
            }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>SMALL</div>
              <PriceTag amount={item.price_small} dim={false} />
              {item.price_small === null && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic' }}>N/A</span>}
            </div>
            {/* Large */}
            <div style={{
              background: item.price_large !== null ? 'rgba(255,199,0,0.08)' : 'rgba(255,255,255,0.02)',
              border: item.price_large !== null ? '1.5px solid rgba(255,199,0,0.25)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '0.65rem 0.75rem',
              opacity: item.price_large !== null ? 1 : 0.45,
            }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFC700', marginBottom: 4 }}>LARGE</div>
              <PriceTag amount={item.price_large} />
              {item.price_large === null && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic' }}>N/A</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>

      {/* ── Hero Strip ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111219 0%, #181b26 50%, #111219 100%)',
          border: '1.5px solid rgba(255,199,0,0.2)',
          borderRadius: 24,
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,199,0,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,199,0,0.12)', border: '1px solid rgba(255,199,0,0.3)',
              borderRadius: 999, padding: '4px 14px', marginBottom: 12,
            }}>
              <span style={{ color: '#FFC700', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                ✦ Official Food Stall · Echoes 2026
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Permanent Marker', cursive",
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 8,
            }}>
              CRAVE<span style={{ color: '#FFC700' }}>YARD</span> MENU
            </h2>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.25rem', color: 'rgba(255,220,100,0.85)', marginTop: 4 }}>
              Live-cooked Maggi specials, sizzling Tacos & crispy BYOB bags — grab yours before they run out!
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab + Search Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div
          style={{
            display: 'inline-flex', gap: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: 4,
          }}
        >
          {[
            { id: 'maggi_taco', label: 'MAGGI & TACOS' },
            { id: 'byob', label: 'BYOB SECTION' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setActiveBrand('all'); }}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                padding: '0.65rem 1.4rem',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.18s ease',
                background: activeTab === t.id ? '#FFC700' : 'transparent',
                color: activeTab === t.id ? '#111' : '#7b7f8e',
                boxShadow: activeTab === t.id ? '0 4px 16px rgba(255,199,0,0.3)' : 'none',
              }}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            <SearchIcon className="w-4 h-4" color="#6b7280" />
          </span>
          <input
            type="text"
            placeholder="Search anything..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '0.6rem 2rem 0.6rem 2.2rem',
              color: '#f1f2f5',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.85rem',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,199,0,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── BYOB Brand Filters ── */}
      {activeTab === 'byob' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {BRAND_FILTERS.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                padding: '0.4rem 1rem',
                borderRadius: 99,
                border: activeBrand === b.id ? '1.5px solid rgba(255,199,0,0.7)' : '1px solid rgba(255,255,255,0.1)',
                background: activeBrand === b.id ? 'rgba(255,199,0,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeBrand === b.id ? '#FFC700' : '#9ca3af',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Section header ── */}
      <div style={{ marginBottom: '1.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '1.4rem', color: '#f1f2f5' }}>
            {activeTab === 'maggi_taco' ? 'MAGGI & TACO SECTION' : 'BYOB — BRING YOUR OWN BAG'}
          </h3>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', color: '#6b7280', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: 99 }}>
            {filtered.length} items
          </span>
        </div>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.05rem', color: 'rgba(255,199,0,0.7)', marginTop: 2 }}>
          {activeTab === 'maggi_taco'
            ? 'Made fresh to order — street style, cheesy, and smoky hot!'
            : 'Pick your favourite chips and snacks by brand below — Small or Large portions!'}
        </p>
      </div>

      {/* ── Cards Display ── */}
      {activeTab === 'byob' && activeBrand === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {BRAND_SECTIONS.map((sec) => {
            const secItems = filtered.filter(item => item.brand === sec.id);
            if (secItems.length === 0) return null;

            return (
              <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Brand section header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  borderBottom: '1.5px solid rgba(255,199,0,0.22)',
                  paddingBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 24,
                      background: '#FFC700',
                      borderRadius: 4,
                    }} />
                    <h4 style={{
                      fontFamily: "'Permanent Marker', cursive",
                      fontSize: '1.4rem',
                      color: '#fff',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                    }}>
                      {sec.title}
                    </h4>
                    <span style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#FFC700',
                      background: 'rgba(255,199,0,0.12)',
                      border: '1px solid rgba(255,199,0,0.25)',
                      padding: '2px 9px',
                      borderRadius: 999,
                    }}>
                      {secItems.length} {secItems.length === 1 ? 'item' : 'flavours'}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '1.15rem',
                    color: 'rgba(255,220,100,0.85)',
                  }}>
                    {sec.subtitle}
                  </span>
                </div>

                {/* Cards Grid for this brand */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {secItems.map(item => renderCard(item))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map(item => renderCard(item))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#13141b', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <SearchIcon className="w-10 h-10" color="#4b5563" />
          </div>
          <h4 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '1.3rem', color: '#f1f2f5', marginBottom: 6 }}>
            Nothing found for "{search}"
          </h4>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: '#6b7280' }}>
            Try a different keyword or clear the search.
          </p>
        </div>
      )}

      {/* ── Bottom Call-to-Action Banner ── */}
      <div style={{
        marginTop: '3rem',
        background: 'linear-gradient(135deg, rgba(255,199,0,0.1), rgba(255,138,0,0.07))',
        border: '1.5px solid rgba(255,199,0,0.25)',
        borderRadius: 20,
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>
        <h4 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '1.6rem', color: '#fff', marginBottom: 8 }}>
          READY TO ORDER?
        </h4>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem', color: 'rgba(255,220,100,0.9)' }}>
          Walk to the <span style={{ color: '#FFC700', fontWeight: 700 }}>CRAVEYARD STALL</span> and place your order with our staff!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          {['UPI — GPay / PhonePe / Paytm', 'Cash Accepted'].map(t => (
            <span
              key={t}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.78rem', fontWeight: 600,
                color: '#9ca3af',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '5px 14px', borderRadius: 99,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
