"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  isInstalled: boolean;
}

export const PWAContext = createContext<PWAContextType>({
  installPrompt: null,
  isInstalled: false,
});

export function usePWA() {
  return useContext(PWAContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone === true;

    setIsInstalled(standalone);

    // Capture installation prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // Installation completed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return (
    <Provider store={storeRef.current}>
      <AuthBootstrap />

      <PWAContext.Provider value={{ installPrompt, isInstalled }}>
        {children}
      </PWAContext.Provider>
    </Provider>
  );
}