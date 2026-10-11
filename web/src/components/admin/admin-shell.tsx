"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, FolderKanban, Inbox, KeyRound, LayoutDashboard, LogOut, Menu, ScrollText, Settings, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { adminOps } from "@/lib/admin/ops-copy";

const ops = adminOps("ka");

const NAV = [
  { key: "dashboard", href: "/admin", label: "მთავარი", icon: LayoutDashboard },
  { key: "services", href: "/admin/services", label: "სერვისები", icon: Wrench },
  { key: "projects", href: "/admin/projects", label: "პროექტები", icon: FolderKanban },
  { key: "pages", href: "/admin/pages", label: "გვერდები და ტექსტები", icon: FileText },
  { key: "team", href: "/admin/team", label: "გუნდი", icon: Users },
  { key: "settings", href: "/admin/settings", label: "პარამეტრები", icon: Settings },
  { key: "messages", href: "/admin/messages", label: "შეტყობინებები", icon: Inbox },
  { key: "tokens", href: "/admin/tokens", label: ops.navTokens, icon: KeyRound },
  { key: "audit", href: "/admin/audit", label: ops.navAudit, icon: ScrollText },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const logout = async () => {
    await fetch("/api/v1/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-primary text-primary-foreground md:min-h-screen md:border-b-0">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="inline-flex rounded-[10px] bg-white px-3 py-2" aria-label="globalAI — ადმინი">
            <Image src="/brand/globalai-logo.png" alt="globalAI" width={1471} height={292} priority style={{ height: 22, width: "auto" }} />
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-label="მენიუ"
            aria-expanded={isOpen}
            aria-controls="admin-nav"
            data-testid="admin-menu-toggle"
            onClick={() => setIsOpen((v) => !v)}
          >
            <Menu className="size-6" />
          </button>
        </div>
        <nav id="admin-nav" aria-label="ადმინის ნავიგაცია" className={cn("flex-col gap-1 px-3 pb-4 md:flex", isOpen ? "flex" : "hidden")}>
          {NAV.map(({ key, href, label, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              data-testid={`admin-nav-${key}`}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white",
                isActive(href) && "bg-white/10 text-white shadow-[inset_3px_0_0_#FF3A17]",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={logout}
            data-testid="admin-logout"
            className="mt-4 justify-start gap-3 rounded-none px-3 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden="true" />
            გასვლა
          </Button>
        </nav>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
