import { useEffect } from "react";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Injects the Razorpay checkout script once (replacement for next/script).
 */
export function RazorpayScript() {
  useEffect(() => {
    if (document.getElementById("razorpay-checkout-js")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = RAZORPAY_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
