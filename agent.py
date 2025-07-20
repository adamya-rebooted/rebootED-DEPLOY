import dspy
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Union
from datetime import datetime

# Load env vars from .env
load_dotenv()
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
#lm = dspy.LM('anthropic/claude-3-opus-20240229', api_key=os.getenv('ANTHROPIC_API_KEY'))
lm = dspy.LM('gemini/gemini-1.5-flash', api_key=os.getenv('GEMINI_API_KEY'))
dspy.configure(lm=lm)

# Prompt to Course Agent Signature
class PromptToCourse(dspy.Signature):
    """Generates a course title and description from a user's course idea prompt."""
    input_prompt = dspy.InputField(desc="A user-written prompt describing the course they want to create.")
    course_title = dspy.OutputField(desc="A concise, engaging title for the course.")
    course_description = dspy.OutputField(desc="A compelling and informative paragraph describing what the course covers.")

# Prompt to Course Agent Module
class PromptToCourseModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generator = dspy.Predict(PromptToCourse)  # uses default model unless you configure a custom one

    def forward(self, input_prompt: str):
        return self.generator(input_prompt=input_prompt)
