import React, { useState } from 'react';
import { SparkleIcon, CheckIcon, CloseIcon } from './Icons';
import { sound } from '../utils/audio';

export const WAFER_OPTIONS = [
  { id: 'lays_masala', name: 'Lays Masala', badge: 'Fan Favorite' },
  { id: 'balaji_masala', name: 'Balaji Masala Masti', badge: 'Spicy' },
  { id: 'solid_masti', name: 'Solid Masti', badge: 'Extra Crunchy' },
  { id: 'chataka_kurkure', name: 'Chataka Pataka / Kurkure', note: '(Provided based on availability)', badge: 'Tangy Heat' },
];

export function MaggieCrunchModal({ isOpen, onClose, onConfirm, initialItem }) {
  const [selectedWafers, setSelectedWafers] = useState([]);

  if (!isOpen) return null;

  const toggleWafer = (waferName) => {
    sound.playCrunch();
    if (selectedWafers.includes(waferName)) {
      setSelectedWafers(selectedWafers.filter(w => w !== waferName));
    } else {
      if (selectedWafers.length < 2) {
        setSelectedWafers([...selectedWafers, waferName]);
      } else {
        // Replace oldest or shift
        setSelectedWafers([selectedWafers[1], waferName]);
      }
    }
  };

  const handleAdd = () => {
    sound.playSuccess();
    onConfirm({
      item: initialItem || { name: 'Maggie Crunch Box', price_single: 149, category: 'maggi_taco' },
      selectedWafers: selectedWafers.length > 0 ? selectedWafers : ['Lays Masala', 'Balaji Masala Masti'], // default fallback if left empty
    });
    setSelectedWafers([]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-yellow-500/20 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="brush-badge">Special Box</span>
              <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">₹149</span>
            </div>
            <h2 className="font-brush text-2xl text-white mt-1">Maggie Crunch Box</h2>
            <p className="text-xs text-gray-400">
              Customize your box: Choose any <span className="text-[#FFC700] font-bold">2 wafers</span> to crunch & toss into your loaded hot Maggi!
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Selection Status Counter */}
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon className="w-4 h-4 text-[#FFC700]" />
            <span className="text-xs font-semibold text-gray-200">
              {selectedWafers.length === 2 
                ? '2 of 2 Wafers Selected!' 
                : `Select ${2 - selectedWafers.length} more wafer${selectedWafers.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/40 text-[#FFC700] font-bold">
            {selectedWafers.length} / 2
          </span>
        </div>

        {/* Wafer Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {WAFER_OPTIONS.map((waf) => {
            const isSelected = selectedWafers.includes(waf.name);
            return (
              <div
                key={waf.id}
                onClick={() => toggleWafer(waf.name)}
                className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FFC700] bg-yellow-500/15 shadow-md shadow-yellow-500/20 transform scale-[1.02]'
                    : 'border-white/10 bg-[#1e202a]/60 hover:border-white/30 hover:bg-[#252834]'
                }`}
              >
                <div className="flex items-start justify-end mb-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#FFC700] text-black font-bold' : 'border border-white/20 bg-black/40'
                  }`}>
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white leading-tight">{waf.name}</span>
                  </div>
                  {waf.note && (
                    <span className="text-[11px] text-gray-400 block mt-0.5">{waf.note}</span>
                  )}
                  {waf.badge && (
                    <span className="inline-block mt-2 text-[10px] bg-white/10 text-yellow-300 font-semibold px-2 py-0.5 rounded">
                      {waf.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Summary */}
        <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-6 text-xs text-gray-300">
          <span className="text-gray-400 font-medium">Selected Pair: </span>
          {selectedWafers.length === 0 ? (
            <span className="italic text-gray-500">None chosen (Defaults to Lays Masala + Balaji Masala Masti)</span>
          ) : (
            <span className="text-[#FFC700] font-bold">
              {selectedWafers.join(' + ')}
            </span>
          )}
        </div>

        {/* Confirm Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="btn-craveyard text-sm py-2.5 px-6"
          >
            Add To Order (₹149)
          </button>
        </div>
      </div>
    </div>
  );
}
