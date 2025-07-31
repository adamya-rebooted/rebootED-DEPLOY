
import React from "react";
import { Users, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  enrolled?: number;
  progress?: number;
  status?: "not-started" | "in-progress" | "completed";
  dueDate?: string;
  category: string;
  imageUrl?: string; // Optional: for future image support
}

interface CourseCardProps {
  course: Course;
  isTeacher?: boolean;
  onAction?: (course: Course) => void;
  onPreview?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  variant?: "default" | "compact";
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isTeacher = false,
  onAction,
  onPreview,
  onEdit,
  onDelete,
  variant = "default",
}) => {
  // Compact variant for recent courses
  if (variant === "compact") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Image placeholder - you can replace with actual course image */}
        <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-2xl font-bold">
            {course.title.charAt(0).toUpperCase()}
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          {/* Course title */}
          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
            {course.title}
          </h3>
          
          {/* Course description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
          
          {/* Bottom action bar with icons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-medium">{course.modules} modules</span>
              {course.enrolled !== undefined && (
                <>
                  <span className="text-gray-300">•</span>
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{course.enrolled}</span>
                </>
              )}
            </div>
            
            {/* Action icons */}
            <div className="flex items-center gap-1">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(course);
                  }}
                  title="Preview course"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(course);
                  }}
                  title="Edit course"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course);
                  }}
                  title="Delete course"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant (existing implementation)
  return (
    <div className="bg-[#fafcff] border border-[#73afc9]/20 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#73afc9]/10 transition-all duration-300 p-4 w-full max-w-xs flex flex-col cursor-pointer hover:border-[#73afc9]/40 hover:bg-white">
      {/* Optional: Add image support here if available */}
      {/* {course.imageUrl && (
        <img
          src={course.imageUrl}
          alt={course.title}
          className="rounded-lg w-full h-36 object-cover mb-4"
        />
      )} */}
      <div className="mb-3 text-[#1f3a60] font-bold text-lg truncate leading-tight">{course.title}</div>
      <div className="flex items-center text-xs mb-3 gap-2">
        <span className="bg-[#73afc9]/10 text-[#1f3a60] rounded-full px-3 py-1 font-medium border border-[#73afc9]/20">{course.category}</span>
        <span className="text-[#070809]/50">•</span>
        <span className="text-[#070809]/70 font-medium">{course.duration}</span>
        <span className="text-[#070809]/50">•</span>
        <span className="text-[#070809]/70 font-medium">{course.modules} modules</span>
      </div>
      <div className="text-sm text-[#070809]/70 mb-4 line-clamp-2 min-h-[2.5em] leading-relaxed">{course.description}</div>
      
      {/* Action Buttons for Teachers */}
      {isTeacher && onPreview && (
        <div className="mb-3">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(course);
            }}
            variant="outline"
            size="sm"
            className="w-full bg-[#73afc9]/10 border-[#73afc9]/30 text-[#1f3a60] hover:bg-[#73afc9]/20 hover:border-[#73afc9]/50 transition-all duration-200 font-medium"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Course
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto">
        {!isTeacher && course.progress !== undefined && (
          <div className="flex flex-col">
            <span className="text-xs text-[#1f3a60] font-medium uppercase tracking-wide">Progress</span>
            <div className="w-24 h-2 bg-[#73afc9]/20 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#1e7656] rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-[#070809]/70 mt-1 font-medium">{course.progress}%</span>
          </div>
        )}
        {isTeacher && course.enrolled !== undefined && (
          <div className="flex items-center gap-1 text-xs text-[#070809]/70">
            <Users className="h-4 w-4 text-[#1f3a60]" />
            <span className="font-medium">{course.enrolled} enrolled</span>
          </div>
        )}
        {course.dueDate && !isTeacher && (
          <div className="text-xs text-[#070809]/60 ml-2 font-medium">Due: {new Date(course.dueDate).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
