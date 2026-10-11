import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  products,
  customers,
  onVoiceAction
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback('Brauzeringizda ovozni aniqlash (Speech Recognition) qoʻllab-quvvatlanmaydi.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ'; // Uzbek language support, falls back gracefully

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Gapiring... (Masalan: "2 ta non", "1 qop un", "Rustam akaga 5L yog yoz")');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        parseVoiceCommand(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setFeedback('Mikrofon ruxsati berilmagan. Brauzer sozlamalarida ruxsat bering.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      setFeedback('Mikrofonni ishga tushirib boʻlmadi.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Smart parser for uzbek voice commands
  const parseVoiceCommand = (text) => {
    const lower = text.toLowerCase();
    const foundActions = [];

    // Check for customer mention
    let matchedCustomer = null;
    customers.forEach((c) => {
      const simpleName = c.name.toLowerCase().split(' ')[0]; // Rustam, Dilorom, etc.
      if (lower.includes(simpleName)) {
        matchedCustomer = c;
      }
    });

    // Check for products
    products.forEach((p) => {
      // Find keywords from product name: un, yog, non, tuxum, shakar, choy, makaron, tuz
      const words = p.name.toLowerCase().split(/[\s,()]+/);
      const isMentioned = words.some((w) => w.length > 2 && lower.includes(w));

      if (isMentioned) {
        // Try to extract quantity: "2 ta", "1 qop", "5 dona", "3 kg"
        let qty = 1;
        const numbers = lower.match(/(\d+)\s*(ta|dona|qop|kg|litr|pachka)?/);
        if (numbers && numbers[1]) {
          qty = parseInt(numbers[1], 10);
        }

        foundActions.push({
          product: p,
          quantity: qty,
          customer: matchedCustomer
        });
      }
    });

    setDetectedItems(foundActions);
  };

  const applyVoiceAction = () => {
    if (detectedItems.length > 0) {
      onVoiceAction(detectedItems);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base m-0">
              Ovozli Savdo Yordamchisi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Animated Mic Icon */}
        <div className="relative my-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/40 scale-110 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </div>
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-rose-400/50 animate-ping pointer-events-none"></div>
          )}
        </div>

        {/* Feedback / Instructions */}
        <p className="text-xs font-semibold text-slate-600 mb-2 px-2">
          {feedback}
        </p>

        {/* Live speech transcript */}
        <div className="w-full min-h-[50px] p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium mb-3 italic">
          {transcript || 'Ovozingiz kutilmoqda...'}
        </div>

        {/* Detected Parsed Items */}
        {detectedItems.length > 0 && (
          <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-left">
            <span className="text-[11px] font-bold text-emerald-800 block mb-1">
              ✓ Tushunilgan buyruq:
            </span>
            {detectedItems.map((item, idx) => (
              <div key={idx} className="text-xs font-extrabold text-slate-900">
                📦 {item.product.name} — {item.quantity} {item.product.unit}
                {item.customer && (
                  <span className="text-amber-800 block text-[11px]">
                    👤 Nasiyador: {item.customer.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex gap-2">
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            {isListening ? "To'xtatish" : 'Qayta gapirish'}
          </button>

          {detectedItems.length > 0 && (
            <button
              onClick={applyVoiceAction}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition shadow-md active:scale-95"
            >
              Savatga kiritish ✓
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
