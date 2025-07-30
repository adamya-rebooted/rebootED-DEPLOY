import React, { useState, useEffect, useCallback } from "react";
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
// Note: Select components not used in current implementation but kept for potential future use
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, GraduationCap, X, Plus, Loader2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { apiService } from "@/services/api";
import { UserProfile } from "@/types/backend-api";
import { toast } from "sonner";

interface AddUserToCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  userType: 'teacher' | 'student';
  onUserAdded?: () => void;
}

const AddUserToCourseDialog: React.FC<AddUserToCourseDialogProps> = ({
  open,
  onOpenChange,
  courseId,
  userType,
  onUserAdded,
}) => {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [currentMembers, setCurrentMembers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCurrentMembersExpanded, setIsCurrentMembersExpanded] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // Currently unused but kept for future use
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadAvailableUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    
    try {
      // Get all users of the requested type
      const allUsers = userType === 'teacher' 
        ? await apiService.getAllTeachers()
        : await apiService.getAllStudents();

      // Get current course members to exclude them
      const currentCourseMembers = userType === 'teacher'
        ? await apiService.getCourseTeachers(courseId)
        : await apiService.getCourseStudents(courseId);

      // Store current members for display
      setCurrentMembers(currentCourseMembers);

      // Filter out users already in the course
      const currentMemberUsernames = new Set(currentCourseMembers.map(user => user.username));
      const availableForAddition = allUsers.filter(user => !currentMemberUsernames.has(user.username));

      setAvailableUsers(availableForAddition);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [courseId, userType]);

  // Load available users when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    } else {
      // Reset state when dialog closes
      setSelectedUsers([]);
      setSearchTerm('');
      setCurrentMembers([]);
      setIsCurrentMembersExpanded(false);
      setError(null);
    }
  }, [open, loadAvailableUsers]);

  const handleAddUser = (user: UserProfile) => {
    if (!selectedUsers.find(selected => selected.username === user.username)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (username: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.username !== username));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to add');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const usernames = selectedUsers.map(user => user.username);
      
      if (userType === 'teacher') {
        await apiService.addTeachersToCourse(courseId, usernames);
        toast.success(`Successfully added ${selectedUsers.length} teacher${selectedUsers.length > 1 ? 's' : ''} to the course`);
      } else {
        await apiService.addStudentsToCourse(courseId, usernames);
        toast.success(`Successfully added ${selectedUsers.length} student${selectedUsers.length > 1 ? 's' : ''} to the course`);
      }

      onUserAdded?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error adding users to course:', err);
      setError(err instanceof Error ? err.message : 'Failed to add users to course');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const userTypeLabel = userType === 'teacher' ? 'Teacher' : 'Student';
  const userTypePlural = userType === 'teacher' ? 'Teachers' : 'Students';
  const IconComponent = userType === 'teacher' ? Users : GraduationCap;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Add {userTypePlural} to Course
          </DialogTitle>
          <DialogDescription>
            Select {userType === 'teacher' ? 'teachers' : 'students'} to add to this course. Only users not already enrolled are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Search {userTypePlural}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={`Search by username, name, or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loadingUsers}
              />
            </div>
          </div>

          {/* Current Course Members Section */}
          {currentMembers.length > 0 && (
            <div>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-0 h-auto font-normal hover:bg-transparent"
                onClick={() => setIsCurrentMembersExpanded(!isCurrentMembersExpanded)}
              >
                <Label className="cursor-pointer">
                  Current {userTypePlural} in Course ({currentMembers.length})
                </Label>
                {isCurrentMembersExpanded ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              {isCurrentMembersExpanded && (
                <div className="mt-2">
                  <div className="border rounded-md max-h-40 overflow-y-auto bg-muted/30">
                    {currentMembers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-muted-foreground">{user.username}</div>
                          <div className="text-sm text-muted-foreground/70">
                            {user.fullName} {user.email && `(${user.email})`}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Enrolled
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Available Users Dropdown */}
          <div>
            <Label>Available {userTypePlural}</Label>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading {userType === 'teacher' ? 'teachers' : 'students'}...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center p-4 border rounded-md text-muted-foreground">
                No {userType === 'teacher' ? 'teachers' : 'students'} available to add
              </div>
            ) : (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No users found matching &ldquo;{searchTerm}&rdquo;
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleAddUser(user)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.fullName} {user.email && `(${user.email})`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddUser(user);
                        }}
                        disabled={selectedUsers.some(selected => selected.username === user.username)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <Label>Selected {userTypePlural} ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-muted/50 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.username}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {user.username}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveUser(user.username)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedUsers.length === 0}
            className="min-w-24"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : userTypeLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserToCourseDialog;