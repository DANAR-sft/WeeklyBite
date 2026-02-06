"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { checkLogin } from "../../actions/auth-action";
import { IAuthContextType } from "../../types/definitions";

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<string>("");

  const getUser = async () => {
    try {
      const user = await checkLogin();
      if (user) {
        setIsUser(user.email || "");
      }
    } catch (error) {
      console.log("getUser error >>>", error);
      setIsUser("");
    }
  };

  const refreshAuth = async () => {
    try {
      const user = await checkLogin();
      setIsLogin(!!user);
    } catch (err) {
      console.log("checkLogin error >>>", err);
      setIsLogin(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogin, setIsLogin, refreshAuth, isUser, setIsUser, getUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
