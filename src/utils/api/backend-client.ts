// Backend API Client for Spring Boot Integration
// Clean implementation with comprehensive error handling
export enum ContentType {
  Text = 'Text',
  MultipleChoiceQuestion = 'MultipleChoiceQuestion',
  Video = 'Video',
  MatchingQuestion = 'MatchingQuestion',
}

import {
  NewCourseRequest,
  UpdateCourseRequest,
  NewModuleRequest,
  UpdateModuleRequest,
  NewContentRequest,
  UpdateContentRequest,
  UpdateTextContentRequest,
  UpdateMultipleChoiceQuestionRequest,
  UpdateMatchingQuestionRequest,
  UpdateVideoContentRequest,
  Course,
  Module,
  Content,
  ContentResponse,
  UserProfile,
  UserCourse,
  CourseUser,
  SubmitAnswerRequest,
} from '@/types/backend-api';
import { getBackendConfig } from '@/utils/config/backend';
import { createClient } from '@/utils/supabase/client';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class BackendApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private supabase = createClient();

  constructor() {
    const config = getBackendConfig();
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
  }

  private async getAuthToken(): Promise<string | null> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    console.log(`[AUTH_API] ${timestamp} - Getting authentication token`);
    
    try {
      // Always try to get a fresh session first
      console.log(`[AUTH_API] ${timestamp} - Attempting to get current session`);
      const sessionStartTime = performance.now();
      let { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      const sessionTime = performance.now() - sessionStartTime;
      
      console.log(`[AUTH_API] ${timestamp} - Session request completed in ${sessionTime.toFixed(2)}ms`);

      // If we have a session error or no session, try to refresh
      if (sessionError || !session) {
        console.log(`[AUTH_API] ${timestamp} - No valid session found (error: ${sessionError?.message || 'none'}), attempting refresh...`);
        const refreshStartTime = performance.now();
        const { data, error } = await this.supabase.auth.refreshSession();
        const refreshTime = performance.now() - refreshStartTime;
        
        if (error) {
          console.warn(`[AUTH_API] ${timestamp} - Failed to refresh session after ${refreshTime.toFixed(2)}ms:`, error);
          return null;
        }
        session = data.session;
        console.log(`[AUTH_API] ${timestamp} - Session refreshed successfully in ${refreshTime.toFixed(2)}ms`);
      }

      // Double check we have a valid token
      if (!session?.access_token) {
        console.warn(`[AUTH_API] ${timestamp} - No access token available after session check`);
        return null;
      }

      const totalTime = performance.now() - startTime;
      const tokenLength = session.access_token.length;
      const tokenPreview = session.access_token.substring(0, 20) + '...';
      
      console.log(`[AUTH_API] ${timestamp} - Successfully retrieved auth token in ${totalTime.toFixed(2)}ms (length: ${tokenLength}, preview: ${tokenPreview})`);
      return session.access_token;
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.warn(`[AUTH_API] ${timestamp} - Failed to get auth token after ${errorTime.toFixed(2)}ms:`, error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const requestStartTime = performance.now();
    const timestamp = new Date().toISOString();
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    
    console.log(`[AUTH_API] ${timestamp} - Making ${method} request to ${endpoint} (attempt ${attempt})`);

    // Get authentication token
    const authTokenStartTime = performance.now();
    const authToken = await this.getAuthToken();
    const authTokenTime = performance.now() - authTokenStartTime;
    
    if (authToken) {
      console.log(`[AUTH_API] ${timestamp} - Auth token obtained in ${authTokenTime.toFixed(2)}ms`);
    } else {
      console.warn(`[AUTH_API] ${timestamp} - No auth token available after ${authTokenTime.toFixed(2)}ms - request will be unauthenticated`);
    }

    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // ...options.headers,
    };
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else if (typeof options.headers === 'object' && options.headers !== null) {
      headers = {
        ...headers,
        ...(options.headers as Record<string, string>),
      };
    }
    // Add Authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`[AUTH_API] ${timestamp} - Sending HTTP request to ${url}`);
      const fetchStartTime = performance.now();
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      const fetchTime = performance.now() - fetchStartTime;

      clearTimeout(timeoutId);

      console.log(`[AUTH_API] ${timestamp} - HTTP response received in ${fetchTime.toFixed(2)}ms (status: ${response.status})`);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }

        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          console.error(`[AUTH_API] ${timestamp} - Authentication error (${response.status}): ${errorMessage}`);
          console.error(`[AUTH_API] ${timestamp} - Token was ${authToken ? 'present' : 'missing'} in request`);
          errorMessage = `Authentication failed. Please try logging out and back in.`;
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };

        const totalErrorTime = performance.now() - requestStartTime;
        console.error(`[AUTH_API] ${timestamp} - Request failed after ${totalErrorTime.toFixed(2)}ms:`, apiError);
        throw apiError;
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      let result: T;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = {} as T;
      }

      const totalTime = performance.now() - requestStartTime;
      console.log(`[AUTH_API] ${timestamp} - Request completed successfully in ${totalTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const errorTime = performance.now() - requestStartTime;
      
      // Retry logic for network errors (not for 4xx/5xx HTTP errors)
      if (attempt < this.retryAttempts && !(error as ApiError).status) {
        console.warn(`[AUTH_API] ${timestamp} - API request failed after ${errorTime.toFixed(2)}ms, retrying (${attempt}/${this.retryAttempts}):`, error);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.request<T>(endpoint, options, attempt + 1);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[AUTH_API] ${timestamp} - Request timeout after ${errorTime.toFixed(2)}ms`);
        throw new Error('Request timeout - please check your connection');
      }

      if ((error as ApiError).status) {
        console.error(`[AUTH_API] ${timestamp} - API error after ${errorTime.toFixed(2)}ms:`, error);
        throw error; // Re-throw API errors with status
      }

      console.error(`[AUTH_API] ${timestamp} - Network error after ${errorTime.toFixed(2)}ms:`, error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Course operations
  async createCourse(courseData: NewCourseRequest): Promise<Course> {
    const courseId = await this.post<number>('/roster/add', courseData);
    // Fetch the full course data after creation
    return this.getCourseById(courseId);
  }

  async getCourses(): Promise<Course[]> {
    return this.get<Course[]>('/roster');
  }

  async getCourseById(id: number): Promise<Course> {
    return this.get<Course>(`/roster/${id}`);
  }

  async updateCourse(id: number, courseData: UpdateCourseRequest): Promise<Course> {
    await this.put<void>(`/roster/update/${id}`, courseData);
    // Fetch the updated course data
    return this.getCourseById(id);
  }

  async deleteCourse(id: number): Promise<void> {
    return this.delete<void>(`/roster/delete/${id}`);
  }

  // Module operations (nested under courses)
  async createModule(moduleData: NewModuleRequest): Promise<{ id: number }> {
    // Backend returns just the ID, so we need to handle this differently
    const response = await this.post<number>(`/courses/${moduleData.courseId}/add`, moduleData);
    return { id: response };
  }

  async getModulesByCourse(courseId: number): Promise<Module[]> {
    return this.get<Module[]>(`/courses/${courseId}`);
  }

  async getModuleById(courseId: number, moduleId: number): Promise<Module> {
    return this.get<Module>(`/courses/${courseId}/module/${moduleId}`);
  }

  async updateModule(courseId: number, moduleId: number, moduleData: UpdateModuleRequest): Promise<void> {
    return this.put<void>(`/courses/${courseId}/update/${moduleId}`, moduleData);
  }

  async deleteModule(courseId: number, moduleId: number): Promise<void> {
    return this.delete<void>(`/courses/${courseId}/${moduleId}`);
  }

  // User operations
  async validateUsernames(usernames: string[]): Promise<Record<string, boolean>> {
    return this.post<Record<string, boolean>>('/users/validate', { usernames });
  }

  async searchUsersByUsernames(usernames: string[]): Promise<UserProfile[]> {
    return this.post<UserProfile[]>('/users/search', { usernames });
  }

  async getUserById(id: string): Promise<UserProfile> {
    return this.get<UserProfile>(`/users/${id}`);
  }

  async getUserByUsername(username: string): Promise<UserProfile> {
    return this.get<UserProfile>(`/users/username/${username}`);
  }

  async createTeacher(userData: { username: string; email: string }): Promise<number> {
    return this.post<number>('/users/addTeacher', userData);
  }
  async createStudent(userData: { username: string; email: string }): Promise<number> {
    return this.post<number>('/users/addStudent', userData);
  }
  async getAllUsers(): Promise<UserProfile[]> {
    return this.get<UserProfile[]>('/users');
  }

  // Course membership operations
  async addTeachersToCourse(courseId: number, usernames: string[]): Promise<void> {
    return this.post<void>(`/course-memberships/course/${courseId}/teachers`, { usernames });
  }

  async addStudentsToCourse(courseId: number, usernames: string[]): Promise<void> {
    return this.post<void>(`/course-memberships/course/${courseId}/students`, { usernames });
  }

  async getUserCourses(userId: string): Promise<UserCourse[]> {
    return this.get<UserCourse[]>(`/course-memberships/user/${userId}/courses`);
  }

  async getCourseUsers(courseId: number): Promise<CourseUser[]> {
    return this.get<CourseUser[]>(`/course-memberships/course/${courseId}/users`);
  }

  async getCourseTeachers(courseId: number): Promise<UserProfile[]> {
    return this.get<UserProfile[]>(`/course-memberships/course/${courseId}/getTeachers`);
  }

  async getCourseStudents(courseId: number): Promise<UserProfile[]> {
    return this.get<UserProfile[]>(`/course-memberships/course/${courseId}/getStudents`);
  }

  async removeUserFromCourse(courseId: number, userId: string): Promise<void> {
    return this.delete<void>(`/course-memberships/course/${courseId}/users/${userId}`);
  }

  // Content operations



  async createContent(contentData: NewContentRequest): Promise<ContentResponse> {

    const { moduleId, type, ...payload } = contentData;

    if (type === ContentType.Text) {
      // Use the module-specific addText endpoint
      const contentId = await this.post<number>(`/modules/${moduleId}/addText`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    } else if (type === ContentType.MultipleChoiceQuestion) {
      // Use the module-specific addQuestion endpoint  
      const contentId = await this.post<number>(`/modules/${moduleId}/addMultipleChoiceQuestion`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    } else if (type === ContentType.MatchingQuestion) {
      const contentId = await this.post<number>(`/modules/${moduleId}/addMatchingQuestion`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    }
    else if (type === ContentType.Video) {
      const contentId = await this.post<number>(`/modules/${moduleId}/addVideo`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    }
    else {
      throw new Error(`Unsupported content type: ${type}`);
    }
  }

  async getContentByModule(moduleId: number): Promise<ContentResponse[]> {
    return this.get<ContentResponse[]>(`/content/module/${moduleId}`);
  }

  async getContentById(id: number): Promise<ContentResponse> {
    return this.get<ContentResponse>(`/content/${id}`);
  }

  async updateContent(id: number, contentData: UpdateContentRequest): Promise<ContentResponse> {
    const { type, ...payload } = contentData;
    
    switch (type) {
      case ContentType.Text:
        return this.put<ContentResponse>(`/content/updateText/${id}`, payload as UpdateTextContentRequest);
      case ContentType.MultipleChoiceQuestion:
        return this.put<ContentResponse>(`/content/updateMultipleChoice/${id}`, payload as UpdateMultipleChoiceQuestionRequest);
      case ContentType.MatchingQuestion:
        return this.put<ContentResponse>(`/content/updateMatching/${id}`, payload as UpdateMatchingQuestionRequest);
      case ContentType.Video:
        return this.put<ContentResponse>(`/content/updateVideo/${id}`, payload as UpdateVideoContentRequest);
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }

  async deleteContent(id: number): Promise<void> {
    return this.delete<void>(`/content/${id}`);
  }

  async markContentComplete(id: number): Promise<ContentResponse> {
    return this.post<ContentResponse>(`/content/${id}/complete`);
  }

  async submitAnswer(id: number, answer: string): Promise<ContentResponse> {
    return this.patch<ContentResponse>(`/content/${id}/submit`, { answer });
  }

  // ================ Course Publishing ================

  async publishCourse(courseId: number): Promise<void> {
    return this.patch<void>(`/courses/${courseId}/publish`);
  }

  async isCoursePublished(courseId: number): Promise<boolean> {
    return this.get<boolean>(`/courses/${courseId}/isPublished`);
  }

  async getPublishedCourses(userId: string): Promise<UserCourse[]> {
    return this.get<UserCourse[]>(`/course-memberships/user/${userId}/published`);
  }

  async getUnpublishedCourses(userId: string): Promise<UserCourse[]> {
    return this.get<UserCourse[]>(`/course-memberships/user/${userId}/unpublished`);
  }
}

// Export singleton instance
export const backendApiClient = new BackendApiClient(); 