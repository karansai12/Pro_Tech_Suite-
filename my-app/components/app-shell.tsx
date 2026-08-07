"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useStore from "@/lib/store";

const AUTH_ROUTES = [
  "/employee-page",
  "/project-page",
  "/profile-page",
  "/task-page",
  "/home-page",
];
const NON_AUTH_ROUTES = ["/login-page", "/signup-page", "/"];

export function AppShell({ children }: { children: ReactNode }) {
  const { lastName, email, role } = useStore((state) => state.user);
console.log({role})
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isNonAuthRoute = NON_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const showSidebar = isAuthRoute && !isNonAuthRoute;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="text-2xl">Navigations</span>
          <h1 className="text-xl">{email}</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex flex-col gap-3">
            <Link
              href="/employee-page"
              className="text-blue-400 hover:text-blue-300"
            >
              Employee
            </Link>
            <Link
              href="/project-page"
              className="text-blue-400 hover:text-blue-300"
            >
              Project
            </Link>
            <Link
              href="/profile-page"
              className="text-blue-400 hover:text-blue-300"
            >
              Profile
            </Link>
            <Link
              href="/task-page"
              className="text-blue-400 hover:text-blue-300"
            >
              Task
            </Link>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="flex font-bold">
          <span>{lastName}</span>
          <span>{role}</span>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1">
        <div className="p-2">
          <SidebarTrigger />
        </div>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
