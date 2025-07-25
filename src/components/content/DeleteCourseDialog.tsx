import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Course } from "@/types/backend-api";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onConfirmDelete: (courseId: number) => Promise<void>;
}

const DeleteCourseDialog: React.FC<DeleteCourseDialogProps> = ({
  open,
  onOpenChange,
  course,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!course) return;

    setIsDeleting(true);
    setError(null); // Clear any existing errors

    try {
      await onConfirmDelete(course.id);
      // Only close the dialog if deletion was successful
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course. Please try again.';
      setError(errorMessage);
    } finally {
      // Always reset loading state, even if deletion failed
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Course
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this course?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Course to be deleted:</h4>
            <p className="font-semibold">{course.title}</p>
            {course.body && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.body}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              <span>Teachers: {course.teacherCount || 0}</span>
              <span>Students: {course.studentCount || 0}</span>
              <span>Modules: {course.moduleCount || 0}</span>
            </div>
          </div>

          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this course will permanently remove all associated modules, content, and student progress. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCourseDialog; 