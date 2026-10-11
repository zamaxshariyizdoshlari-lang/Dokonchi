import React, { useEffect, useRef, useState } from 'react';
import { Tag, Printer, X, Sparkles, RefreshCw } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { formatMoney } from '../utils/storage';

export default function BarcodeLabelModal({ isOpen, onClose, product, settings, onUpdateBarcode }) {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [labelCopies, setLabelCopies] = useState(12);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const initialCode = product.barcode || `BAQ-${Date.now().toString().slice(-7)}`;
    setBarcodeValue(initialCode);
  }, [product]);

  useEffect(() => {
    if (!barcodeValue || !svgRef.current) return;
    try {
      JsBarcode(svgRef.current, barcodeValue, {
        format: 'CODE128',
        width: 1.8,
        height: 48,
        displayValue: true,
        fontSize: 12,
        font: 'monospace',
        textMargin: 2
      });
    } catch (err) {
      console.error('Barcode render error:', err);
    }
  }, [barcodeValue]);

  if (!isOpen || !product) return null;

  const generateNewBarcode = () => {
    const newCode = `BAQ-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setBarcodeValue(newCode);
    if (onUpdateBarcode) {
      onUpdateBarcode(product.id, newCode);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Shtrix-kod Stikeri & Chop Etish
              </h3>
              <p className="text-[11px] text-slate-500">
                Mahsulot qadogʻiga yopishtirish uchun narx yorligʻi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barcode code controls */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Shtrix-kod raqami
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {barcodeValue}
            </span>
          </div>

          <button
            onClick={generateNewBarcode}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-2xs active:scale-95"
            title="Yangi unikal kod yaratish"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Yangi kod</span>
          </button>
        </div>

        {/* Sticker Preview Card (What gets printed) */}
        <div className="my-2 p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {settings.shopName || 'Baraka Doʻkoni'}
          </span>
          <h4 className="font-black text-slate-900 text-base mt-0.5 line-clamp-1">
            {product.name}
          </h4>
          <span className="text-lg font-black text-emerald-700 my-1">
            {formatMoney(product.price)}
          </span>

          {/* SVG Barcode rendered by JsBarcode */}
          <div className="bg-white p-1 rounded-lg">
            <svg ref={svgRef}></svg>
          </div>
        </div>

        {/* Print Copies count */}
        <div className="flex items-center justify-between my-4 text-xs font-semibold text-slate-700">
          <span>Chop etish soni (nusxalar):</span>
          <div className="flex items-center gap-1.5">
            {[6, 12, 24].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setLabelCopies(cnt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  labelCopies === cnt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cnt} ta
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Printerda chiqarish</span>
          </button>
        </div>

      </div>
    </div>
  );
}
