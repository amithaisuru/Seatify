
import { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 Add loading state

  useEffect(() => {
    // // const storedToken = sessionStorage.getItem('token');
    // // if (storedToken) {
    // //   const decoded = jwt_decode(storedToken);
    // //   const currentTime = Date.now() / 1000;

    // //   if (decoded.exp < currentTime) {
    // //     console.log('Token expired:', decoded.exp);
    // //     sessionStorage.removeItem('token');
    // //     setToken(null);
    // //     setUser(null);
    // //   } else {
    // //     console.log('Token valid:', decoded.exp);
    // //     setToken(storedToken);
    // //     setUser({
    // //       id: decoded.sub,
    // //       user_type: decoded.user_type
    // //     });
    // //   }
    // }
    // setLoading(false); // ✅ Done checking token
  }, []);

  const login = (newToken) => {
    const decoded = jwt_decode(newToken);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      sessionStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } else {
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({
        id: decoded.sub,
        user_type: decoded.user_type
      });
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
