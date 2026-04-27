import { useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSending(true);
      setMessage("");
      setError("");
      const data = await request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Forgot Password</h2>
          <p className="muted">Enter your email to receive a reset link.</p>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSending}
            />
            <button
              type="submit"
              className={`submit-btn ${isSending ? "is-loading" : ""}`}
              disabled={isSending}
            >
              {isSending ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          <p className="switch-text">
            Remembered it? <Link to="/login">Back to login</Link>
          </p>
        </div>

        <div className="auth-right">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            alt="forgot password"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
