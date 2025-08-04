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
  UpdateContentRequest,
} from '@/types/backend-api';



export class BackendApiService {

  // ================ Course Operations ================

  async createCourse(courseData: NewCourseRequest): Promise<Course> {
    return backendApiClient.createCourse(courseData);
  }

  async getCourses(userId?: string): Promise<Course[]> {
    if (!userId) throw new Error('User ID is required to fetch user-specific courses');
    // getUserCourses returns UserCourse[], so map to Course[] if needed
    const userCourses = await backendApiClient.getUserCourses(userId);
    // If UserCourse has a 'course' property, map accordingly; otherwise, return as is
    if (userCourses.length && (userCourses[0] as any).course) {
      return userCourses.map((uc: any) => uc.course);
    }
    return userCourses as Course[];
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

  async getModuleCountByCourseId(courseId: number): Promise<number> {
    try {
      const modules = await this.getModulesByCourseId(courseId);
      return modules.length;
    } catch (error) {
      console.error(`Error fetching module count for course ${courseId}:`, error);
      return 0;
    }
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

  async updateContent(id: number, contentData: UpdateContentRequest): Promise<ContentResponse> {
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

  async getAllUsers(): Promise<UserProfile[]> {
    return backendApiClient.getAllUsers();
  }

  async getAllTeachers(): Promise<UserProfile[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => user.userType === 'Teacher');
  }

  async getAllStudents(): Promise<UserProfile[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => user.userType === 'Student');
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

  async getCourseTeachers(courseId: number): Promise<UserProfile[]> {
    return backendApiClient.getCourseTeachers(courseId);
  }

  async getCourseStudents(courseId: number): Promise<UserProfile[]> {
    return backendApiClient.getCourseStudents(courseId);
  }

  async removeUserFromCourse(courseId: number, userId: string): Promise<void> {
    return backendApiClient.removeUserFromCourse(courseId, userId);
  }

  // ================ Course Publishing ================

  async publishCourse(courseId: number): Promise<void> {
    return backendApiClient.publishCourse(courseId);
  }

  async isCoursePublished(courseId: number): Promise<boolean> {
    return backendApiClient.isCoursePublished(courseId);
  }

  async getPublishedCourses(userId?: string): Promise<Course[]> {
    if (!userId) throw new Error('User ID is required to fetch published courses');
    const userCourses = await backendApiClient.getPublishedCourses(userId);
    // If UserCourse has a 'course' property, map accordingly; otherwise, return as is
    if (userCourses.length && (userCourses[0] as any).course) {
      return userCourses.map((uc: any) => uc.course);
    }
    return userCourses as Course[];
  }

  async getUnpublishedCourses(userId?: string): Promise<Course[]> {
    if (!userId) throw new Error('User ID is required to fetch unpublished courses');
    const userCourses = await backendApiClient.getUnpublishedCourses(userId);
    // If UserCourse has a 'course' property, map accordingly; otherwise, return as is
    if (userCourses.length && (userCourses[0] as any).course) {
      return userCourses.map((uc: any) => uc.course);
    }
    return userCourses as Course[];
  }
}

// Create and export singleton instance
export const apiService = new BackendApiService();