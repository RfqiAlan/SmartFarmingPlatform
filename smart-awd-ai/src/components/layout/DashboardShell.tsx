"use client";

import { Topbar } from "@/components/layout/Topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Topbar />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
      <footer className="py-3 text-center text-xs text-[var(--text-muted)] border-t border-[var(--bg-glass-border)]">
        &copy; 2026 AI Agriculture
      </footer>
    </div>
  );
}
