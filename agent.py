import dspy
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Union
from datetime import datetime

# Load env vars from .env
load_dotenv('.env.local')
# #### TEMP OLD PYDANTIC MODELS
# # Module Models
# class Module(BaseModel):
#     """Module structure for course organization"""
#     module_name: str
#     skills: List[str]

# class ModuleGroupingResult(BaseModel):
#     """Result of grouping skills into modules"""
#     modules: List[Module]

# # Content Models
# class _BaseContentOut(BaseModel):
#     """Base content model with database metadata"""
#     id: Optional[int] = Field(default=1)
#     title: str
#     is_complete: Optional[bool] = Field(default=True, alias="isComplete")
#     module_id: Optional[int] = Field(default=1, alias="moduleId")
#     created_at: Optional[datetime] = Field(default_factory=datetime.now, alias="createdAt")
#     updated_at: Optional[datetime] = Field(default_factory=datetime.now, alias="updatedAt")

# class TextContentOut(_BaseContentOut):
#     """Structured output for a 'Text' content block."""
#     type: Literal["Text"] = "Text"
#     body: str

# class QuestionContentOut(_BaseContentOut):
#     """Structured output for a 'Question' content block."""
#     type: Literal["Question"] = "Question"
#     question_text: str = Field(alias="questionText")
#     options: List[str]
#     correct_answer: str = Field(alias="correctAnswer")
#     user_answer: Optional[str] = Field(default=None, alias="userAnswer")

# class ModuleContentBundle(BaseModel):
#     """One module plus every content block generated for its skills."""
#     module_name: str
#     content_blocks: List[Union[TextContentOut, QuestionContentOut]]

# class CourseContentResult(BaseModel):
#     """Full course payload: list of ModuleContentBundle objects."""
#     modules: List[ModuleContentBundle]
# ####TEMP OLD PYDANTIC MODELS
# Configure DSPy with the language model
#lm = dspy.LM('anthropic/claude-3-haiku-20240307', api_key=os.getenv('ANTHROPIC_API_KEY'))
lm = dspy.LM('gemini/gemini-1.5-flash', api_key=os.getenv('GEMINI_API_KEY'))
dspy.configure(lm=lm)

# Prompt to Course Agent Signature
class PromptToCourse(dspy.Signature):
    """Generates a course title and description from a user's course idea prompt."""
    input_prompt = dspy.InputField(desc="A user-written prompt describing the course they want to create.")
    course_title = dspy.OutputField(desc="A concise, engaging title for the course.")
    course_description = dspy.OutputField(desc="A compelling and informative sentence describing what the course covers.")

# Prompt to Course Agent Module
class PromptToCourseModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generator = dspy.Predict(PromptToCourse)  # uses default model unless you configure a custom one

    def forward(self, input_prompt: str):
        return self.generator(input_prompt=input_prompt)

# Prompt to Module Agent Signature
class PromptToModule(dspy.Signature):
    """Generates a course title and description from a user's course idea prompt."""
    input_prompt = dspy.InputField(desc="A user-written prompt describing the module they want to create.")
    ###TODO: add course description as an input field for context
    #course_description = dspy.InputField(desc="A description of the course we are creating the module inside")
    module_title = dspy.OutputField(desc="A concise, engaging title for the module.")
    module_description = dspy.OutputField(desc="A concise, compelling and informative sentence describing what the module covers.")

# Prompt to Module Agent Module
class PromptToModuleModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generator = dspy.Predict(PromptToModule)

    def forward(self, input_prompt: str):
        return self.generator(input_prompt=input_prompt)

# Prompt to Text Content Agent Signature
class PromptToTextContent(dspy.Signature):
    """Takes in a prompt and generates a 'text content' title and body."""
    input_prompt = dspy.InputField(desc="A prompt describing the text content, purpose, and context")
    text_title = dspy.OutputField(desc="A concise, engaging title for the text content.")
    text_body = dspy.OutputField(desc="A compelling and informative paragraph designed to fulfill the purpose.")

# Prompt to Text Content Agent Module
class PromptToTextContentModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generator = dspy.Predict(PromptToTextContent)

    def forward(self, input_prompt: str):
        return self.generator(input_prompt=input_prompt)

# Pydantic model for multiple choice question structure
class MultipleChoiceQuestion(BaseModel):
    """Structured output for a multiple choice question."""
    question_title: str = Field(description="A concise, engaging title for the question")
    question_body: Optional[str] = Field(description="The main question text or body (can be null if title is sufficient)")
    question_options: List[str] = Field(description="A list of multiple choice options as strings", min_items=2, max_items=6)
    correct_answer: str = Field(description="The correct answer from the options provided")

# Prompt to Multiple Choice Question Content Agent Signature
class PromptToMultipleChoiceQuestionContent(dspy.Signature):
    """Takes in a prompt and generates a multiple choice question with structured output."""
    input_prompt: str = dspy.InputField(desc="A prompt describing the question content, topic, and context")
    question: MultipleChoiceQuestion = dspy.OutputField(desc="A structured multiple choice question object")


# Prompt to Multiple Choice Question Content Agent Module
class PromptToMultipleChoiceQuestionContentModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generator = dspy.Predict(PromptToMultipleChoiceQuestionContent)

    def forward(self, input_prompt: str):
        result = self.generator(input_prompt=input_prompt)
        return result.question