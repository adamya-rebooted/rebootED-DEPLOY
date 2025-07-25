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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Clock, Users, Target, X, Plus, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: (course: any) => void;
}

export interface CourseFormData {
  title: string;
  description: string;
  difficulty: string;
  maxStudents: number;
  tags: string[];
  prerequisites: string;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({
  open,
  onOpenChange,
  onCourseCreated,
}) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    difficulty: "",
    maxStudents: 50,
    tags: [],
    prerequisites: "",
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Course title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Course description is required";
    }

    // if (!formData.difficulty) {
    //   newErrors.difficulty = "Please select a difficulty level";
    // }

    // if (formData.maxStudents < 1 || formData.maxStudents > 500) {
    //   newErrors.maxStudents = "Max students must be between 1 and 500";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear any existing errors

    try {
      // Call actual API
      const courseData = await apiService.createCourse({
        title: formData.title,
        body: formData.description // Map description to body
      });

      // Call the callback with the actual course data returned from API
      onCourseCreated?.(courseData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        difficulty: "",
        maxStudents: 50,
        tags: [],
        prerequisites: "",
      });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <BookOpen className="h-5 w-5" /> */}
            Create New Course
          </DialogTitle>
          <DialogDescription>
            {/* Fill in the details below to create a new learning course for your
            students. */}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Advanced React Development"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what students will learn in this course..."
                className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>



          {/* Tags */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags (Optional)</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div> */}

          {/* Prerequisites */}
          {/* <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites (Optional)</Label>
            <Textarea
              id="prerequisites"
              value={formData.prerequisites}
              onChange={(e) =>
                setFormData({ ...formData, prerequisites: e.target.value })
              }
              placeholder="List any prerequisites or recommended background knowledge..."
              className="min-h-[80px]"
            />
          </div> */}

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {/* <BookOpen className="mr-2 h-4 w-4" /> */}
                Create Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
