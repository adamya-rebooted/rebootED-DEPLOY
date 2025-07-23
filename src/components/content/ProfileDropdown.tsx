"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
} from "lucide-react";

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className }) => {
  const { user, signOut } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

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

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "light":
        return "Light";
      default:
        return "System";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center space-x-2 text-white hover:bg-white/10 border border-white/20 ${className}`}
        >
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-secondary" />
            <span className="hidden sm:inline text-base font-medium">
              {user?.user_metadata?.full_name || "User"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <div className={`h-2 w-2 rounded-full ${user?.role === "teacher" ? "bg-secondary" : "bg-green-400"}`} />
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme Selection */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
