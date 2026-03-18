"use client";

import { useState } from "react";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Xin chao, Bạn cần tìm sản phẩm nào?" },
  ]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "bot", content: "Cảm ơn bạn. Tính năng AI sẽ kết nối backend sau." },
    ]);
    setInput("");
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Chat hỗ trợ
        </button>
      ) : (
        <div className="w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white">
            <p className="text-sm font-semibold">Trợ lý Shop</p>
            <button onClick={() => setOpen(false)} className="text-xs">
              Đóng
            </button>
          </div>
          <div className="h-72 space-y-2 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user"
                    ? "ml-auto bg-amber-100 text-slate-800"
                    : "bg-slate-100 text-slate-700"
                  }`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Nhập tin nhắn..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
            <button
              onClick={sendMessage}
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
