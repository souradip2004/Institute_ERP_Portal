// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              style: {
                border: '1px solid #10B981',
              },
            },
            error: {
              style: {
                border: '1px solid #EF4444',
              },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}