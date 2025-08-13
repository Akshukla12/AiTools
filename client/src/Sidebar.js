import React from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        {/* Logo image */}
        <img
          src="/profile-logo.png"
          alt="Profile Builder Logo"
          className="sidebar-logo"
        />
        <div className="sidebar-title">
          Profile <strong>Builder</strong>
        </div>
      </div>
      <nav>
        <ul>
          <li><Link to="/about">About Me Generator</Link></li>
          <li><Link to="/headline">Headline Generator</Link></li>
          <li><Link to="/skills">Skills Generator</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
