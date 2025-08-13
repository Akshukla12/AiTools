import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../ProfileContext";
import { copyToClipboard, downloadText } from "../utils/exportUtils";

// Helper: split About Me into visually distinct points
function formatAboutMeOutput(response) {
  if (!response) return [];
  // Split on newlines or lines starting with emoji/dash/number
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

  // base URL from env var
  const apiBaseUrl = process.env.REACT_APP_API_URL;

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
      const res = await fetch(`${apiBaseUrl}/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Write a modern, multi-point "About Me" or LinkedIn summary using emoji for each main point, based on: ${summary}`,
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
        {error && <div className="form-error">{error}</div>}
        <button type="submit" disabled={loading || !summary.trim()}>
          {loading ? "Generating..." : "Generate About Me"}
        </button>
      </form>
      {lines.length > 0 && (
        <div className="aboutme-card">
          {lines.map((line, idx) => (
            <div key={idx} className="aboutme-line">
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
