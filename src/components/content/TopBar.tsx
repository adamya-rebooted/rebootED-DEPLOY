'use client'

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Edit, GraduationCap } from "lucide-react";
import { useAIAssistant } from "@/components/ai-assistant";

interface TopBarProps {
  onCreateCourse?: () => void;
  onAddTeacher?: () => void;
  onAddStudent?: () => void;
  onPreviewCourse?: () => void;
  onEditCourse?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onCreateCourse,
  onAddTeacher,
  onAddStudent,
  onPreviewCourse,
  onEditCourse,
}) => {
  const { user } = useUser();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { showAssistant } = useAIAssistant();

  // Only show for teachers
  if (!user || user.role !== "teacher") {
    return null;
  }

  const isCourseManagement = pathname === "/management-dashboard";
  const isModifyCourse = pathname.startsWith("/modify-course");

  if (!isCourseManagement && !isModifyCourse) {
    return null;
  }

  const handleNavbarClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons or their children
    const target = e.target as HTMLElement;
    const isButton = target.closest('button') || target.closest('[role="button"]');
    if (!isButton) {
      toggleSidebar();
    }
  };

  return (
    <div 
      className={`fixed top-0 ${isCollapsed ? 'left-16' : 'left-64'} right-0 h-16 bg-topbar z-40 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ease-in-out cursor-pointer`}
      onClick={handleNavbarClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-topbar-foreground">
          {isCourseManagement ? "Course Management" : "Modify Course"}
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isCourseManagement && (
          <>
            <Button
              onClick={showAssistant}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course with AI
            </Button>
            <Button
              onClick={onCreateCourse}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </>
        )}

        {isModifyCourse && (
          <>
            <Button
              onClick={onAddTeacher}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <Users className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
            <Button
              onClick={onAddStudent}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Add Student
            </Button>
            <Button
              onClick={onPreviewCourse}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Preview Course
            </Button>
            <Button
              onClick={onEditCourse}
              variant="outline"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                '--tw-border-opacity': '0.3'
              } as React.CSSProperties}
              className="transition-colors hover:bg-primary/5"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar; 