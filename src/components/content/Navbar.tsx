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
import { Gochi_Hand } from "next/font/google";

const gochiHand = Gochi_Hand({ subsets: ["latin"], weight: "400" });

const Navbar: React.FC = () => {
  const { user, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = user?.role === "teacher";

  const navigation = isTeacher
    ? [
        // { name: "Dashboard", href: "/teacher/dashboard", icon: BarChart3 },
        { name: "Courses", href: "/teacher/courses", icon: BookOpen },
        { name: "Students", href: "/teacher/students", icon: Users },
        // { name: "Settings", href: "/teacher/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/student/dashboard", icon: BookOpen },
        // { name: "My Progress", href: "/student/progress", icon: BarChart3 },
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
    <header className="h-16 border-b border-border bg-primary text-white shadow-lg">
      <div className="flex h-16 items-center justify-between px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center space-x-10">
          <Link href={isTeacher ? "/teacher/dashboard" : "/student/dashboard"} className="flex items-center space-x-3 group">
            <img src="/placeholder.svg" alt="Logo" className="h-9 w-9 invert" />
            <span className={`text-2xl font-bold tracking-tight text-white group-hover:text-secondary transition-colors ${gochiHand.className}`}>rebootED</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-white/20 text-white shadow"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-base text-white/90 font-medium flex items-center gap-2">
            <User className="h-5 w-5 text-secondary" />
            <span>{user?.id}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <div className={`h-2 w-2 rounded-full ${isTeacher ? "bg-secondary" : "bg-green-400"}`} />
            <span className="capitalize">{user?.role}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-white hover:bg-white/10 border border-white/20"
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline ml-2">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 