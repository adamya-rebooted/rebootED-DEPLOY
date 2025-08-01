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
import { AlertTriangle, BookOpen, Lock, Loader2 } from "lucide-react";

interface PublishCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  onPublish?: () => Promise<void>;
}

const PublishCourseDialog: React.FC<PublishCourseDialogProps> = ({
  open,
  onOpenChange,
  courseTitle,
  onPublish,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!onPublish) return;

    try {
      setIsPublishing(true);
      setError(null);
      await onPublish();
      onOpenChange(false);
    } catch (err) {
      console.error('Error publishing course:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Publish Course
          </DialogTitle>
          <DialogDescription>
            You are about to publish "{courseTitle}". Please review the warning below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> When published, the course cannot be edited. 
              Make sure your course content is complete and ready for students to access.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Once published, this course will be locked from further modifications
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} variant="destructive">
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Publish Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishCourseDialog;