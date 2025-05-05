// src/components/Providers.tsx
"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";
import { SessionProvider } from "next-auth/react";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import AuthGuard from "@/components/auth-guard";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <AuthGuard>
          <NextTopLoader showSpinner={false} />
          <AntdRegistry>
            <QueryProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryProvider>
          </AntdRegistry>
          <ToastContainer position="bottom-right" />
        </AuthGuard>
      </SessionProvider>
    </AuthProvider>
  );
}
