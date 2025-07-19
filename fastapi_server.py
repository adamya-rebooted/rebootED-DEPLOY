from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
import time
from dotenv import load_dotenv

# Import only the prompt-to-course agent
from agent import PromptToCourseModule

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

# Request/Response models for the prompt-to-course endpoint
class PromptToCourseRequest(BaseModel):
    input_prompt: str

class PromptToCourseResponse(BaseModel):
    course_title: str
    course_description: str

# Initialize the prompt-to-course agent
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Course generation API is running"}

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