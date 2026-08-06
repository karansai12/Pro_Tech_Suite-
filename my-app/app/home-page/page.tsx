import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1>HOME</h1>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <span>Navigation</span>
            <SidebarContent>
              <SidebarGroup>
                <h2>
                  <Link href="/employee-page" className="text-blue-400">
                    Employee
                  </Link>
                </h2>
                <h2>
                  <Link href="/project-page" className="text-blue-400">
                    Project
                  </Link>
                </h2>
                <h2>
                  <Link href="/profile-page" className="text-blue-400">
                    profile
                  </Link>
                </h2>
                <h2>
                  <Link href="/task-page" className="text-blue-400">
                    Task
                  </Link>
                </h2>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>Profile Image - Role</SidebarFooter>
          </SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
};
export default HomePage;
