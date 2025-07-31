"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  Moon,
  Sun,
  Monitor,
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
    <div className="w-64 h-screen bg-gradient-to-b from-gray-100 to-slate-100 flex flex-col shadow-sm">
      {/* Logo and Portal Name */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-[#1f3a60] rounded flex items-center justify-center">
            {/* <GraduationCap className="h-5 w-5 text-white" /> */}
            <img className="h-8 w-8 invert" src="/placeholder.svg" alt="rebootED" width={32} height={32} />
          </div>
          <span className={`text-xl font-bold text-gray-800 ${gochiHand.className}`}>
            rebootED
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {isTeacher ? "Teacher Portal" : "Student Portal"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant="outline"
                className={`w-full justify-start bg-white border-primary/30 text-primary hover:bg-primary/5 transition-colors ${
                  isActive ? "" : ""
                }`}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[#1f3a60] rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getUserInitials()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-600 capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>

        {/* Settings and Sign Out */}
        <div className="space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-gray-800 border-gray-700"
              align="end"
              side="top"
            >
              <DropdownMenuLabel className="text-xs font-medium text-gray-400">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === "system" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 

