"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
const PWAContext = createContext({ canInstall: false, install: async () => {} });
export const usePWAInstall = () => useContext(PWAContext);

const PWAProvider = ({ children }) => {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setInstalled(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    if (!standalone) setInstalled(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setInstalled(true);
  };

  return (
    <PWAContext.Provider value={{ canInstall: Boolean(deferred), install, installed }}>
      {children}
    </PWAContext.Provider>
  );
};

export default PWAProvider;
