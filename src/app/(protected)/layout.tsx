import { UserButton } from "@clerk/nextjs";
import React from "react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "./dashboard/app-sidebar";

type SideBarLayoutProps = {
  children: React.ReactNode;
};

const SideBarLayout = ({ children }: SideBarLayoutProps) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="m-2 w-full">
          <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
            {/* <SearchBar/> */}
            <div className="ml-auto"></div>
            <UserButton />
          </div>
          <div className="h-4"></div>
          {/* main content */}
          <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border shadow">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default SideBarLayout;
