"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { AuthBootstrap } from "@/components/auth/auth-bootstrap";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

interface PWAContextType {
  installPrompt: BeforeInstallPromptEvent | null;
}

const PWAContext = createContext<PWAContextType>({
  installPrompt: null,
});

export function usePWA() {
  return useContext(PWAContext);
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Capture the browser's PWA installation prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <Provider store={storeRef.current}>
      <AuthBootstrap />

      <PWAContext.Provider value={{ installPrompt }}>
        {children}
      </PWAContext.Provider>
    </Provider>
  );
}