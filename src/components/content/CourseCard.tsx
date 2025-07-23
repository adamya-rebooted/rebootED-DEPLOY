
import React from "react";
import { Users } from "lucide-react";

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
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isTeacher = false,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 w-full max-w-xs flex flex-col cursor-pointer">
      {/* Optional: Add image support here if available */}
      {/* {course.imageUrl && (
        <img
          src={course.imageUrl}
          alt={course.title}
          className="rounded-lg w-full h-36 object-cover mb-4"
        />
      )} */}
      <div className="mb-2 text-gray-800 font-semibold text-lg truncate">{course.title}</div>
      <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
        <span className="bg-gray-100 text-gray-600 rounded px-2 py-0.5">{course.category}</span>
        <span className="mx-1">•</span>
        <span>{course.duration}</span>
        <span className="mx-1">•</span>
        <span>{course.modules} modules</span>
      </div>
      <div className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5em]">{course.description}</div>
      <div className="flex items-center justify-between mt-auto">
        {!isTeacher && course.progress !== undefined && (
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Progress</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1">{course.progress}%</span>
          </div>
        )}
        {isTeacher && course.enrolled !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-4 w-4" />
            <span>{course.enrolled} enrolled</span>
          </div>
        )}
        {course.dueDate && !isTeacher && (
          <div className="text-xs text-gray-400 ml-2">Due: {new Date(course.dueDate).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
