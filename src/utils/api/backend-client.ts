// Backend API Client for Spring Boot Integration
// Clean implementation with comprehensive error handling

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

  constructor() {
    const config = getBackendConfig();
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
    
    if (type === 'Text') {
      // Use the module-specific addText endpoint
      const contentId = await this.post<number>(`/modules/${moduleId}/addText`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    } else if (type === 'Question') {
      // Use the module-specific addQuestion endpoint  
      const contentId = await this.post<number>(`/modules/${moduleId}/addQuestion`, {
        type,
        ...payload,
        moduleId
      });
      // Since we only get back the ID, fetch the full content data
      return this.getContentById(contentId);
    } else {
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