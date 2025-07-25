import dspy
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Union
from datetime import datetime

# Load env vars from .env
load_dotenv('.env.local')
# #### TEMP OLD CODE
#STEP 1: analyze knowledge gap
# Define the structured output model
class KnowledgeSkillsList(BaseModel):
    """Structured output for knowledge and skills list"""
    knowledge_skills_list: List[str]
# Define the signature
class KnowledgeSkillsListSignature(dspy.Signature):
    """Identify the all the knowledge and skills needed to efficiently teach this topic to someone with no prior knowledge."""
    course_prompt = dspy.InputField(desc="Prompt describing the course to create")
    analysis: KnowledgeSkillsList = dspy.OutputField(desc="Structured analysis of knowledge and skills needed to bridge the gap. Return a list where each item is a specific knowledge area or skill that the student needs to learn.")

# Define the module
class KnowledgeSkillsListModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought(KnowledgeSkillsListSignature)

    def forward(self, course_prompt):
        return self.predictor(
            course_prompt=course_prompt
        )

#STEP 2: group knowledge gap items into modules
# Define the module output structure
class Module(BaseModel):
    module_name: str
    skills: List[str]

class ModuleGroupingResult(BaseModel):
    modules: List[Module]

# Define the signature
class ModuleGroupingSignature(dspy.Signature):
    """Group the list of knowledge and skills into coherent modules for the course."""
    knowledge_skills_list = dspy.InputField(desc="List of knowledge and skills needed to bridge the gap")
    grouping: ModuleGroupingResult = dspy.OutputField(desc="Structured grouping of knowledge and skills into modules")

# Define the module
class ModuleGrouper(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought(ModuleGroupingSignature)

    def forward(self, knowledge_skills_list):
        return self.predictor(knowledge_skills_list=knowledge_skills_list)
# ####TEMP OLD CODE






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

# Prompt to Multiple Choice Question Content Pydantic model
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