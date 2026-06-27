"use client";

import { ReactNode } from "react";
import { CrmProvider } from "@/components/crm/crm-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { BrandCursor } from "@/components/brand-cursor";
import { ScrollAnimationProvider } from "@/components/animation/scroll-animation-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CrmProvider>
          <ScrollAnimationProvider>
          <BrandCursor />
          {children}
          </ScrollAnimationProvider>
        </CrmProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
