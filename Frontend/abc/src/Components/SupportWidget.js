import { useState, useRef, useEffect } from "react";

const QUICK_REPLIES = [
  { q: "Where's my order?", a: "Once you check out, you'll get a confirmation with delivery details. Most orders within Pakistan arrive in 2–4 working days." },
  { q: "What's your return policy?", a: "You can return any phone within 7 days of delivery if it's unused and in its original packaging. Contact us with your order number to start a return." },
  { q: "Do you offer installments?", a: "Yes — select installment plans are available at checkout for eligible cards. Look for the 'Installment Plan' link in the footer." },
  { q: "Is this phone PTA approved?", a: "All phones listed on Technest are PTA-approved and safe to use on Pakistani networks." },
  ];

const SupportWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! 👋 I'm the Technest support bot. Ask me something or tap a quick question below." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const respond = (text) => {
    const match = QUICK_REPLIES.find((q) => text.toLowerCase().includes(q.q.toLowerCase().split(" ")[0]));
    const reply =
      QUICK_REPLIES.find((q) => q.q.toLowerCase() === text.toLowerCase())?.a ||
      match?.a ||
      "Thanks for reaching out! For anything I can't answer here, please use Contact Us in the footer and our team will get back to you shortly.";
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTimeout(() => respond(text), 350);
  };

  return (
    <>
      <button
        className="tn-support-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--volt)",
          color: "var(--ink)",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "var(--shadow-md)",
          zIndex: 998,
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          className="tn-support-panel"
          style={{
            position: "fixed",
            bottom: 92,
            left: 24,
            width: 320,
            maxHeight: 440,
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            zIndex: 998,
            overflow: "hidden",
          }}
        >
          <div style={{ background: "var(--ink)", color: "#fff", padding: "14px 16px", fontFamily: "var(--font-display)", fontSize: 15 }}>
            Technest Support
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
              Usually replies in a few minutes
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                  background: m.from === "user" ? "var(--circuit)" : "var(--paper)",
                  color: m.from === "user" ? "#fff" : "var(--text)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 13.5,
                  maxWidth: "85%",
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: "0 14px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.q}
                onClick={() => sendMessage(q.q)}
                style={{
                  fontSize: 11.5,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  padding: "5px 10px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                {q.q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            style={{ display: "flex", borderTop: "1px solid var(--line)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              style={{ flex: 1, border: "none", padding: "12px 14px", fontSize: 13.5, fontFamily: "var(--font-body)" }}
            />
            <button type="submit" style={{ border: "none", background: "transparent", color: "var(--circuit)", fontWeight: 700, padding: "0 14px", cursor: "pointer" }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportWidget;