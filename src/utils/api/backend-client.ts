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
    try {
      // Always try to get a fresh session first
      let { data: { session }, error: sessionError } = await this.supabase.auth.getSession();

      // If we have a session error or no session, try to refresh
      if (sessionError || !session) {
        console.log('No valid session found, attempting refresh...');
        const { data, error } = await this.supabase.auth.refreshSession();
        if (error) {
          console.warn('Failed to refresh session:', error);
          return null;
        }
        session = data.session;
      }

      // Double check we have a valid token
      if (!session?.access_token) {
        console.warn('No access token available after session check');
        return null;
      }

      return session.access_token;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get authentication token
    const authToken = await this.getAuthToken();

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

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
          console.warn('Authentication error, token may be expired');
          errorMessage = `Authentication failed. Please try logging out and back in.`;
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };

        throw apiError;
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      // Retry logic for network errors (not for 4xx/5xx HTTP errors)
      if (attempt < this.retryAttempts && !(error as ApiError).status) {
        console.warn(`API request failed, retrying (${attempt}/${this.retryAttempts}):`, error);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.request<T>(endpoint, options, attempt + 1);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }

      if ((error as ApiError).status) {
        throw error; // Re-throw API errors with status
      }

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
    return this.put<ContentResponse>(`/content/${id}`, contentData);
  }

  async deleteContent(id: number): Promise<void> {
    return this.delete<void>(`/content/${id}`);
  }

  async markContentComplete(id: number): Promise<ContentResponse> {
    return this.post<ContentResponse>(`/content/${id}/complete`);
  }

  async submitAnswer(id: number, answer: string): Promise<ContentResponse> {
    return this.post<ContentResponse>(`/content/${id}/answer`, { answer });
  }
}

// Export singleton instance
export const backendApiClient = new BackendApiClient(); 