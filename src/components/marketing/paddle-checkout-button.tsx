"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { paddleConfig, type CurrencyCode } from "@/lib/pricing";

// Paddle.js is loaded on demand — no third-party script on every page view,
// and the pricing page still renders fully without it.
const PADDLE_SCRIPT_SRC = "https://cdn.paddle.com/paddle/v2/paddle.js";

type PaddleGlobal = {
  Environment?: { set: (env: string) => void };
  Initialize: (options: { token: string }) => void;
  Checkout: { open: (options: Record<string, unknown>) => void };
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

let paddleReady: Promise<PaddleGlobal> | null = null;

function loadPaddle(): Promise<PaddleGlobal> {
  if (paddleReady) return paddleReady;

  paddleReady = new Promise<PaddleGlobal>((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }

    const script = document.createElement("script");
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      const paddle = window.Paddle;
      if (!paddle) {
        reject(new Error("Paddle failed to initialise"));
        return;
      }
      // Sandbox must be selected BEFORE Initialize.
      if (paddleConfig.environment === "sandbox") {
        paddle.Environment?.set("sandbox");
      }
      paddle.Initialize({ token: paddleConfig.clientToken });
      resolve(paddle);
    };
    script.onerror = () => reject(new Error("Paddle failed to load"));
    document.body.appendChild(script);
  }).catch((error) => {
    // Allow a later retry rather than caching the failure forever.
    paddleReady = null;
    throw error;
  });

  return paddleReady;
}

export function PaddleCheckoutButton({
  planKey,
  planName,
  ctaLabel,
  currency,
  emphasis,
  user,
  applyLaunchDiscount,
}: {
  planKey: string;
  planName: string;
  ctaLabel: string;
  currency: CurrencyCode;
  emphasis?: boolean;
  // Null when signed out. customData.userId is the ONLY link between a payment
  // and a workspace, so we must know who is buying before checkout opens.
  user: { id: string; email: string } | null;
  applyLaunchDiscount?: boolean;
}) {
  const [isOpening, setIsOpening] = useState(false);

  // Warm the script once the button is on screen so the overlay opens fast.
  useEffect(() => {
    if (!user) return;
    loadPaddle().catch(() => {
      /* surfaced on click instead — no need to alarm anyone on page load */
    });
  }, [user]);

  if (!user) {
    // Signed out: create the account first, then come back to buy.
    return (
      <Button asChild variant={emphasis ? "solid" : "outline"}>
        <Link href={"/register?next=/pricing" as Route}>Create your account to buy {planName}</Link>
      </Button>
    );
  }

  const priceId = paddleConfig.priceIds[planKey];

  async function openCheckout() {
    if (!priceId) {
      toast.error("Checkout isn't available for this plan yet.");
      return;
    }

    setIsOpening(true);
    try {
      const paddle = await loadPaddle();
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user!.email },
        // Read back by the webhook to grant the plan. Without this the payment
        // cannot be attributed to a workspace.
        customData: { userId: user!.id, planKey },
        ...(applyLaunchDiscount && paddleConfig.launchDiscountId
          ? { discountId: paddleConfig.launchDiscountId }
          : {}),
        settings: {
          displayMode: "overlay",
          theme: "light",
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
        },
      });
    } catch {
      toast.error("We couldn't open checkout. Please refresh and try again.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <Button
      type="button"
      variant={emphasis ? "solid" : "outline"}
      onClick={openCheckout}
      disabled={isOpening}
    >
      {isOpening ? "Opening checkout…" : ctaLabel}
    </Button>
  );
}
