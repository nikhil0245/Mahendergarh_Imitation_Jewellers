import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* LEFT */}
        <div className="auth-left">
          <h2>Welcome Back 👋</h2>
          <p className="muted">Login to your account</p>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              name="identifier"
              placeholder="Enter email or phone number"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>

          <p className="switch-text">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <p className="switch-text">
            New user? <Link to="/signup">Create account</Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="auth-right">
          <img
            src="https://images.unsplash.com/photo-1492724441997-5dc865305da7"
            alt="login"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
