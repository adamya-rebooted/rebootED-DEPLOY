'use client'

import React from "react";
import { useUser } from "@/contexts/UserContext";
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

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-gradient-to-r from-gray-100 to-slate-100 z-40 flex items-center justify-between px-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">
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
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course with AI
            </Button>
            <Button
              onClick={onCreateCourse}
              variant="outline"
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
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
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
            <Button
              onClick={onAddStudent}
              variant="outline"
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Add Student
            </Button>
            <Button
              onClick={onPreviewCourse}
              variant="outline"
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Preview Course
            </Button>
            <Button
              onClick={onEditCourse}
              variant="outline"
              className="border-[#1f3a60]/30 text-[#1f3a60] hover:bg-[#1f3a60]/5 transition-colors"
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