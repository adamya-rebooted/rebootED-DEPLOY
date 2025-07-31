"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateCourse?: () => void;
  onAddTeacher?: () => void;
  onAddStudent?: () => void;
  onPreviewCourse?: () => void;
  onEditCourse?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  onCreateCourse,
  onAddTeacher,
  onAddStudent,
  onPreviewCourse,
  onEditCourse,
}) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar
          onCreateCourse={onCreateCourse}
          onAddTeacher={onAddTeacher}
          onAddStudent={onAddStudent}
          onPreviewCourse={onPreviewCourse}
          onEditCourse={onEditCourse}
        />
        <div className="flex-1 overflow-auto pt-16">
          <main className="h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 