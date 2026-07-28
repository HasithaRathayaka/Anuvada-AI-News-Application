"use client";

import { useState } from "react";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div
      className="card-surface"
      style={{
        padding: "32px 40px",
        marginTop: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
      }}
    >
      <div>
        <h2 className="h2" style={{ color: "#0D0D0F", letterSpacing: "-0.01em" }}>
          Stay Informed. Stay Balanced.
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "6px" }}>
          Get the top stories and bias analysis delivered to your inbox.
        </p>
      </div>

      {subscribed ? (
        <div style={{ color: "#1D4ED8", fontWeight: "600", fontSize: "14px" }}>
          ✓ Thank you for subscribing!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "440px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              flexGrow: 1,
              padding: "10px 16px",
              borderRadius: "4px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              backgroundColor: "#ffffff",
              color: "#0D0D0F",
              outline: "none",
            }}
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
