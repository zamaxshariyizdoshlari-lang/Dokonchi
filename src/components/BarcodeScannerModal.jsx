import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, AlertCircle, CheckCircle2, User, Sparkles, CreditCard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { formatMoney } from '../utils/storage';

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onDetected,
  products = [],
  customers = [],
  onCustomerDetected
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setErrorMsg('');
    setScanResult(null);

    // Wait a brief moment for the DOM element to mount
    setTimeout(async () => {
      try {
        const element = document.getElementById('camera-reader');
        if (!element) return;

        const html5QrCode = new Html5Qrcode('camera-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' }, // Back camera preferred
          {
            fps: 10,
            qrbox: { width: 250, height: 180 },
            aspectRatio: 1.33
          },
          (decodedText) => {
            handleSuccessfulScan(decodedText.trim());
          },
          (errorMessage) => {
            // Ignore normal frame misses
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Camera start error:', err);
        setErrorMsg('Kamerani ochib boʻlmadi. Iltimos brauzerda kamera ruxsatini yoqing.');
      }
    }, 200);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Ignored
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSuccessfulScan = (code) => {
    // 1. Check if this is a Customer QR Card
    if (code.startsWith('CUSTOMER:')) {
      playCustomerChime();
      const customerId = code.replace('CUSTOMER:', '').trim();
      const matchedCustomer = customers.find((c) => c.id === customerId);

      setScanResult({
        type: 'customer',
        code,
        customer: matchedCustomer || null
      });

      if (matchedCustomer && onCustomerDetected) {
        onCustomerDetected(matchedCustomer);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
      return;
    }

    // 2. Otherwise standard Product Barcode
    playBeepSound();
    const matchedProduct = products.find((p) => p.barcode === code);

    setScanResult({
      type: 'product',
      code,
      product: matchedProduct || null
    });

    if (matchedProduct && onDetected) {
      onDetected(matchedProduct);
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 150);
    } catch {}
  };

  const playCustomerChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Dual pleasant chime
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = 523.25; // C5
      osc2.frequency.value = 659.25; // E5

      gain.gain.value = 0.2;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        osc1.frequency.value = 783.99; // G5
        osc2.frequency.value = 1046.50; // C6
      }, 120);

      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        audioCtx.close();
      }, 300);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Shtrix-kod & QR Skaner
              </h3>
              <p className="text-[10px] text-slate-400 m-0">
                Tovar shtrix-kodi yoki mijoz Nasiya kartasi
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

        {/* Camera View Area */}
        <div className="w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center border-2 border-emerald-500">
          <div id="camera-reader" className="w-full h-full"></div>

          {/* Scanner Overlay Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-36 border-2 border-dashed border-emerald-400 rounded-xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
              <div className="w-full h-0.5 bg-rose-500/80 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Scan Message / Error */}
        <div className="w-full mt-3">
          {errorMsg ? (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          ) : scanResult ? (
            scanResult.type === 'customer' ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 text-xs rounded-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Xaridor Nasiya Kartasi aniqlandi!</span>
                </div>
                {scanResult.customer ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-slate-900">
                      👤 {scanResult.customer.name}
                    </p>
                    <p className="text-xs text-amber-800">
                      Qarz balansi: <strong>{formatMoney(scanResult.customer.balance)}</strong> • Reyting: {'★'.repeat(scanResult.customer.rating || 5)}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      ✓ Kassaga muvaffaqiyatli biriktirildi!
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-800 font-semibold">
                    Karta ID topilmadi: {scanResult.code}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl animate-in zoom-in-95">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Shtrix-kod oʻqildi: {scanResult.code}</span>
                </div>
                {scanResult.product ? (
                  <p className="font-extrabold text-emerald-800">
                    ✓ {scanResult.product.name} savatga qoʻshildi!
                  </p>
                ) : (
                  <p className="text-amber-800 font-semibold">
                    Bu shtrix-kodli tovar hali kiritilmagan.
                  </p>
                )}
              </div>
            )
          ) : (
            <p className="text-center text-xs text-slate-500 font-medium">
              Shtrix-kod yoki Nasiya kartasini ramka ichiga toʻgʻrilang
            </p>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="w-full mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
