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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySavedSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setUser(null);
          setAuthChecked(true);
        }
        return;
      }

      try {
        const data = await request("/api/auth/profile");

        if (isMounted) {
          setUser({
            name: data.name,
            email: data.email,
            phone: data.phone,
            _id: data._id,
            isAdmin: data.isAdmin,
            token,
          });
          setAuthChecked(true);
        }
      } catch {
        localStorage.removeItem("bangleUser");
        localStorage.removeItem("token");

        if (isMounted) {
          setUser(null);
          setAuthChecked(true);
        }
      }
    };

    verifySavedSession();

    return () => {
      isMounted = false;
    };
  }, []);

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
    setAuthChecked(true);
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
    setAuthChecked(true);
    return data;
  };

  const logout = () => {
    setUser(null);
    setAuthChecked(true);
    localStorage.removeItem("bangleUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, authChecked, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
