// Course Generation API Service
export interface PromptToCourseRequest {
  input_prompt: string;
}

export interface PromptToCourseResponse {
  course_title: string;
  course_description: string;
}

class CourseGenerationService {
  private baseUrl = 'http://localhost:8001';

  async promptToCourse(request: PromptToCourseRequest): Promise<PromptToCourseResponse> {
    const response = await fetch(`${this.baseUrl}/prompt-to-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to generate course from prompt');
    }

    return response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const courseGenerationService = new CourseGenerationService(); 