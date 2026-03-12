import { HugeiconsIcon } from "@hugeicons/react";
// @mt-start
import { DashboardSquare01Icon, UserGroupIcon, Settings01Icon, Building01Icon } from "@hugeicons/core-free-icons";
// @mt-end
// @no-mt-start
import { DashboardSquare01Icon, UserGroupIcon, Settings01Icon } from "@hugeicons/core-free-icons";
// @no-mt-end
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@dyz-bunstack-app/ui";

const navItems = [
  { title: "Dashboard", to: "/", icon: DashboardSquare01Icon },
  { title: "Users", to: "/users", icon: UserGroupIcon },
  // @mt-start
  { title: "Organizations", to: "/organizations", icon: Building01Icon },
  // @mt-end
  { title: "Settings", to: "/settings", icon: Settings01Icon },
] as const;

export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.to === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.to}>
                        <HugeiconsIcon icon={item.icon} size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
