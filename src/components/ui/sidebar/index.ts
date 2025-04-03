
// Re-export all sidebar components from this file
import { TooltipProvider } from "@/components/ui/tooltip"

// Context
export { SidebarProvider, useSidebar } from "./sidebar-context"

// Base components
export { 
  Sidebar, 
  SidebarTrigger, 
  SidebarRail, 
  SidebarInset 
} from "./sidebar-base"

// UI Elements
export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
  SidebarMenuSkeleton
} from "./sidebar-elements"

// Menu components
export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "./sidebar-menu"

// Exporting TooltipProvider for convenience since it's used with sidebar tooltips
export { TooltipProvider }
