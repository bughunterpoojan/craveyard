import React from 'react';
import { PrinterIcon, CloseIcon } from './Icons';

export function ThermalReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.created_at 
    ? new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm p-4 bg-[#14151c]" onClick={e => e.stopPropagation()}>
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-3 no-print">
          <span className="text-xs font-mono text-[#FFC700] font-bold">DIGITAL THERMAL RECEIPT</span>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div className="receipt-box printable-receipt text-black bg-white rounded-lg p-5 shadow-inner">
          <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
            <h2 className="text-2xl font-black tracking-widest uppercase">CRAVEYARD</h2>
            <p className="text-[11px] font-bold tracking-wider">ECHOES 2026 • IITRAM AHMEDABAD</p>
            <p className="text-[10px] text-gray-600">STALL NO. 04 • GOOD FOOD x GREAT VIBES</p>
          </div>

          {/* Token Callout */}
          <div className="text-center my-2 p-1.5 bg-gray-100 rounded border border-gray-300">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-600">TOKEN NUMBER</span>
            <div className="text-3xl font-black font-mono tracking-wider">{order.token_number}</div>
          </div>

          <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-400 pb-2 mb-2 font-mono">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{order.customer_name || 'Walk-in Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-bold uppercase">{order.payment_mode || 'UPI'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border-b border-dashed border-gray-400 pb-3 mb-2 font-mono text-xs">
            <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1 text-[11px]">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>AMT</span>
            </div>

            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="py-1 border-b border-gray-100 last:border-0">
                <div className="flex justify-between font-bold">
                  <span>{item.item_name || item.name}</span>
                  <span>₹{item.total_price || item.price * item.quantity}</span>
                </div>
                <div className="text-[10px] text-gray-600 flex justify-between">
                  <span>
                    {item.size && item.size !== 'Regular' ? `Size: ${item.size} • ` : ''}
                    {item.quantity} x ₹{item.unit_price || item.price}
                  </span>
                </div>
                {item.selected_wafers && item.selected_wafers.length > 0 && (
                  <div className="text-[9px] text-gray-700 italic">
                    Chips: {item.selected_wafers.join(', ')}
                  </div>
                )}
                {item.selectedWafers && item.selectedWafers.length > 0 && (
                  <div className="text-[9px] text-gray-700 italic">
                    Chips: {item.selectedWafers.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total & Taxes */}
          <div className="space-y-1 font-mono text-xs border-b border-dashed border-gray-400 pb-3 mb-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal || order.total_amount}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700 font-bold">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base pt-1 border-t border-gray-300">
              <span>GRAND TOTAL:</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>

          {/* Thermal Footer */}
          <div className="text-center text-[10px] text-gray-600 font-mono space-y-0.5">
            <p className="font-bold">Thank You For Craving With Us!</p>
            <p>Share your food story & tag:</p>
            <p className="font-bold">@craveyard_iitram #Echoes2026</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-gray-300 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 btn-craveyard py-2.5 text-xs justify-center flex items-center gap-1.5"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
