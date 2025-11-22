import "@/app/globals.css";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ThemeProvider } from "next-themes";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { fontGeist, fontHeading, fontSans, fontUrban } from "@/assets/fonts";
import { Analytics } from "@/components/analytics";
import ModalProvider from "@/components/modals/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { cn, constructMetadata } from "@/lib/utils";
import ReactQueryProvider from "@/utils/ReactQueryProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = constructMetadata();
import { connection } from "next/server"; // [!code ++]
import { Suspense } from "react"; // [!code ++]

async function UTSSR() {
  await connection(); // [!code ++]

  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable,
          fontGeist.variable
        )}
      >
        <Suspense>
          <UTSSR />
        </Suspense>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <ModalProvider>{children}</ModalProvider>
            <Analytics />
            <Toaster closeButton richColors />
            <TailwindIndicator />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
