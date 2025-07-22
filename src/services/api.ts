// Backend API Service - Clean Spring Boot Integration
// Replaces Supabase with backend API calls
import { ContentType } from '@/utils/api/backend-client';
import { backendApiClient } from '@/utils/api/backend-client';
import {
  Course,
  Module,
  Content,
  ContentResponse,
  UserProfile,
  UserCourse,
  CourseUser,
  NewCourseRequest,
  NewModuleRequest,
  NewContentRequest,
} from '@/types/backend-api';



export class BackendApiService {

  // ================ Course Operations ================

  async createCourse(courseData: NewCourseRequest): Promise<Course> {
    return backendApiClient.createCourse(courseData);
  }

  async getCourses(): Promise<Course[]> {
    return backendApiClient.getCourses();
  }

  async getCourseById(id: number): Promise<Course> {
    return backendApiClient.getCourseById(id);
  }

  async updateCourse(id: number, courseData: { title: string; body: string }): Promise<Course> {
    return backendApiClient.updateCourse(id, courseData);
  }

  async deleteCourse(id: number): Promise<void> {
    return backendApiClient.deleteCourse(id);
  }

  // ================ Module Operations ================

  async createModule(moduleData: NewModuleRequest): Promise<Module> {
    const response = await backendApiClient.createModule(moduleData);
    // Since backend only returns ID, we need to fetch the full module data
    return this.getModuleById(moduleData.courseId, response.id);
  }

  async getModulesByCourseId(courseId: number): Promise<Module[]> {
    return backendApiClient.getModulesByCourse(courseId);
  }

  async getModuleById(courseId: number, moduleId: number): Promise<Module> {
    return backendApiClient.getModuleById(courseId, moduleId);
  }

  async updateModule(courseId: number, moduleId: number, moduleData: { title: string; body: string; courseId: number }): Promise<Module> {
    await backendApiClient.updateModule(courseId, moduleId, moduleData);
    // Since backend doesn't return the updated module, fetch it
    return this.getModuleById(courseId, moduleId);
  }

  async deleteModule(courseId: number, moduleId: number): Promise<void> {
    return backendApiClient.deleteModule(courseId, moduleId);
  }

  // ================ Content Operations ================

  async createContent(contentData: NewContentRequest): Promise<ContentResponse> {
    if (contentData.type === ContentType.MultipleChoiceQuestion) {
      return backendApiClient.createContent(contentData);
    } else {
      return backendApiClient.createContent(contentData);
    }
  }

  async getContentByModuleId(moduleId: number): Promise<ContentResponse[]> {
    return backendApiClient.getContentByModule(moduleId);
  }

  async getContentById(id: number): Promise<ContentResponse> {
    return backendApiClient.getContentById(id);
  }

  async updateContent(id: number, contentData: { title: string; body: string; type: ContentType; moduleId: number }): Promise<ContentResponse> {
    return backendApiClient.updateContent(id, contentData);
  }

  async deleteContent(id: number): Promise<void> {
    return backendApiClient.deleteContent(id);
  }

  async markContentComplete(id: number): Promise<ContentResponse> {
    return backendApiClient.markContentComplete(id);
  }

  async submitAnswer(id: number, answer: string): Promise<ContentResponse> {
    return backendApiClient.submitAnswer(id, answer);
  }

  // ================ User Operations ================

  async validateUsernames(usernames: string[]): Promise<Record<string, boolean>> {
    return backendApiClient.validateUsernames(usernames);
  }

  async searchUsersByUsernames(usernames: string[]): Promise<UserProfile[]> {
    return backendApiClient.searchUsersByUsernames(usernames);
  }

  async getUserById(id: string): Promise<UserProfile> {
    return backendApiClient.getUserById(id);
  }

  async getUserByUsername(username: string): Promise<UserProfile> {
    return backendApiClient.getUserByUsername(username);
  }

  // ================ Course Membership Operations ================

  async addTeachersToCourse(courseId: number, usernames: string[]): Promise<void> {
    return backendApiClient.addTeachersToCourse(courseId, usernames);
  }

  async addStudentsToCourse(courseId: number, usernames: string[]): Promise<void> {
    return backendApiClient.addStudentsToCourse(courseId, usernames);
  }

  async getUserCourses(userId: string): Promise<UserCourse[]> {
    return backendApiClient.getUserCourses(userId);
  }

  async getCourseUsers(courseId: number): Promise<CourseUser[]> {
    return backendApiClient.getCourseUsers(courseId);
  }

  async removeUserFromCourse(courseId: number, userId: string): Promise<void> {
    return backendApiClient.removeUserFromCourse(courseId, userId);
  }
}

// Create and export singleton instance
export const apiService = new BackendApiService();