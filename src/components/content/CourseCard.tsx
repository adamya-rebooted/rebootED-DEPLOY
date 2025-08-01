
import React from "react";
import { Users, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Study-related background images for courses
const studyImages = [
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop&crop=center", // Library books
  "https://images.unsplash.com/photo-1472173148041-00294f0814a2?w=400&h=200&fit=crop&crop=center", // Computer and books
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=200&fit=crop&crop=center", // Stack of books
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=200&fit=crop&crop=center", // Study materials and pen
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=200&fit=crop&crop=center", // Study materials and pen
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=200&fit=crop&crop=center", // Study materials and pen
  "https://images.unsplash.com/photo-1515666991427-9b0f67becfa1?w=400&h=200&fit=crop&crop=center", // Study materials and pen
];

// Function to get a randomized image for each course
const getCourseImage = (courseId: string) => {
  // Use courseId as seed for consistent randomization per course
  const numericId = parseInt(courseId) || 0;
  const seed = numericId * 9301 + 49297; // Simple linear congruential generator
  const index = seed % studyImages.length;
  return studyImages[index];
};

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
      <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Course image with fallback */}
        <div className="w-full h-32 relative overflow-hidden">
          <img
            src={getCourseImage(course.id)}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center hidden">
            <div className="text-primary text-2xl font-bold">
              {course.title.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          {/* Course title */}
          <h3 className="font-bold text-card-foreground text-lg mb-1 truncate">
            {course.title}
          </h3>
          
          {/* Course description */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
          
          {/* Bottom action bar with icons */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium">{course.modules} modules</span>
              {course.enrolled !== undefined && (
                <>
                  <span className="text-muted-foreground/50">•</span>
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
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary hover:bg-secondary/10"
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
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
    <div className="bg-card border border-accent/20 rounded-xl shadow-lg hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 p-4 w-full max-w-xs flex flex-col cursor-pointer hover:border-accent/40 hover:bg-card/80">
      {/* Course image */}
      <div className="w-full h-36 mb-4 rounded-lg overflow-hidden">
        <img
          src={getCourseImage(course.id)}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient background if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center hidden">
          <div className="text-primary text-2xl font-bold">
            {course.title.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <div className="mb-3 text-primary font-bold text-lg truncate leading-tight">{course.title}</div>
      <div className="flex items-center text-xs mb-3 gap-2">
        <span className="bg-accent/10 text-primary rounded-full px-3 py-1 font-medium border border-accent/20">{course.category}</span>
        <span className="text-muted-foreground/50">•</span>
        <span className="text-muted-foreground font-medium">{course.duration}</span>
        <span className="text-muted-foreground/50">•</span>
        <span className="text-x muted-foreground font-medium">{course.modules} modules</span>
      </div>
      <div className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5em] leading-relaxed">{course.description}</div>
      
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
            className="w-full bg-accent/10 border-accent/30 text-primary hover:bg-accent/20 hover:border-accent/50 transition-all duration-200 font-medium"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Course
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto">
        {!isTeacher && course.progress !== undefined && (
          <div className="flex flex-col">
            <span className="text-xs text-primary font-medium uppercase tracking-wide">Progress</span>
            <div className="w-24 h-2 bg-accent/20 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{course.progress}%</span>
          </div>
        )}
        {isTeacher && course.enrolled !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{course.enrolled} enrolled</span>
          </div>
        )}
        {course.dueDate && !isTeacher && (
          <div className="text-xs text-muted-foreground/80 ml-2 font-medium">Due: {new Date(course.dueDate).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
