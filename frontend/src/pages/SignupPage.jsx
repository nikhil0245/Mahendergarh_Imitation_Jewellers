import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [signupMethod, setSignupMethod] = useState("email");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMethodChange = (method) => {
    setSignupMethod(method);
    setError("");
    setFormData((current) => ({
      ...current,
      email: method === "email" ? current.email : "",
      phone: method === "phone" ? current.phone : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signup({
        name: formData.name,
        password: formData.password,
        email: signupMethod === "email" ? formData.email : "",
        phone: signupMethod === "phone" ? formData.phone : "",
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* LEFT SIDE FORM */}
        <div className="auth-left">
          <h2>Create an account</h2>
          <p className="muted">Start your shopping journey ✨</p>

          {error && <p className="error">{error}</p>}

          <div className="auth-method-toggle" role="tablist" aria-label="Signup method">
            <button
              type="button"
              className={`auth-method-btn ${signupMethod === "email" ? "active" : ""}`}
              onClick={() => handleMethodChange("email")}
            >
              Use Email
            </button>
            <button
              type="button"
              className={`auth-method-btn ${signupMethod === "phone" ? "active" : ""}`}
              onClick={() => handleMethodChange("phone")}
            >
              Use Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            {signupMethod === "email" ? (
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            ) : (
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            )}

            <p className="auth-field-hint">
              {signupMethod === "email"
                ? "Use your email address for signup."
                : "Use your phone number for signup."}
            </p>

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="auth-right">
          <img
            src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b"
            alt="signup"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
