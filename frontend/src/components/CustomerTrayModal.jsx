import React, { useState } from 'react';
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon, SparkleIcon, CheckIcon } from './Icons';
import { sound } from '../utils/audio';

export function CustomerTrayModal({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) {
  const [showCounterPass, setShowCounterPass] = useState(false);
  const [passNumber, setPassNumber] = useState(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleGeneratePass = () => {
    sound.playSuccess();
    const rand = Math.floor(100 + Math.random() * 900);
    setPassNumber(`PASS-${rand}`);
    setShowCounterPass(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-6 h-6 text-[#FFC700]" />
            <div>
              <h3 className="font-brush text-2xl text-white">Your Craveyard Tray</h3>
              <p className="text-xs text-gray-400">Review selected food items before heading to the counter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Pass View */}
        {showCounterPass ? (
          <div className="text-center py-4">
            <div className="bg-[#FFC700] text-black font-brush text-xs uppercase tracking-widest py-1 px-4 rounded-full inline-block mb-3">
              Show This Screen At Counter #1
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border-2 border-[#FFC700] shadow-2xl mb-4">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">Token Preview</span>
              <h2 className="font-brush text-5xl text-[#FFC700] my-2">{passNumber}</h2>
              <p className="text-xs text-gray-300 mb-4 font-mono">
                {cartItems.reduce((a, b) => a + b.quantity, 0)} Items • Total: ₹{totalAmount}
              </p>

              {/* Itemized Pass List */}
              <div className="text-left bg-[#161722] rounded-xl p-3 border border-white/10 max-h-48 overflow-y-auto space-y-2 text-xs">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-white">
                        {item.quantity}x {item.name}
                      </span>
                      {item.size && item.size !== 'Regular' && (
                        <span className="text-yellow-400 ml-1 font-semibold">({item.size})</span>
                      )}
                      {item.selectedWafers && item.selectedWafers.length > 0 && (
                        <p className="text-[11px] text-gray-400">
                          Wafers: {item.selectedWafers.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-white font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCounterPass(false)}
                className="flex-1 btn-secondary-chalk text-xs justify-center py-2.5"
              >
                Back To Tray
              </button>
              <button
                onClick={() => {
                  sound.playSuccess();
                  onClose();
                }}
                className="flex-1 btn-craveyard text-xs justify-center py-2.5"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Normal Cart List View */
          <div>
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBagIcon className="w-10 h-10 block mb-2 opacity-40 mx-auto text-[#FFC700]" />
                <p className="text-sm font-semibold text-gray-400">Your tray is empty!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Explore our spicy Maggi specials, taco blast, and BYOB snacks above.
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-3 mb-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1a1b24] border border-white/10"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{item.name}</span>
                          {item.size && item.size !== 'Regular' && (
                            <span className="text-[10px] bg-yellow-500/20 text-[#FFC700] px-1.5 py-0.5 rounded font-mono font-bold">
                              {item.size}
                            </span>
                          )}
                        </div>
                        {item.selectedWafers && item.selectedWafers.length > 0 && (
                          <p className="text-[11px] text-yellow-300/80 mt-0.5">
                            Chips: {item.selectedWafers.join(' + ')}
                          </p>
                        )}
                        <span className="font-mono text-xs text-gray-400">₹{item.price} each</span>
                      </div>

                      {/* Quantity Adjusters */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-white/20 rounded-lg bg-black/40">
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="p-1.5 text-gray-400 hover:text-white"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold px-2 text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="p-1.5 text-gray-400 hover:text-white"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(index)}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Calculation */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/10 mb-5">
                  <div className="flex justify-between items-center text-sm mb-1 text-gray-300">
                    <span>Items Total ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span className="font-mono">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-white pt-2 border-t border-white/10">
                    <span>Estimated Bill</span>
                    <span className="font-brush text-2xl text-[#FFC700]">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClearCart}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Clear
                  </button>

                  <button
                    onClick={handleGeneratePass}
                    className="flex-1 btn-craveyard py-2.5 text-sm justify-center flex items-center gap-2"
                  >
                    <SparkleIcon className="w-4 h-4" />
                    <span>Generate Counter Pass</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
