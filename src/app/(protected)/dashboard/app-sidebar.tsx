// src/app/(protected)/dashboard/app-sidebar.tsx
"use client";

import { api } from "@/trpc/react";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  const {
    data: fetchedProjects,
    status,
    error,
  } = api.project.getProjects.useQuery();

  if (status === "pending") {
    return (
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" width={40} height={40} alt="logo" />
            {open && (
              <span className="text-primary/80 text-2xl font-bold">
                TELLGIT
              </span>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div>Loading projects...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (status === "error") {
    return (
      <Sidebar collapsible="icon" variant="floating">
        <SidebarContent>
          <div className="text-red-500">
            Error fetching projects: {error.message}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const projectsToDisplay = fetchedProjects || [];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" width={40} height={40} alt="logo" />
          {open && (
            <span className="text-primary/80 text-2xl font-bold">TELLGIT</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn({
                          "!bg-primary !text-white": pathname === item.url,
                        })}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsToDisplay.length > 0 ? (
                projectsToDisplay.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={`/dashboard?projectId=${project.id}`}
                        onClick={() => setProjectId(project.id)}
                      >
                        <div
                          className={cn(
                            "text-primary flex size-6 items-center justify-center rounded-sm border bg-white text-sm",
                            {
                              "bg-primary text-white": project.id === projectId,
                            },
                          )}
                        >
                          {project.name.split("")[0]}
                        </div>
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No projects found.
                </div>
              )}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create"}>
                    <Button variant={"outline"} className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
