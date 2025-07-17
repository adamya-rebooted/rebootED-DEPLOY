"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  LogOut,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = user?.role === "teacher";

  const navigation = isTeacher
    ? [
        { name: "Dashboard", href: "/teacher/dashboard", icon: BarChart3 },
        { name: "Courses", href: "/teacher/courses", icon: BookOpen },
        { name: "Students", href: "/teacher/students", icon: Users },
        { name: "Settings", href: "/teacher/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/student/dashboard", icon: BookOpen },
        { name: "My Progress", href: "/student/progress", icon: BarChart3 },
        { name: "Profile", href: "/student/profile", icon: User },
      ];

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      alert("An unexpected error occurred while signing out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      {/* <header className="border-b border-border bg-primary rounded 2x text-white"> */}
      {/* <header className="border-b border-border bg-primary text-white rounded-b-xl"> */}
      <header className="h-16 border-b border-border bg-primary text-white rounded-b-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              {/* <GraduationCap className="h-8 w-8 text-white" /> */}
              <img src="/placeholder.svg" alt="Logo" className="h-8 w-8 invert" />
              <span className="text-xl font-semibold text-white">rebootED</span>
            </div>

            {/* Navigation in header */}
            {/* <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav> */}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/80">
              <span className="hidden sm:inline">Welcome back, </span>
              <span className="font-medium text-white">{user?.id}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-white/70">
              <div
                className={`h-2 w-2 rounded-full ${
                  isTeacher ? "bg-secondary" : "bg-green-400"
                }`}
              />
              <span className="capitalize">{user?.role}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:bg-white/10"
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
  