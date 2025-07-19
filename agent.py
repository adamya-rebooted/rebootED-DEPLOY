import dspy
import os
from dotenv import load_dotenv

# Load env vars from .env
load_dotenv()

# Configure DSPy with the language model
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
