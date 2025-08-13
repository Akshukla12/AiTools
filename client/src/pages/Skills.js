import React, { useState, useContext, useEffect } from "react";
import { ProfileContext } from "../ProfileContext";
import { copyToClipboard, downloadText } from "../utils/exportUtils";

// Helper: turns AI output into skill chips
function parseSkills(response) {
  if (!response) return [];
  // Prefer comma separation, otherwise split lines
  let skills = [];
  if (response.includes(",")) {
    skills = response
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else {
    skills = response
      .split(/\n|[-•]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  // Remove bullets/numbers, de-duplicate, and cap at 20 skills
  return [...new Set(skills.map(sk =>
    sk.replace(/^([0-9]+[.)-]|[-•])\s*/, ""))
  )].slice(0, 20);
}

export default function Skills() {
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
      setError("Please provide details.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Give me a comma-separated, concise and modern list of top 20 professional skills suitable for LinkedIn, based on this profile: ${input}`
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

  const skillsArr = response ? parseSkills(response) : [];
  const allText = skillsArr.join(", ");

  return (
    <div className="container">
      <h2>Skills Generator</h2>
      <form onSubmit={handleSubmit}>
        <label>Paste your resume summary or describe your expertise *</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          required
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "Generating..." : "Generate Skills"}
        </button>
      </form>

      {skillsArr.length > 0 && (
        <div
          style={{
            marginTop: "1.6rem",
            padding: "2rem 2.5rem",
            background: "#f8fafc",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 46, 120, 0.09)",
            border: "1.5px solid #254ffe44",
            color: "#142e61"
          }}
        >
          <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "1.05rem" }}>
            Top AI-Picked Skills:
          </div>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 16px",
            marginBottom: "22px"
          }}>
            {skillsArr.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  background: "#e3ecff",
                  border: "1px solid #254ffe55",
                  color: "#254ffe",
                  borderRadius: "22px",
                  padding: "8px 20px",
                  fontWeight: 500,
                  fontSize: ".97rem",
                  boxShadow: "0 1px 6px rgba(37, 79, 254, .08)",
                  letterSpacing: ".01em"
                }}
              >
                {skill}
              </span>
            ))}
          </div>
          <button
            style={{ width: "auto", marginRight: "10px" }}
            onClick={() => copyToClipboard(allText)}
          >
            Copy All
          </button>
          <button
            style={{ width: "auto" }}
            onClick={() => downloadText(allText, `${profile.name || "skills"}.txt`)}
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
