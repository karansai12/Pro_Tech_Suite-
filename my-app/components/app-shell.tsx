"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Button } from "./ui/button";

const AUTH_ROUTES = [
  "/employee-page",
  "/project-page",
  "/projectTable-page",
  "/task-page",
  "/taskTable-page",
];
const NON_AUTH_ROUTES = ["/login-page", "/signup-page", "/"];

export function AppShell({ children }: { children: ReactNode }) {
  const setUser = useStore((state)=>state.setUser)
  const { lastName, email, role } = useStore((state) => state.user);
  const router = useRouter();
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

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      role: null,
    });
    router.push("/");
   
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="text-2xl">Dashboard</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex flex-col gap-3">
            {role === "MANAGER" ? (
              <Link href="/employee-page">Employee</Link>
            ) : null}
            <Link
              href="/projectTable-page"
              
            >
              Project
            </Link>
            <Link
              href="/taskTable-page"
              
            >
              Task
            </Link>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="flex font-bold">
          <span>{lastName}</span>
          <h1 className="text-xl">{email}</h1>
          <span className="flex flex-row justify-between gap-2"> {role} 
          <Button onClick={handleLogout} variant="destructive" size="sm">
            Logout
            </Button>
            </span>
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
