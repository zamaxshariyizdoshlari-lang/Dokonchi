import React, { useState } from 'react';
import { Bot, Send, User, CheckCircle2, ShoppingBag, BookOpen, Key, Sparkles, X, ChevronRight } from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function TelegramBotModal({ isOpen, onClose, customers, products, settings }) {
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation', 'setup'
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Assalomu alaykum! "${settings.shopName || 'Baraka Doʻkoni'}" rasmiy Telegram botiga xush kelibsiz.\n\nQuyidagi tugmalardan birini tanlang:`,
      buttons: ['💳 Mening qarzim qancha?', '📦 Tovar va narxlar', '🚚 Uydan buyurtma berish']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [botToken, setBotToken] = useState('7123456789:AAHxxxxxx...');

  if (!isOpen) return null;

  const handleUserAction = (actionText) => {
    // Append user message
    const newMsgs = [...messages, { sender: 'user', text: actionText }];

    // Bot response logic
    setTimeout(() => {
      let botReply = {};

      if (actionText === '💳 Mening qarzim qancha?') {
        botReply = {
          sender: 'bot',
          text: `Iltimos, ismingizni tanlang yoki telefon raqamingizni yozing:`,
          buttons: customers.slice(0, 3).map((c) => c.name)
        };
      } else if (customers.some((c) => c.name === actionText)) {
        const cust = customers.find((c) => c.name === actionText);
        if (cust) {
          botReply = {
            sender: 'bot',
            text: `Hurmatli ${cust.name}!\n\n📌 Sizning umumiy qarz balansingiz: ${formatMoney(cust.balance)}\n${cust.dueDate ? `📅 Kelishilgan to'lov sanasi: ${cust.dueDate}\n` : ''}\n📦 Oxirgi olingan tovarlar: ${cust.history?.[0]?.items || 'Un va boshqa mahsulotlar'}\n\nTo'lovni do'konga kelib yoki Payme/Click orqali amalga oshirishingiz mumkin.`,
            buttons: ['💳 Mening qarzim qancha?', '📦 Tovar va narxlar', '🚚 Uydan buyurtma berish']
          };
        }
      } else if (actionText === '📦 Tovar va narxlar') {
        let catalog = `🛒 DOʻKONIMIZDAGI ENG TALABGIR MAHSULOTLAR NARXI:\n\n`;
        products.slice(0, 6).forEach((p, idx) => {
          catalog += `${idx + 1}. ${p.name} — ${formatMoney(p.price)} (${p.unit})\n`;
        });
        catalog += `\nBarcha tovarlar yangi va sifatli!`;
        botReply = {
          sender: 'bot',
          text: catalog,
          buttons: ['🚚 Uydan buyurtma berish', '💳 Mening qarzim qancha?']
        };
      } else if (actionText === '🚚 Uydan buyurtma berish') {
        botReply = {
          sender: 'bot',
          text: `Buyurtma qilish uchun kerakli tovarlarni yozing (masalan: "1 qop un va 2 ta non"). Do'kondor Umarali aka tayyorlab qo'yadi yoki yetkazib beradi!`,
          buttons: ['1 qop un va 2 ta non olib qoʻying']
        };
      } else {
        botReply = {
          sender: 'bot',
          text: `Rahmat! Buyurtmangiz do'kondorga yetkazildi: "${actionText}". Tez orada siz bilan bog'lanamiz! ✓`,
          buttons: ['📦 Tovar va narxlar', '💳 Mening qarzim qancha?']
        };
      }

      setMessages((prev) => [...prev, botReply]);
    }, 400);

    setMessages(newMsgs);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    handleUserAction(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col h-[640px] max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Nav */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm m-0">
                Mahalla Telegram Boti
              </h3>
              <p className="text-[11px] text-sky-200">
                Mijozlar bilan onlayn aloqa & nasiya nazorati
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'simulation'
                ? 'bg-white text-sky-600 border-b-2 border-sky-500'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📱 Jonli Bot Simulyatori (Mijoz koʻrishi)
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'setup'
                ? 'bg-white text-sky-600 border-b-2 border-sky-500'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ⚙️ Botni Ulash Yoʻriqnomasi
          </button>
        </div>

        {/* TAB 1: SIMULATION */}
        {activeTab === 'simulation' && (
          <div className="flex-1 flex flex-col bg-[#0e1621] overflow-hidden">
            
            {/* Telegram Chat Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-[#2b5278] text-white rounded-br-none'
                        : 'bg-[#182533] text-slate-100 rounded-bl-none border border-slate-800'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Bot Interactive Reply Buttons */}
                  {m.buttons && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleUserAction(btn)}
                          className="px-3 py-1.5 rounded-xl bg-[#243547] hover:bg-[#2e4259] text-sky-300 font-bold text-[11px] border border-sky-500/20 shadow-xs transition active:scale-95"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 bg-[#17212b] border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Xabar yozing..."
                className="flex-1 px-3 py-2 bg-[#242f3d] text-white placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SETUP INSTRUCTIONS */}
        {activeTab === 'setup' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-sky-900">
              <h4 className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Oʻzingizning rasmiy botingizni ulash:
              </h4>
              <p className="leading-relaxed">
                Qishloqdoshlar uchun maxsus @BarakaBaqqolBot kabi Telegram bot yaratib, ushbu dastur bilan avtomatik bogʻlashingiz mumkin.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  1
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">@BotFather orqali bot oching</h5>
                  <p className="text-slate-500 mt-0.5">
                    Telegramda <strong>@BotFather</strong>ga kiring va <code>/newbot</code> buyrugʻini bering.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  2
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">Bot Tokenini nusxalang</h5>
                  <p className="text-slate-500 mt-0.5">
                    BotFather sizga bergan maxfiy API tokenni bu yerga kiriting:
                  </p>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full mt-1.5 p-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  3
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">Botingiz tayyor boʻladi!</h5>
                  <p className="text-slate-500 mt-0.5">
                    Mijozlar buyurtma berganda dasturingizda avtomatik koʻrinadi va xarid cheklari mijozga yetkaziladi.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Bot tokeni muvaffaqiyatli saqlandi!');
                setActiveTab('simulation');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs mt-2"
            >
              Tokenni Saqlash & Sinash ✓
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
