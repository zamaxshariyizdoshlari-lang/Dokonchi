import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScannerModal({ isOpen, onClose, onDetected, products }) {
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
            qrbox: { width: 250, height: 160 },
            aspectRatio: 1.33
          },
          (decodedText) => {
            // Success
            handleSuccessfulScan(decodedText);
          },
          (errorMessage) => {
            // Continuous scanning log (ignore normal frame misses)
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

  const handleSuccessfulScan = (barcode) => {
    // Play a friendly beep sound using Web Audio API
    playBeepSound();

    const matchedProduct = products.find((p) => p.barcode === barcode);
    setScanResult({
      barcode,
      product: matchedProduct || null
    });

    if (matchedProduct) {
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
      osc.frequency.value = 880; // A5 note
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 150);
    } catch {
      // AudioContext might be blocked until user gesture
    }
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
            <h3 className="font-extrabold text-slate-900 text-base m-0">
              Kamera Shtrix-kod Skaneri
            </h3>
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kod oʻqildi: {scanResult.barcode}</span>
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
          ) : (
            <p className="text-center text-xs text-slate-500 font-medium">
              Shtrix-kodni qizil chiziq markaziga toʻgʻrilang
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
