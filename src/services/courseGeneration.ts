// Course Generation API Service
export interface PromptToCourseRequest {
  input_prompt: string;
}

export interface PromptToCourseResponse {
  course_title: string;
  course_description: string;
}

export interface PromptToTextContentRequest {
  input_prompt: string;
}

export interface PromptToTextContentResponse {
  text_title: string;
  text_body: string;
}

export interface PromptToModuleRequest {
  input_prompt: string;
}

export interface PromptToModuleResponse {
  module_title: string;
  module_description: string;
}

export interface PromptToMultipleChoiceQuestionRequest {
  input_prompt: string;
}

export interface PromptToMultipleChoiceQuestionResponse {
  question_title: string;
  question_body: string | null;
  question_options: string[];
  correct_answer: string;
}

export interface PromptToCourseModulesRequest {
  input_prompt: string;
}

export interface CourseModuleResponse {
  module_name: string;
  skills: string[];
}

export interface PromptToCourseModulesResponse {
  modules: CourseModuleResponse[];
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

  async promptToTextContent(request: PromptToTextContentRequest): Promise<PromptToTextContentResponse> {
    const response = await fetch(`${this.baseUrl}/prompt-to-text-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to generate text content from prompt');
    }

    return response.json();
  }

  async promptToModule(request: PromptToModuleRequest): Promise<PromptToModuleResponse> {
    const response = await fetch(`${this.baseUrl}/prompt-to-module`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to generate module from prompt');
    }

    return response.json();
  }

  async promptToMultipleChoiceQuestion(request: PromptToMultipleChoiceQuestionRequest): Promise<PromptToMultipleChoiceQuestionResponse> {
    const response = await fetch(`${this.baseUrl}/prompt-to-multiple-choice-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to generate multiple choice question from prompt');
    }

    return response.json();
  }

  async promptToCourseModules(request: PromptToCourseModulesRequest): Promise<PromptToCourseModulesResponse> {
    const response = await fetch(`${this.baseUrl}/prompt-to-course-modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to generate course modules from prompt');
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