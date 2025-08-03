"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Menu,
  ChevronLeft,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { Gochi_Hand } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const gochiHand = Gochi_Hand({ subsets: ["latin"], weight: "400" });

const Sidebar: React.FC = () => {
  const { user, signOut } = useUser();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);

  const isTeacher = user?.role === "teacher";

  const navigation = isTeacher
    ? [
        { name: "Dashboard", href: "/management-dashboard", icon: BarChart3 },
        { name: "My Courses", href: "/management-dashboard", icon: BookOpen },
        { name: "Students", href: "/management-dashboard", icon: Users },
        { name: "Analytics", href: "/management-dashboard", icon: BarChart3 },
      ]
    : [
        { name: "Dashboard", href: "/management-dashboard", icon: BookOpen },
        { name: "My Courses", href: "/management-dashboard", icon: BookOpen },
        { name: "Progress", href: "/management-dashboard", icon: BarChart3 },
      ];

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return "U";
    const names = user.user_metadata.full_name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0]?.toUpperCase() || "U";
  };



  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Only redirect if sign out was successful
      router.push("/login");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while signing out";
      alert(`Sign out failed: ${errorMessage}. Please try again.`);
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-sidebar-gradient flex flex-col shadow-sm transition-all duration-300 ease-in-out`}>
      {/* Logo and Portal Name */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-sidebar relative`}>
        {/* Toggle Button */}
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-hover"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-2`}>
          <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <img className="h-8 w-8 invert" src="/placeholder.svg" alt="rebootED" width={32} height={32} />
          </div>
          {!isCollapsed && (
            <span className={`text-xl font-bold text-sidebar-foreground ${gochiHand.className}`}>
              rebootED
            </span>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {isTeacher ? "Teacher Portal" : "Student Portal"}
          </p>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant="outline"
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} transition-colors ${
                  isActive ? "" : ""
                }`}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  '--tw-border-opacity': '0.3'
                } as React.CSSProperties}
                title={isCollapsed ? item.name : undefined}
              >
                <Link href={item.href}>
                  <Icon className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-sidebar`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <span className="font-medium text-sm" style={{ color: 'var(--primary-foreground)' }}>
              {getUserInitials()}
            </span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>
                {user?.role || "User"}
              </p>
            </div>
          )}
        </div>

        {/* Settings and Sign Out */}
        <div className="space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
                {!isCollapsed && "Settings"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              style={{
                backgroundColor: 'var(--dropdown-bg)',
                borderColor: 'var(--dropdown-border)',
                color: 'var(--dropdown-foreground)'
              }}
              align="end"
              side="top"
            >
              <DropdownMenuLabel
                className="text-xs font-medium"
                style={{ color: 'var(--dropdown-label)' }}
              >
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                style={{
                  color: 'var(--dropdown-foreground)',
                  '--hover-bg': 'var(--dropdown-hover)',
                  '--focus-bg': 'var(--dropdown-hover)'
                } as React.CSSProperties}
                className="hover:bg-[var(--dropdown-hover)] focus:bg-[var(--dropdown-hover)]"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                style={{
                  color: 'var(--dropdown-foreground)',
                  '--hover-bg': 'var(--dropdown-hover)',
                  '--focus-bg': 'var(--dropdown-hover)'
                } as React.CSSProperties}
                className="hover:bg-[var(--dropdown-hover)] focus:bg-[var(--dropdown-hover)]"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                style={{
                  color: 'var(--dropdown-foreground)',
                  '--hover-bg': 'var(--dropdown-hover)',
                  '--focus-bg': 'var(--dropdown-hover)'
                } as React.CSSProperties}
                className="hover:bg-[var(--dropdown-hover)] focus:bg-[var(--dropdown-hover)]"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === "system" && <div className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("inverse")}
                style={{
                  color: 'var(--dropdown-foreground)',
                  '--hover-bg': 'var(--dropdown-hover)',
                  '--focus-bg': 'var(--dropdown-hover)'
                } as React.CSSProperties}
                className="hover:bg-[var(--dropdown-hover)] focus:bg-[var(--dropdown-hover)]"
              >
                <Palette className="mr-2 h-4 w-4" />
                <span>Inverse</span>
                {theme === "inverse" && <div className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
            title={isCollapsed ? (isLoading ? "Signing out..." : "Sign Out") : undefined}
          >
            <LogOut className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && (isLoading ? "Signing out..." : "Sign Out")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 

