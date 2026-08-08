"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  Share,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePWA } from "@/components/providers";

export default function DownloadApp() {
  const { installPrompt } = usePWA();

  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    setIsIOS(ios);
  }, []);

  const handleInstall = async () => {
    // iOS
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // Android / Chrome / Edge / supported browsers
    if (installPrompt) {
      try {
        await installPrompt.prompt();

        await installPrompt.userChoice;
      } catch (error) {
        console.error("PWA installation error:", error);
      }

      return;
    }

    // Browser does not currently provide an install prompt
    toast("Install option is not available right now.", {
      duration: 3000,
    });
  };

  return (
    <>
      {/* Download App Section */}
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
                Download App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* iOS Installation Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--card)] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Smartphone className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Install SCA App
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Install Sharif Commerce Academy on your iPhone for faster access
              to your courses.
            </p>

            {/* Step 1 */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)]">
                <Share className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  1. Tap Share
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">
                  Tap the <strong>Share</strong> button in Safari.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mt-5 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)]">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  2. Add to Home Screen
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">
                  Select <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mt-5 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)]">
                <Download className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  3. Tap Add
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">
                  Confirm by tapping <strong>Add</strong>.
                </p>
              </div>
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-7 w-full rounded-xl bg-[var(--primary)] px-5 py-3.5 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}