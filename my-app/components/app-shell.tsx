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
  "/home-page",
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
    setUser({firstName:"" ,
      lastName:"",
      email:"",
      role:null,
    })
    router.push("/login-page")
   
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
              
            >
              Employee
            </Link>
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
          <span className="flex flex-row justify-between gap-2"> {role} 
          <Button  onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 size-sm">
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
