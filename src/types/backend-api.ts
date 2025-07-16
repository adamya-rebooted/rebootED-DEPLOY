// Type definitions for Backend API Migration
// Maps backend DTOs to frontend interfaces

// ================ Request Types ================
import { ContentType } from '@/utils/api/backend-client';
export interface NewCourseRequest {
  title: string;
  body: string;
}

export interface UpdateCourseRequest {
  title: string;
  body: string;
}

export interface NewModuleRequest {
  title: string;
  body: string;
  courseId: number;
}

export interface UpdateModuleRequest {
  title: string;
  body: string;
  courseId: number;
}

export interface NewContentRequest {
  type: ContentType;
  title: string;
  body: string | null;
  moduleId: number;
  // Question-specific fields (only required when type is 'Question')
  options?: string[];
  correctAnswer?: string;
}

export interface UpdateContentRequest {
  title?: string;
  body?: string | null;
  type?: ContentType;
  moduleId?: number;
  // Question-specific fields (only required when type is 'Question')
  options?: string[];
  correctAnswer?: string;
}

export interface UserValidationRequest {
  usernames: string[];
}

export interface UserSearchRequest {
  usernames: string[];
}

export interface AddUsersRequest {
  usernames: string[];
}

export interface SubmitAnswerRequest {
  answer: string;
}

// ================ Response Types ================

export interface Course {
  id: number;
  title: string;
  body: string;
  teacherCount?: number;
  studentCount?: number;
  moduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: number;
  title: string;
  body: string;
  courseId: number;
  progress?: number;
  contentCount?: number;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Base content interface
export interface Content {
  id: number;
  title: string;
  body: string | null;
  type: 'Text' | 'Question';
  moduleId: number;
  position: number;
  isComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Question-specific content interface (extends Content for QuestionContentDTO)
export interface QuestionContent extends Content {
  type: 'Question';
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
}

// Union type for API responses that might return either Content or QuestionContent
export type ContentResponse = Content | QuestionContent;

// Type guard to check if content is a question
export function isQuestionContent(content: Content): content is QuestionContent {
  return content.type === 'Question' && 'options' in content;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  userType: 'LDUser' | 'EmployeeUser';
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCourse {
  id: number;
  title: string;
  body: string;
  role: 'teacher' | 'student';
  createdAt?: string;
  progress?: number;
}

export interface CourseUser {
  courseId: number;
  userId: string;
  username: string;
  fullName: string;
  role: 'teacher' | 'student';
  userType: 'LDUser' | 'EmployeeUser';
  joinedAt?: string;
}

// ================ Legacy Supabase Compatibility Types ================
// These help with gradual migration from Supabase data structures

export interface LegacyCourse {
  id: string; // Supabase uses UUID strings
  title: string;
  body: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields from Supabase that may exist
  user_id?: string;
  is_public?: boolean;
}

export interface LegacyModule {
  id: string; // Supabase uses UUID strings
  title: string; // Note: Supabase uses 'title' vs backend 'name'
  description?: string;
  course_id: string; // Supabase foreign key
  created_at?: string;
  updated_at?: string;
  position?: number;
}

export interface LegacyUser {
  id: string;
  username: string;
  full_name?: string;
  user_type?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// ================ Utility Types ================

export interface ApiValidationResponse {
  [username: string]: boolean;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  status: number;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// ================ Migration Feature Flag Types ================

export interface MigrationConfig {
  useBackend: boolean;
  useBackendForCourses: boolean;
  useBackendForModules: boolean;
  useBackendForUsers: boolean;
  useBackendForContent: boolean;
  rollbackDashboard: boolean;
  rollbackCreateCourse: boolean;
}

// ================ Frontend Component Types ================
// Types specifically for frontend components during migration

export interface LDUser {
  username: string;
  userType: 'LDUser' | 'EmployeeUser';
}

export interface ContentBlock {
  id: string;
  type: 'Text' | 'Question';
  title: string;
  content: string;
  isComplete: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  contentBlocks: ContentBlock[];
}

// ================ Data Mapping Types ================

export interface DataMappingConfig {
  // ID mappings (UUID strings -> numbers)
  idMappings: {
    [supabaseId: string]: number;
  };

  // Field name mappings
  fieldMappings: {
    supabaseField: string;
    backendField: string;
  }[];
}

// ================ Error Handling Types ================

export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'
  | 'TIMEOUT';

export interface DetailedApiError {
  type: ApiErrorType;
  message: string;
  status: number;
  details?: any;
  retryable: boolean;
}

// ================ Union Types for Type Safety ================

export type BackendRequestTypes =
  | NewCourseRequest
  | UpdateCourseRequest
  | NewModuleRequest
  | UpdateModuleRequest
  | NewContentRequest
  | UpdateContentRequest
  | UserValidationRequest
  | UserSearchRequest
  | AddUsersRequest
  | SubmitAnswerRequest;

export type BackendResponseTypes =
  | Course
  | Module
  | Content
  | QuestionContent
  | UserProfile
  | UserCourse
  | CourseUser;

export type LegacySupabaseTypes =
  | LegacyCourse
  | LegacyModule
  | LegacyUser; 