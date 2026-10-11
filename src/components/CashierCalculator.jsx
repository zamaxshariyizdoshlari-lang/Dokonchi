import React, { useState } from 'react';
import { Calculator, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function CashierCalculator({ isOpen, onClose, onAddToCart }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = () => {
    if (!equation) return;
    try {
      const fullExpr = equation + display;
      // Safe math evaluate using basic operator parsing
      const tokens = fullExpr.split(' ');
      let result = parseFloat(tokens[0]);
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextVal = parseFloat(tokens[i + 1]);
        if (op === '+') result += nextVal;
        if (op === '-') result -= nextVal;
        if (op === '×' || op === '*') result *= nextVal;
        if (op === '/') result = nextVal !== 0 ? result / nextVal : 0;
      }
      setEquation('');
      setDisplay(Math.round(result).toString());
    } catch {
      setDisplay('Error');
    }
  };

  const handleAddResultToCart = () => {
    const val = parseFloat(display);
    if (!val || isNaN(val) || val <= 0) return;

    onAddToCart({
      id: `calc-${Date.now()}`,
      name: `Kalkulyator hisobi`,
      price: val,
      costPrice: val * 0.85,
      unit: 'dona',
      quantity: 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm m-0">Kassa Kalkulyatori</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 text-right shadow-inner">
          <div className="text-xs text-slate-400 min-h-[16px] font-mono">
            {equation}
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-emerald-400 truncate">
            {display}
          </div>
        </div>

        {/* Numpad Keypad */}
        <div className="grid grid-cols-4 gap-2 mb-3 select-none">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="p-3 rounded-xl bg-rose-100 text-rose-700 font-extrabold text-sm hover:bg-rose-200 active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-3 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-base hover:bg-slate-200 active:scale-95"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="p-3 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-base hover:bg-slate-200 active:scale-95"
          >
            ×
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="p-3 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-base hover:bg-slate-200 active:scale-95"
          >
            -
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="p-3 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-base hover:bg-amber-200 active:scale-95"
          >
            +
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            6
          </button>
          <button
            onClick={handleCalculate}
            className="row-span-2 p-3 rounded-xl bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 active:scale-95 flex items-center justify-center shadow-md shadow-emerald-600/30"
          >
            =
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            3
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-lg hover:bg-slate-100 active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('00')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-sm hover:bg-slate-100 active:scale-95"
          >
            00
          </button>
          <button
            onClick={() => handleDigit('000')}
            className="p-3 rounded-xl bg-slate-50 text-slate-900 font-black text-xs hover:bg-slate-100 active:scale-95"
          >
            000
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddResultToCart}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Savatga qoʻshish ({formatMoney(parseFloat(display) || 0)})</span>
        </button>

      </div>
    </div>
  );
}
