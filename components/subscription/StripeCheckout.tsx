'use client';

import { useState } from 'react';

interface StripeCheckoutProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
}

export default function StripeCheckout({ priceId, children, className }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!priceId) {
      console.error('Price ID is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();

      if (url) {
        // Redirection directe vers l'URL Stripe
        window.location.href = url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
