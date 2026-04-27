import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("bangleUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("bangleUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("bangleUser");
      localStorage.removeItem("token");
    }
  }, [user]);

  // LOGIN
  const login = async (formData) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    console.log("LOGIN DATA:", data); // 👈 check this

    const userData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      _id: data._id,
      isAdmin: data.isAdmin, // 🔥 MUST
      token: data.token, // 🔥 MUST
    };

    localStorage.setItem("token", data.token);

    setUser(userData);
    return data;
  };

  const signup = async (formData) => {
    const data = await request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    const userData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      _id: data._id,
      isAdmin: data.isAdmin,
      token: data.token,
    };

    localStorage.setItem("token", data.token);

    setUser(userData);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bangleUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
