import React, { useState, useEffect } from 'react';
import { 
  LockIcon, PrinterIcon, DownloadIcon, RefreshIcon, TrashIcon, 
  PlusIcon, MinusIcon, SearchIcon, SparkleIcon, FireIcon, CheckIcon, ArrowLeftIcon 
} from './Icons';
import { sound } from '../utils/audio';
import { apiUrl } from '../utils/api';

const WAFER_OPTIONS = [
  { id: 'lays_masala', name: 'Lays Masala' },
  { id: 'balaji_masala', name: 'Balaji Masala Masti' },
  { id: 'solid_masti', name: 'Solid Masti' },
  { id: 'chataka_kurkure', name: 'Chataka Pataka / Kurkure' },
];

export function BillingPortal({ 
  menuItems, 
  onBackToMenu, 
  onOrderCompleted 
}) {
  // Staff PIN Authentication (PIN: 4682)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Portal view mode: 'pos' or 'dashboard'
  const [portalTab, setPortalTab] = useState('pos');

  // Fast POS State
  const [currentBillItems, setCurrentBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' or 'cash'
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Wafer popup inside POS for Maggie Crunch Box
  const [crunchBoxItemPending, setCrunchBoxItemPending] = useState(null);
  const [posSelectedWafers, setPosSelectedWafers] = useState(['Lays Masala', 'Balaji Masala Masti']);

  // Sales Analytics State
  const [stats, setStats] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingStats, setLoadingStats] = useState(false);

  // Initialize token and check session
  useEffect(() => {
    generateNewToken();
    fetchStats();
    fetchOrders();
  }, []);

  const generateNewToken = () => {
    const randomSeq = Math.floor(101 + Math.random() * 899);
    setTokenNumber(`CY-${randomSeq}`);
  };

  const handleUnlockPin = (e) => {
    e?.preventDefault();
    if (pinInput === '4682') {
      setIsAuthenticated(true);
      setPinError('');
      sound.playSuccess();
    } else {
      setPinError('Invalid PIN! Please enter the staff PIN.');
      sound.playBeep();
    }
  };

  // Fetch sales analytics from Django SQLite backend
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(apiUrl('/api/stats/'));
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Backend fallback handled gracefully
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch orders list
  const fetchOrders = async () => {
    try {
      const res = await fetch(apiUrl('/api/orders/'));
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch {
      // Backend fallback
    }
  };

  // POS Add Item
  const handlePosAddItem = (item, size = 'Regular', price = null) => {
    sound.playBeep();
    const finalPrice = price !== null ? price : (item.price_single || 0);

    // If item is Crunch Box, open wafer picker
    if (item.has_wafer_options || item.name.includes('Crunch Box')) {
      setCrunchBoxItemPending({ item, size, price: finalPrice });
      return;
    }

    const existingIndex = currentBillItems.findIndex(
      (b) => b.item_name === item.name && b.size === size
    );

    if (existingIndex > -1) {
      const updated = [...currentBillItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total_price = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCurrentBillItems(updated);
    } else {
      setCurrentBillItems([
        ...currentBillItems,
        {
          item_name: item.name,
          category: item.category,
          size: size,
          unit_price: finalPrice,
          quantity: 1,
          total_price: finalPrice,
          selected_wafers: [],
        },
      ]);
    }
  };

  // Confirm Crunch Box with wafers
  const handleConfirmCrunchBox = () => {
    sound.playCrunch();
    if (!crunchBoxItemPending) return;

    setCurrentBillItems([
      ...currentBillItems,
      {
        item_name: crunchBoxItemPending.item.name,
        category: crunchBoxItemPending.item.category,
        size: crunchBoxItemPending.size,
        unit_price: crunchBoxItemPending.price,
        quantity: 1,
        total_price: crunchBoxItemPending.price,
        selected_wafers: [...posSelectedWafers],
      },
    ]);

    setCrunchBoxItemPending(null);
    setPosSelectedWafers(['Lays Masala', 'Balaji Masala Masti']);
  };

  // Update item quantity
  const handleUpdateQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...currentBillItems];
    updated[index].quantity = newQty;
    updated[index].total_price = newQty * updated[index].unit_price;
    setCurrentBillItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    sound.playBeep();
    setCurrentBillItems(currentBillItems.filter((_, i) => i !== index));
  };

  // Clear bill
  const handleClearBill = () => {
    setCurrentBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNote('');
    setDiscountAmount(0);
    setCashTendered('');
    generateNewToken();
  };

  // Calculations
  const subtotal = currentBillItems.reduce((acc, it) => acc + it.total_price, 0);
  const totalAmount = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const changeToReturn = cashTendered ? Math.max(0, Number(cashTendered) - totalAmount) : 0;

  // Submit and Charge Order
  const handleChargeOrder = async () => {
    if (currentBillItems.length === 0) {
      alert('Please add at least 1 item to the bill!');
      return;
    }

    const payload = {
      token_number: tokenNumber,
      customer_name: customerName || 'Guest',
      customer_phone: customerPhone || '',
      payment_mode: paymentMode,
      status: 'completed',
      subtotal: subtotal,
      discount: Number(discountAmount) || 0,
      total_amount: totalAmount,
      notes: orderNote,
      items: currentBillItems,
    };

    try {
      const res = await fetch(apiUrl('/api/orders/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedOrder = await res.json();
        sound.playSuccess();
        onOrderCompleted(savedOrder);
        handleClearBill();
        fetchStats();
        fetchOrders();
      } else {
        // Fallback save in memory
        sound.playSuccess();
        onOrderCompleted(payload);
        handleClearBill();
      }
    } catch {
      sound.playSuccess();
      onOrderCompleted(payload);
      handleClearBill();
    }
  };

  // Update order status (Cancel or Complete)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(apiUrl(`/api/orders/${orderId}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        sound.playBeep();
        fetchOrders();
        fetchStats();
      }
    } catch {
      //
    }
  };

  // Trigger Demo Data Seed or Reset
  const handleDemoAction = async (action) => {
    const confirmMsg = action === 'reset' 
      ? 'Are you sure you want to RESET all sales records?' 
      : 'Load sample festival test orders?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(apiUrl('/api/demo-action/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        sound.playSuccess();
        fetchStats();
        fetchOrders();
      }
    } catch {
      //
    }
  };

  // Filtered orders list for dashboard table
  const filteredOrders = allOrders.filter((ord) => {
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      const tokenMatch = (ord.token_number || '').toLowerCase().includes(q);
      const nameMatch = (ord.customer_name || '').toLowerCase().includes(q);
      return tokenMatch || nameMatch;
    }
    return true;
  });

  // PIN Gate screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="chalk-card max-w-md w-full p-8 text-center border-2 border-yellow-500/40">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 text-[#FFC700] mx-auto flex items-center justify-center mb-4">
            <LockIcon className="w-8 h-8" />
          </div>

          <h2 className="font-brush text-3xl text-white mb-1">CRAVEYARD STAFF GATE</h2>
          <p className="text-xs text-gray-400 mb-6">
            Enter the 4-digit staff passcode to access the cashier POS and live sales tracking.
          </p>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength="4"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 4-Digit Staff PIN"
                className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-[#1a1b26] border border-white/20 focus:border-[#FFC700] rounded-xl py-3 text-white focus:outline-none"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-semibold">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full btn-craveyard py-3 text-base justify-center"
            >
              Unlock Billing Portal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center text-xs text-gray-400">
            <button
              onClick={onBackToMenu}
              className="hover:text-white flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Visitor Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      {/* Top Staff Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-[#161722] border border-yellow-500/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
            title="Return to Customer Menu"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-brush text-2xl text-white flex items-center gap-2">
              <span>STAFF POS & SALES PORTAL</span>
              <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                Active
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Echoes 2026 • Stall #04 Craveyard • Fast Cashier & Analytics
            </p>
          </div>
        </div>

        {/* Portal Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#0e0f15] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setPortalTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              portalTab === 'pos'
                ? 'bg-[#FFC700] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fast POS Bill
          </button>
          <button
            onClick={() => {
              setPortalTab('dashboard');
              fetchStats();
              fetchOrders();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              portalTab === 'dashboard'
                ? 'bg-[#FFC700] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Sales Tracker
          </button>
        </div>
      </div>

      {/* VIEW 1: FAST CASHIER POS */}
      {portalTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Touch Product Matrix (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Maggi & Taco Quick Section */}
            <div className="bg-[#14151e] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="font-brush text-lg text-[#FFC700] flex items-center gap-2">
                  <span>MAGGI & TACOS</span>
                  <span className="text-xs font-mono font-normal text-gray-400">(1-Tap Punch)</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {menuItems
                  .filter((m) => m.category === 'maggi_taco')
                  .map((m) => (
                    <button
                      key={m.id || m.name}
                      onClick={() => handlePosAddItem(m, 'Regular', m.price_single)}
                      className="p-3 rounded-xl bg-[#1d1f2b] hover:bg-[#252838] border border-white/10 hover:border-[#FFC700] active:scale-95 transition-all text-left flex flex-col justify-between min-h-[78px]"
                    >
                      <span className="font-bold text-xs text-white leading-tight line-clamp-2">
                        {m.name}
                      </span>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-mono text-sm font-black text-[#FFC700]">
                          ₹{m.price_single}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-1.5 py-0.5 rounded">
                          + Add
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* BYOB Quick Section */}
            <div className="bg-[#14151e] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="font-brush text-lg text-[#FFC700] flex items-center gap-2">
                  <span>BYOB SNACKS</span>
                  <span className="text-xs font-mono font-normal text-gray-400">Small / Large</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {menuItems
                  .filter((m) => m.category === 'byob')
                  .map((m) => {
                    const isSingle = m.price_single !== null && m.price_single !== undefined;
                    return (
                      <div
                        key={m.id || m.name}
                        className="p-2.5 rounded-xl bg-[#1d1f2b] border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-xs text-white block truncate">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">
                            {m.brand}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isSingle ? (
                            <button
                              onClick={() => handlePosAddItem(m, 'Regular', m.price_single)}
                              className="px-2.5 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black font-mono font-bold text-xs border border-yellow-500/30"
                            >
                              ₹{m.price_single}
                            </button>
                          ) : (
                            <>
                              {m.price_small !== null && (
                                <button
                                  onClick={() => handlePosAddItem(m, 'Small', m.price_small)}
                                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-yellow-500 hover:text-black text-white font-mono text-[11px] font-bold border border-white/10"
                                  title="Add Small"
                                >
                                  S: ₹{m.price_small}
                                </button>
                              )}
                              {m.price_large !== null && (
                                <button
                                  onClick={() => handlePosAddItem(m, 'Large', m.price_large)}
                                  className="px-2 py-1.5 rounded-lg bg-yellow-500/15 hover:bg-yellow-500 hover:text-black text-yellow-300 font-mono text-[11px] font-bold border border-yellow-500/30"
                                  title="Add Large"
                                >
                                  L: ₹{m.price_large}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Billing Register & Checkout (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#14151e] border-2 border-yellow-500/40 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
              {/* Order Metadata Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Token:</span>
                  <input
                    type="text"
                    value={tokenNumber}
                    onChange={(e) => setTokenNumber(e.target.value)}
                    className="font-mono font-black text-lg bg-black/50 border border-yellow-500/40 rounded-lg px-2.5 py-1 text-[#FFC700] w-24 text-center focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateNewToken}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                    title="Generate New Token"
                  >
                    <RefreshIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClearBill}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400"
                    title="Clear current bill"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
                <input
                  type="text"
                  placeholder="Phone / Note"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* Bill Items List */}
              <div className="flex-1 min-h-[200px] max-h-[260px] overflow-y-auto pr-1 space-y-2 mb-4 bg-black/20 p-2 rounded-xl border border-white/5">
                {currentBillItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs font-mono">
                    <p>Bill is currently empty.</p>
                    <p className="text-[10px] mt-1 text-gray-600">
                      Tap items on the left to punch into ticket.
                    </p>
                  </div>
                ) : (
                  currentBillItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-[#1a1b26] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-white leading-tight">
                          {item.item_name}
                          {item.size && item.size !== 'Regular' && (
                            <span className="text-[10px] text-yellow-400 ml-1">({item.size})</span>
                          )}
                        </div>
                        {item.selected_wafers && item.selected_wafers.length > 0 && (
                          <div className="text-[10px] text-gray-400">
                            Wafers: {item.selected_wafers.join(', ')}
                          </div>
                        )}
                        <span className="text-[11px] font-mono text-gray-400">
                          ₹{item.unit_price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-black/50 border border-white/10 rounded">
                          <button
                            onClick={() => handleUpdateQty(index, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="font-mono px-1.5 font-bold text-white text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(index, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-white w-12 text-right">
                          ₹{item.total_price}
                        </span>

                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-gray-500 hover:text-red-400"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Mode Selector */}
              <div className="mb-4">
                <span className="text-[11px] font-mono text-gray-400 block mb-1">
                  PAYMENT METHOD:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMode('upi')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      paymentMode === 'upi'
                        ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-md'
                        : 'bg-[#181924] text-gray-400 border-white/10'
                    }`}
                  >
                    <span>UPI (GPay / PhonePe)</span>
                  </button>

                  <button
                    onClick={() => setPaymentMode('cash')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      paymentMode === 'cash'
                        ? 'bg-green-600/30 text-green-300 border-green-500 shadow-md'
                        : 'bg-[#181924] text-gray-400 border-white/10'
                    }`}
                  >
                    <span>Cash</span>
                  </button>
                </div>

                {/* Cash Change Calculator */}
                {paymentMode === 'cash' && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-green-500/20 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-gray-400">Cash Received:</span>
                      <div className="flex gap-1">
                        {[100, 200, 500].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setCashTendered(amt.toString())}
                            className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 hover:text-white font-mono"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-white w-24 font-mono"
                      />
                      <div className="font-mono text-right">
                        <span className="text-gray-400 text-[11px]">Return Change: </span>
                        <span className="font-bold text-green-400 text-sm">₹{changeToReturn}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotal & Totals Box */}
              <div className="border-t border-white/10 pt-3 mb-4 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Discount:</span>
                  <div className="flex items-center gap-1">
                    <span>-₹</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-16 bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-right text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-white/10">
                  <span>TOTAL BILL:</span>
                  <span className="font-brush text-3xl text-[#FFC700]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Big Charge & Print Button */}
              <button
                onClick={handleChargeOrder}
                disabled={currentBillItems.length === 0}
                className={`w-full btn-craveyard py-3.5 text-base justify-center flex items-center gap-2 ${
                  currentBillItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PrinterIcon className="w-5 h-5" />
                <span>CHARGE & PRINT RECEIPT (₹{totalAmount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE SALES TRACKER & ANALYTICS */}
      {portalTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="chalk-card p-4 border-yellow-500/40 bg-gradient-to-br from-[#1b1c26] to-[#14151e]">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="font-brush text-3xl text-[#FFC700] mt-1">
                ₹{stats ? stats.total_revenue : '0'}
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">
                From {stats ? stats.total_orders : 0} completed orders
              </span>
            </div>

            <div className="chalk-card p-4 border-purple-500/30">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                UPI Revenue
              </span>
              <div className="font-brush text-3xl text-purple-400 mt-1">
                ₹{stats ? stats.upi_revenue : '0'}
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">Digital QR Payments</span>
            </div>

            <div className="chalk-card p-4 border-green-500/30">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Cash Revenue
              </span>
              <div className="font-brush text-3xl text-green-400 mt-1">
                ₹{stats ? stats.cash_revenue : '0'}
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">Counter Cash Box</span>
            </div>

            <div className="chalk-card p-4 border-blue-500/30">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Avg Order Value
              </span>
              <div className="font-brush text-3xl text-blue-400 mt-1">
                ₹{stats ? stats.avg_order_value : '0'}
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">Per visitor spend</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161722] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <a
                href={apiUrl('/api/export-sales/')}
                download
                className="btn-craveyard text-xs py-2 px-4 flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Export Sales CSV
              </a>

              <button
                onClick={() => {
                  fetchStats();
                  fetchOrders();
                }}
                className="btn-secondary-chalk text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDemoAction('seed_demo')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10"
              >
                + Seed Test Orders
              </button>
              <button
                onClick={() => handleDemoAction('reset')}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30"
              >
                Reset All Sales
              </button>
            </div>
          </div>

          {/* Leaderboard and Category Share */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Items */}
            <div className="chalk-card">
              <h3 className="font-brush text-lg text-white mb-3 flex items-center gap-2">
                <span>BEST SELLING ITEMS</span>
              </h3>
              <div className="space-y-2.5">
                {stats && stats.top_items && stats.top_items.length > 0 ? (
                  stats.top_items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#FFC700]/20 text-[#FFC700] flex items-center justify-center font-bold font-mono text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">{it.item_name}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-[#FFC700]">{it.total_qty} sold</span>
                        <span className="text-gray-400 text-[11px] block">₹{it.total_sales}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-6">
                    No sales data yet. Punch orders to see rankings!
                  </p>
                )}
              </div>
            </div>

            {/* Category Share */}
            <div className="chalk-card">
              <h3 className="font-brush text-lg text-white mb-3">
                <span>CATEGORY DISTRIBUTION</span>
              </h3>
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white">Maggi Creations</span>
                    <span className="text-[#FFC700] font-bold">
                      {stats?.category_summary?.maggi || 0} portions
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#FFC700]"
                      style={{
                        width: `${Math.min(
                          100,
                          ((stats?.category_summary?.maggi || 0) /
                            Math.max(1, (stats?.total_orders || 1) * 2)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white">Tacos</span>
                    <span className="text-orange-400 font-bold">
                      {stats?.category_summary?.taco || 0} portions
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: `${Math.min(
                          100,
                          ((stats?.category_summary?.taco || 0) /
                            Math.max(1, (stats?.total_orders || 1) * 2)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white">BYOB Snack Packs</span>
                    <span className="text-cyan-400 font-bold">
                      {stats?.category_summary?.byob || 0} bags
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{
                        width: `${Math.min(
                          100,
                          ((stats?.category_summary?.byob || 0) /
                            Math.max(1, (stats?.total_orders || 1) * 2)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders History Table */}
          <div className="chalk-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-brush text-xl text-white">LIVE ORDERS FEED</h3>
                <p className="text-xs text-gray-400 font-mono">
                  All transactions stored permanently in SQLite
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter token or name..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="preparing">Preparing</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2.5 px-3">Token</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        No orders matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-[#FFC700] whitespace-nowrap">
                          {ord.token_number}
                        </td>
                        <td className="py-3 px-3 text-white whitespace-nowrap">
                          {ord.customer_name || 'Guest'}
                        </td>
                        <td className="py-3 px-3 text-gray-300 max-w-xs truncate">
                          {ord.items &&
                            ord.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          ₹{ord.total_amount}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.payment_mode === 'upi'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}
                          >
                            {ord.payment_mode}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : ord.status === 'preparing'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => onOrderCompleted(ord)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                            title="Reprint Receipt"
                          >
                            <PrinterIcon className="w-3.5 h-3.5" />
                          </button>
                          {ord.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px]"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POS Wafer Picker Modal for Maggie Crunch Box */}
      {crunchBoxItemPending && (
        <div className="modal-overlay" onClick={() => setCrunchBoxItemPending(null)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-brush text-xl text-white mb-1">Select 2 Crunch Wafers</h3>
            <p className="text-xs text-gray-400 mb-4">Choose chips for this Crunch Box ticket:</p>

            <div className="space-y-2 mb-6">
              {WAFER_OPTIONS.map((waf) => {
                const isSelected = posSelectedWafers.includes(waf.name);
                return (
                  <div
                    key={waf.id}
                    onClick={() => {
                      sound.playCrunch();
                      if (posSelectedWafers.includes(waf.name)) {
                        setPosSelectedWafers(posSelectedWafers.filter((w) => w !== waf.name));
                      } else {
                        if (posSelectedWafers.length < 2) {
                          setPosSelectedWafers([...posSelectedWafers, waf.name]);
                        } else {
                          setPosSelectedWafers([posSelectedWafers[1], waf.name]);
                        }
                      }
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-[#FFC700] bg-yellow-500/20 text-white font-bold'
                        : 'border-white/10 bg-[#1e202a] text-gray-300 hover:bg-[#252834]'
                    }`}
                  >
                    <span>{waf.name}</span>
                    {isSelected && <CheckIcon className="w-4 h-4 text-[#FFC700]" />}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCrunchBoxItemPending(null)}
                className="flex-1 px-4 py-2 rounded-xl text-xs bg-white/10 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCrunchBox}
                className="flex-1 btn-craveyard py-2 text-xs justify-center"
              >
                Confirm Wafers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
