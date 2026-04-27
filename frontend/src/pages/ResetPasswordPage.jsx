import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { request } from "../api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      await request(`/api/auth/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Reset Password</h2>
          <p className="muted">Choose a new secure password for your account.</p>
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn">
              Reset Password
            </button>
          </form>

          <p className="switch-text">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="auth-right">
          <img
            src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28"
            alt="reset password"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
