import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import AboutMe from "./pages/AboutMe";
import Headline from "./pages/Headline";
import Skills from "./pages/Skills";
import { ProfileProvider } from "./ProfileContext";
import "./styles.css";

function App() {
  return (
    <ProfileProvider>
      <Router>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />

          {/* Main Content Area */}
          <div style={{ marginLeft: "220px", padding: "40px 30px", flex: 1 }}>
            {/* Centered heading */}
            <h1
              style={{
                textAlign: "center",
                marginBottom: "40px",
                fontSize: "2.4rem",
                fontWeight: "700",
                color: "#254ffe",
                userSelect: "none",
              }}
            >
              LinkedIn Profile Builder
            </h1>

            {/* Page Content */}
            <Routes>
              <Route path="/about" element={<AboutMe />} />
              <Route path="/headline" element={<Headline />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/" element={<h2 style={{ textAlign: "center", color: "#102252" }}>Welcome! Select a tool from the sidebar.</h2>} />
            </Routes>
          </div>
        </div>
      </Router>
    </ProfileProvider>
  );
}

export default App;
