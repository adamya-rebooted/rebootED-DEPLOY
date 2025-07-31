"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Gochi_Hand } from "next/font/google";

const gochiHand = Gochi_Hand({ subsets: ["latin"], weight: "400" });

const Sidebar: React.FC = () => {
  const { user, signOut } = useUser();
  const pathname = usePathname();
  const router = useRouter();
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
    <div className="w-64 h-screen bg-gradient-to-b from-gray-50 to-slate-100 border-r border-gray-200 flex flex-col">
      {/* Logo and Portal Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
            {/* <GraduationCap className="h-5 w-5 text-white" /> */}
            <img className="h-8 w-8 invert" src="/placeholder.svg" alt="rebootED" width={32} height={32} />
          </div>
          <span className={`text-xl font-bold text-primary ${gochiHand.className}`}>
            rebootED
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
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
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getUserInitials()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>

        {/* Settings and Sign Out */}
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 