"use client";
import { useState, useEffect } from "react";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are an expert freelance proposal writer. Generate a professional, compelling freelance proposal based on the information provided. 

The proposal should include these sections:
1. **Introduction** - A warm, confident opening that addresses the client by name and shows understanding of their needs
2. **Scope of Work** - Clear bullet points of exactly what will be delivered
3. **Timeline** - A realistic breakdown of milestones
4. **Investment** - The price presented professionally with what it includes
5. **Why Me** - 2-3 sentences on why the freelancer is the right choice (infer from their service type)
6. **Next Steps** - A clear call to action to move forward

Tone: Professional but personable. Confident but not arrogant. Write in first person from the freelancer's perspective.

Return ONLY the proposal text with markdown formatting. No preamble, no explanation, just the proposal.`;

function Spinner() {
  return (
    <div style={{
      width: 28, height: 28,
      border: "3px solid rgba(255,200,100,0.2)",
      borderTop: "3px solid #FFC864",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
  );
}

 function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#8A8A8A",
      marginBottom: 8
    }}>
      {children} {required && <span style={{ color: "#FFC864" }}>*</span>}
    </label>
  );
}

 function Input({ value, onChange, placeholder, multiline, rows = 4 }) {
  const base = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#F0EDE8",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    resize: multiline ? "vertical" : "none"
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base}
        onFocus={e => e.target.style.borderColor = "#FFC864"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base}
        onFocus={e => e.target.style.borderColor = "#FFC864"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />;
}

function renderMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#FFC864;margin:28px 0 10px;font-family:\'DM Sans\',sans-serif;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;color:#F0EDE8;margin:32px 0 12px;font-family:\'Playfair Display\',serif;font-weight:700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:24px;color:#F0EDE8;margin:0 0 20px;font-family:\'Playfair Display\',serif">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F0EDE8;font-weight:600">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin:6px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:10px 0;color:#C8C4BC">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:12px 0;color:#C8C4BC;line-height:1.75">')
    .replace(/^(?!<[h|u|p|l])(.+)$/gm, '<p style="margin:12px 0;color:#C8C4BC;line-height:1.75">$1</p>');
}

export default function QuickProposal() {
  const [form, setForm] = useState({
    yourName: "", service: "", clientName: "", projectDescription: "", price: "", timeline: ""
  });
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("formatted");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const isValid = form.yourName && form.service && form.clientName && form.projectDescription && form.price && form.timeline;

  async function generate() {
    if (!isValid) return;
    setLoading(true);
    setError("");
    setProposal("");
    try {
      const userMessage = `Generate a freelance proposal with these details:
- Freelancer name/business: ${form.yourName}
- Service being offered: ${form.service}
- Client name: ${form.clientName}
- Project description: ${form.projectDescription}
- Price: ${form.price}
- Timeline: ${form.timeline}`;

      const res = await fetch("/api/proposal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
});
const data = await res.json();
if (!data.proposal) throw new Error("No proposal generated.");
setProposal(data.proposal);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F0E0C; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        ::placeholder { color: rgba(255,255,255,0.2); }
        textarea { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,200,100,0.2); border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0F0E0C",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,200,100,0.08) 0%, transparent 70%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 20px 80px"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: 52,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.6s ease"
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,200,100,0.08)", border: "1px solid rgba(255,200,100,0.2)",
            borderRadius: 100, padding: "5px 14px", marginBottom: 24
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFC864", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "#FFC864", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              AI-Powered
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(38px, 6vw, 60px)",
            fontWeight: 700,
            color: "#F0EDE8",
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: "-0.02em"
          }}>
            Quick<span style={{ color: "#FFC864" }}>Proposal</span>
          </h1>
          <p style={{ color: "#7A7672", fontSize: 17, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            Fill in 6 fields. Get a professional client proposal in seconds.
          </p>
        </div>

        <div style={{
          maxWidth: 920, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: proposal ? "1fr 1fr" : "1fr",
          gap: 24,
          transition: "grid-template-columns 0.4s ease"
        }}>

          {/* Form Panel */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: 32,
            animation: "fadeUp 0.5s ease both"
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#F0EDE8", marginBottom: 28 }}>
              Your Details
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <FieldLabel required>Your Name / Business</FieldLabel>
                <Input value={form.yourName} onChange={set("yourName")} placeholder="Alex Rivera Design" />
              </div>
              <div>
                <FieldLabel required>Your Service</FieldLabel>
                <Input value={form.service} onChange={set("service")} placeholder="Web Design" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <FieldLabel required>Client Name</FieldLabel>
              <Input value={form.clientName} onChange={set("clientName")} placeholder="Acme Corp / Sarah Johnson" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <FieldLabel required>Project Description</FieldLabel>
              <Input multiline rows={4} value={form.projectDescription} onChange={set("projectDescription")}
                placeholder="Redesign their e-commerce homepage, improve mobile UX, integrate with Shopify..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              <div>
                <FieldLabel required>Price</FieldLabel>
                <Input value={form.price} onChange={set("price")} placeholder="$2,500" />
              </div>
              <div>
                <FieldLabel required>Timeline</FieldLabel>
                <Input value={form.timeline} onChange={set("timeline")} placeholder="2 weeks" />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!isValid || loading}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: isValid && !loading ? "#FFC864" : "rgba(255,200,100,0.15)",
                border: "none",
                borderRadius: 12,
                color: isValid && !loading ? "#0F0E0C" : "#5A5550",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: isValid && !loading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}
            >
              {loading ? <><Spinner /> Generating your proposal...</> : "Generate Proposal →"}
            </button>

            {error && (
              <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>
            )}
          </div>

          {/* Output Panel */}
          {proposal && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 32,
              animation: "fadeUp 0.4s ease both",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#F0EDE8" }}>
                  Your Proposal
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {["formatted", "raw"].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: "6px 14px", borderRadius: 8, border: "1px solid",
                      borderColor: tab === t ? "#FFC864" : "rgba(255,255,255,0.1)",
                      background: tab === t ? "rgba(255,200,100,0.1)" : "transparent",
                      color: tab === t ? "#FFC864" : "#6A6660",
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
                      textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: 480,
                marginBottom: 20,
                paddingRight: 4
              }}>
                {tab === "formatted" ? (
                  <div
                    style={{ color: "#C8C4BC", lineHeight: 1.75, fontSize: 15 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(proposal) }}
                  />
                ) : (
                  <pre style={{
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    color: "#9A9590", fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, lineHeight: 1.7, background: "rgba(0,0,0,0.3)",
                    padding: 20, borderRadius: 10
                  }}>{proposal}</pre>
                )}
              </div>

              <button onClick={copyText} style={{
                width: "100%",
                padding: "14px 24px",
                background: copied ? "rgba(100,220,130,0.1)" : "rgba(255,200,100,0.08)",
                border: `1px solid ${copied ? "rgba(100,220,130,0.3)" : "rgba(255,200,100,0.2)"}`,
                borderRadius: 12,
                color: copied ? "#64DC82" : "#FFC864",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: "0.04em"
              }}>
                {copied ? "✓ Copied to clipboard!" : "Copy Proposal"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#3A3630", fontSize: 12, marginTop: 48, letterSpacing: "0.06em" }}>
          QUICKPROPOSAL · POWERED BY AI · BUILT FOR FREELANCERS
        </p>
      </div>
    </>
  );
}