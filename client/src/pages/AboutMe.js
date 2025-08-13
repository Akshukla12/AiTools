import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../ProfileContext";
import { copyToClipboard, downloadText } from "../utils/exportUtils";

// Helper: splits About Me into card lines at newlines or emoji/number/bullet
function formatAboutMeOutput(response) {
  if (!response) return [];
  // Split on newlines or before a line beginning with emoji, dash, or number
  return response
    .split(/\n|(?=^[\p{Emoji}•–—\-0-9])/gu)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

export default function AboutMe() {
  const { profile, setProfile } = useContext(ProfileContext);
  const [summary, setSummary] = useState(profile.summary || "");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile((p) => ({ ...p, summary }));
  }, [summary, setProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse("");
    if (!summary.trim()) {
      setError("Summary cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Write a modern, multi-point "About Me" or LinkedIn summary using emoji for each main point. Be concise, direct, and achievement-focused, first making an intro sentence, then breaking into 4-6 short emoji-bulleted highlights based on: ${summary}`,
        }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch {
      setError("Failed to contact the server.");
    } finally {
      setLoading(false);
    }
  };

  const lines = response ? formatAboutMeOutput(response) : [];
  const fullText = lines.join("\n");

  return (
    <div className="container">
      <h2>About Me Generator</h2>
      <form onSubmit={handleSubmit}>
        <label>Profile Name (optional):</label>
        <input
          type="text"
          value={profile.name}
          onChange={e => setProfile((p) => ({ ...p, name: e.target.value }))}
          placeholder="Profile Name"
        />
        <label>Enter a brief summary *</label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={4}
          required
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" disabled={loading || !summary.trim()}>
          {loading ? "Generating..." : "Generate About Me"}
        </button>
      </form>

      {lines.length > 0 && (
        <div
          className="aboutme-card"
          style={{
            marginTop: "1.8rem",
            padding: "2rem 2.2rem 1.3rem",
            background: "#f8fafc",
            borderRadius: "17px",
            boxShadow: "0 4px 20px rgba(37,79,254,0.10)",
            border: "1.5px solid #254ffe22",
            color: "#142e61"
          }}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="aboutme-line"
              style={{
                fontSize: idx === 0 ? "1.09rem" : "1.06rem",
                marginBottom: "1.14rem",
                fontWeight: idx === 0 ? 700 : 500,
                display: "flex",
                alignItems: "flex-start",
                letterSpacing: ".01em"
              }}
            >
              {line}
            </div>
          ))}
          <div style={{ marginTop: "16px" }}>
            <button
              style={{ width: "auto", marginRight: "10px" }}
              onClick={() => copyToClipboard(fullText)}
            >
              Copy All
            </button>
            <button
              style={{ width: "auto" }}
              onClick={() => downloadText(fullText, `${profile.name || "aboutme"}.txt`)}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
