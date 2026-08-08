"use client";

import { Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { Nav } from "@/lib/api";

import { CMSLink } from "@/components/Link";

export const HeaderNav: React.FC<{ data: Nav }> = ({ data }) => {
  const navItems = data?.navItems || [];
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="flex items-center gap-6">
      {/* Desktop nav */}
      <ul className="hidden items-center gap-6 md:flex">
        {navItems.map((item, i) => (
          <li key={i}>
            <CMSLink
              label={item.label}
              url={item.url}
              appearance="inline"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            />
          </li>
        ))}
      </ul>

      <CMSLink
        url="/consultation"
        label="Book a Conversation"
        appearance="default"
        className="hidden rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-gold hover:text-gold-foreground sm:inline-flex"
      />

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted md:hidden"
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu panel — anchored directly under the sticky header */}
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-background/95 shadow-xl backdrop-blur-xl md:hidden"
        >
          <ul className="container-page flex flex-col gap-1 py-4">
            {navItems.map((item, i) => (
              <li key={i}>
                <CMSLink
                  label={item.label}
                  url={item.url}
                  appearance="inline"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-muted"
                />
              </li>
            ))}
            <li className="mt-2 px-1">
              <CMSLink
                url="/consultation"
                label="Book a Conversation"
                appearance="default"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-secondary px-5 py-3 text-center text-sm font-semibold text-secondary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
