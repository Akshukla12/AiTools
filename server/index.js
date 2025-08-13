require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const fetch = require('node-fetch');
// For Node <18

const app = express();
app.use(cors());
app.use(express.json());

app.post('/gemini', async (req, res) => {
  const { summary } = req.body;
  const payload = {
    contents: [
      { parts: [{ text: summary }] }
    ]
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    const data = await geminiRes.json();
    console.log('Gemini API raw response:', data); // <-- add this line!

    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
    res.json({ response: responseText });
  } catch (err) {
    console.error("Gemini API error:", err); // <-- shows actual error details
    res.status(500).json({ response: "Error contacting Gemini API." });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
