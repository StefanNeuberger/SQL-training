"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, Map, BarChart2, LogOut } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { UserSetup } from "./UserSetup";

const NAV_ITEMS = [
  { href: "/", icon: Database, label: "Dashboard" },
  { href: "/learn", icon: Map, label: "Learning Path" },
  { href: "/topics", icon: BookOpen, label: "Topics" },
  { href: "/progress", icon: BarChart2, label: "My Progress" },
];

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Database;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { username, userId, isLoading, login, logout } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  if (!username || !userId) {
    return <UserSetup onLogin={login} />;
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">SQL Training</div>
            <div className="text-xs text-neutral-500">PostgreSQL</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <div className="flex items-center justify-between rounded-lg px-3 py-2">
            <div>
              <div className="text-sm font-medium text-white">{username}</div>
              <div className="text-xs text-neutral-500">Local user</div>
            </div>
            <button
              onClick={logout}
              title="Change user"
              className="rounded p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
