"use client";

import { Download, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { usePWA } from '@/components/providers'

export default function DownloadApp() {
  const { installPrompt, isInstalled } = usePWA();

  const handleInstall = async () => {
    // Already installed
    if (isInstalled) {
      toast("Already installed.", {
        icon: "📱",
        duration: 2500,
      });

      return;
    }

    // Browser hasn't provided the install prompt yet
    if (!installPrompt) {
      toast("Install option is not available yet.", {
        duration: 2500,
      });

      return;
    }

    try {
      await installPrompt.prompt();

      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        // The `appinstalled` event in Providers
        // will update isInstalled.
      }
    } catch (error) {
      console.error("PWA installation error:", error);
    }
  };

  return (
    <section className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--secondary)] px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)]/20 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[var(--primary)]/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row md:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                <Smartphone className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Download Our App
                </h2>

                <p className="mt-1 max-w-xl text-sm text-white/70 sm:text-base">
                  Get faster access to Sharif Commerce Academy. Install our
                  app and learn anytime, anywhere.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 font-semibold text-[var(--primary-foreground)] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <Download className="h-5 w-5" />

              {isInstalled ? "App Installed" : "Download App"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}