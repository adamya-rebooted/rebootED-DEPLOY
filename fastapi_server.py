from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import os
import asyncio
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Import your existing agent classes
from agent import (
    CoursePrompt, 
    KnowledgeGapAnalyzer, 
    ModuleGrouper, 
    CourseContentGenerator,
    TextContentOut,
    QuestionContentOut,
    PromptToCourseModule
)

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Course Generation API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Thread pool for running DSPy calls asynchronously
executor = ThreadPoolExecutor(max_workers=2)

# Request/Response models that match your frontend
class GenerateCourseRequest(BaseModel):
    course_title: str
    course_topics: str
    course_description: str
    starting_point_description: str
    finish_line_description: str

class ContentBlockResponse(BaseModel):
    id: Optional[int] = None
    title: str
    body: str = ""
    type: str  # "Text" or "Question"
    moduleId: Optional[int] = None
    isComplete: bool = False
    # Question-specific fields
    options: Optional[List[str]] = None
    correctAnswer: Optional[str] = None
    questionText: Optional[str] = None

class ModuleResponse(BaseModel):
    id: Optional[int] = None
    name: str
    description: str = ""
    courseId: Optional[int] = None
    contentBlocks: List[ContentBlockResponse]

class GeneratedCourseResponse(BaseModel):
    course_title: str
    course_description: str
    modules: List[ModuleResponse]

# Request/Response models for the new prompt-to-course endpoint
class PromptToCourseRequest(BaseModel):
    input_prompt: str

class PromptToCourseResponse(BaseModel):
    course_title: str
    course_description: str

# Initialize your agent components
analyzer = KnowledgeGapAnalyzer()
grouper = ModuleGrouper()
content_generator = CourseContentGenerator()
prompt_to_course_agent = PromptToCourseModule()

# Add middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"📥 {request.method} {request.url} - Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.2f}s")
    
    return response

def run_course_generation(request: GenerateCourseRequest):
    """
    Run the course generation pipeline synchronously in a thread.
    This prevents blocking the main FastAPI thread.
    """
    try:
        logger.info(f"🚀 Starting course generation for: {request.course_title}")
        
        # Create the course prompt
        course_prompt = CoursePrompt(
            course_title=request.course_title,
            course_topics=request.course_topics,
            course_description=request.course_description,
            starting_point_description=request.starting_point_description,
            finish_line_description=request.finish_line_description
        )
        
        # Step 1: Analyze knowledge gap
        logger.info("🔍 Step 1: Analyzing knowledge gap...")
        gap_result = analyzer(
            starting_point_description=course_prompt.starting_point_description,
            finish_line_description=course_prompt.finish_line_description
        )
        logger.info(f"✅ Found {len(gap_result.analysis.knowledge_skills_list)} skills")
        
        # Step 2: Group skills into modules
        logger.info("📚 Step 2: Grouping skills into modules...")
        grouping_result = grouper(knowledge_skills_list=gap_result.analysis.knowledge_skills_list)
        logger.info(f"✅ Created {len(grouping_result.grouping.modules)} modules")
        
        # Step 3: Generate content for each module
        logger.info("✍️ Step 3: Generating content for modules...")
        content_result = content_generator(modules=grouping_result.grouping.modules)
        logger.info(f"✅ Generated content for {len(content_result.modules)} modules")
        
        return gap_result, grouping_result, content_result
        
    except Exception as e:
        logger.error(f"❌ Course generation failed: {str(e)}")
        raise e

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Course generation API is running"}

@app.post("/generate-course", response_model=GeneratedCourseResponse)
async def generate_course(request: GenerateCourseRequest):
    """
    Generate a complete course with modules and content blocks based on the provided prompt.
    """
    try:
        logger.info(f"🎯 Course generation request received for: {request.course_title}")
        
        # Run the course generation in a thread to avoid blocking
        loop = asyncio.get_event_loop()
        gap_result, grouping_result, content_result = await loop.run_in_executor(
            executor, run_course_generation, request
        )
        
        # Transform the results to match frontend expectations
        modules_response = []
        for i, module_bundle in enumerate(content_result.modules):
            content_blocks_response = []
            
            for j, content_block in enumerate(module_bundle.content_blocks):
                if content_block.type == "Text":
                    content_block_response = ContentBlockResponse(
                        id=j + 1,
                        title=content_block.title,
                        body=content_block.body,
                        type="Text",
                        moduleId=i + 1,
                        isComplete=False
                    )
                elif content_block.type == "Question":
                    content_block_response = ContentBlockResponse(
                        id=j + 1,
                        title=content_block.title,
                        body=content_block.question_text,
                        type="Question",
                        moduleId=i + 1,
                        isComplete=False,
                        options=content_block.options,
                        correctAnswer=content_block.correct_answer,
                        questionText=content_block.question_text
                    )
                else:
                    continue
                
                content_blocks_response.append(content_block_response)
            
            module_response = ModuleResponse(
                id=i + 1,
                name=module_bundle.module_name,
                description=f"Module covering: {', '.join(grouping_result.grouping.modules[i].skills[:3])}{'...' if len(grouping_result.grouping.modules[i].skills) > 3 else ''}",
                courseId=1,  # Will be set by frontend when saving
                contentBlocks=content_blocks_response
            )
            modules_response.append(module_response)
        
        logger.info(f"🎉 Course generation completed successfully!")
        return GeneratedCourseResponse(
            course_title=request.course_title,
            course_description=request.course_description,
            modules=modules_response
        )
        
    except Exception as e:
        logger.error(f"❌ Course generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

@app.post("/generate-course-simple")
async def generate_course_simple(request: GenerateCourseRequest):
    """
    Simplified endpoint that returns raw generated data for debugging.
    """
    try:
        logger.info(f"🎯 Simple course generation request for: {request.course_title}")
        
        # Run the course generation in a thread to avoid blocking
        loop = asyncio.get_event_loop()
        gap_result, grouping_result, content_result = await loop.run_in_executor(
            executor, run_course_generation, request
        )
        
        return {
            "skills_identified": gap_result.analysis.knowledge_skills_list,
            "modules_created": len(content_result.modules),
            "total_content_blocks": sum(len(m.content_blocks) for m in content_result.modules),
            "modules": [
                {
                    "name": module.module_name,
                    "content_count": len(module.content_blocks),
                    "content_types": [cb.type for cb in module.content_blocks]
                }
                for module in content_result.modules
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Simple course generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

@app.post("/prompt-to-course", response_model=PromptToCourseResponse)
async def prompt_to_course(request: PromptToCourseRequest):
    """
    Generate a course title and description from a user's course idea prompt.
    """
    try:
        logger.info(f"🎯 Prompt-to-course request received for prompt: {request.input_prompt[:50]}...")
        
        # Call the prompt-to-course agent
        result = prompt_to_course_agent(input_prompt=request.input_prompt)
        
        # Transform result to response model
        response = PromptToCourseResponse(
            course_title=result.course_title,
            course_description=result.course_description
        )
        
        logger.info(f"✅ Prompt-to-course completed successfully: {response.course_title}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Prompt-to-course failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prompt-to-course failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 