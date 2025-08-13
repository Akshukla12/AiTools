import React, { useState, useContext, useEffect } from "react";
import { ProfileContext } from "../ProfileContext";
import { copyToClipboard, downloadText } from "../utils/exportUtils";

// Helper: turn Gemini output into clean headline list
function parseHeadlines(response) {
  if (!response) return [];
  return response
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^([0-9]+[.)-]|[-••])\s*/, ""))
    .filter(Boolean);
}

export default function Headline() {
  const { profile } = useContext(ProfileContext);
  const [input, setInput] = useState(profile.summary || "");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile.summary && !input) setInput(profile.summary);
  }, [profile.summary, input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse("");
    if (!input.trim()) {
      setError("Please enter your professional focus or summary.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Generate 6 stylish, modern, LinkedIn headline suggestions (one per line, no numbering or bullets), concise and energetic, based on this: ${input}`
        }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch {
      setError("Failed to contact the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const headlineList = response ? parseHeadlines(response) : [];
  const allText = headlineList.join("\n");

  return (
    <div className="container">
      <h2>Headline Generator</h2>
      <form onSubmit={handleSubmit} className="input-form">
        <label htmlFor="headline-input" className="form-label">
          Describe your professional focus or specialty <span className="required">*</span>
        </label>
        <textarea
          id="headline-input"
          className="form-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          required
          maxLength={250}
          placeholder="E.g. Full Stack Developer | React & Node.js | AI & Cloud Enthusiast"
          autoFocus
        />
        {error && <div className="form-error">{error}</div>}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="form-button"
        >
          {loading ? "Generating..." : "Generate Headline"}
        </button>
      </form>
      {headlineList.length > 0 && (
        <div style={{ marginTop: "1.7rem" }}>
          <strong className="output-title">AI-Generated LinkedIn Headline Suggestions:</strong>
          <div className="headline-list">
            {headlineList.map((hl, idx) => (
              <div key={idx} className="headline-card">{hl}</div>
            ))}
          </div>
          <div style={{ marginTop: "15px" }}>
            <button
              style={{ width: "auto", marginRight: "10px" }}
              onClick={() => copyToClipboard(allText)}
            >
              Copy All
            </button>
            <button
              style={{ width: "auto" }}
              onClick={() => downloadText(allText, `${profile.name || "headlines"}.txt`)}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
