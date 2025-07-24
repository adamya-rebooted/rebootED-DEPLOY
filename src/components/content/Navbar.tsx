"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import {
  BookOpen,
  Users,
  BarChart3,
  User,
} from "lucide-react";
import Link from "next/link";
import { Gochi_Hand } from "next/font/google";

const gochiHand = Gochi_Hand({ subsets: ["latin"], weight: "400" });

const Navbar: React.FC = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const isTeacher = user?.role === "teacher";

  const navigation = isTeacher
    ? [
        { name: "Dashboard", href: "/management-dashboard", icon: BarChart3 },
        { name: "Courses", href: "/management-dashboard", icon: BookOpen },
        // { name: "Students", href: "/teacher/students", icon: Users },
        // { name: "Settings", href: "/teacher/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/management-dashboard", icon: BookOpen },
        // { name: "My Progress", href: "/student/progress", icon: BarChart3 },
        // { name: "Profile", href: "/student/profile", icon: User },
      ];

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
        <div className="flex items-center">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar; 