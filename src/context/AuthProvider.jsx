import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { checkSession } from "../api/authAPI";
import {AuthContext} from "./AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = chưa đăng nhập
  const [authenticate, setAuthenticate] = useState(false); // false = chưa xác thực
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("user", user);


  console.log("loading", loading);

  const checkUserSession = useCallback(async () => {
    try{
      const response = await checkSession();
      console.log("API Response:", response);

      // if (!isMountedRef.current) return;
      
      if(response?.success && response?.data){
        setUser(response.data);
        setAuthenticate(true);
        setError(null);
        console.log("User session valid:", response.data);
      }else{
        console.log("No valid user session"); 
        setAuthenticate(false);
        setUser(null);
        setError(null);
      }

    } catch (error) {
      console.error("Error checking user session:", error);
 
        setAuthenticate(false);
        setUser(null);
        setError(error.message);
    } finally {
      console.log("Finalizing session check");
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  
  const refreshSession = useCallback(() => {
    setLoading(true);
    setUser(null);
    setAuthenticate(false);
    setError(null);
    checkUserSession();
  }, [checkUserSession]);


  const contextValue = {
    user,
    loading,
    authenticate,
    error,
    setUser,
    setAuthenticate,
    clearError,
    refreshSession
  };
  
  console.log("AuthProvider context:", contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
