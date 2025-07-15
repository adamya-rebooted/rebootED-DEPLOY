'use client';

import React, { useState } from 'react';
import {
  courseGenerationService,
  GenerateCourseRequest,
  GeneratedCourse,
  GeneratedModule,
  GeneratedContentBlock
} from '@/services/courseGeneration';
import { Button } from '@/components/ui/button';

export default function AICoursePage() {
  // Form state
  const [courseTitle, setCourseTitle] = useState('Introduction to Python Programming');
  const [courseDescription, setCourseDescription] = useState('A comprehensive beginner-friendly course that teaches Python programming fundamentals through hands-on exercises and practical projects.');
  const [courseTopics, setCourseTopics] = useState('Variables and data types, Control structures (if/else, loops), Functions and modules, File handling, Error handling, Object-oriented programming basics, Working with libraries');
  const [startingPoint, setStartingPoint] = useState('Basic computer literacy and familiarity with using a computer. No prior programming experience required.');
  const [finishLine, setFinishLine] = useState('Students will be able to write Python programs, solve basic programming problems, work with files and data, and understand fundamental programming concepts.');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);

  const generatedCourses = {
    course_title: "Web Development for Beginners",
    course_description: "A comprehensive introduction to web development. Learn HTML, CSS, and JavaScript through hands-on projects and build real-world websites from scratch.",
    modules: [
      {
        name: "Module 1: Getting Started with HTML",
        description: "Understand the basic structure of a webpage and learn how to use common HTML tags to build content.",
        contentBlocks: [
          {
            type: "Text",
            title: "Introduction to HTML",
            body: "HTML stands for HyperText Markup Language. It is the standard language for creating webpages and web applications."
          },
          {
            type: "Question",
            title: "Basic HTML Quiz",
            questionText: "What does HTML stand for?",
            options: ["HyperText Markup Language", "HighText Markdown Language", "HyperText Machine Language"],
            correctAnswer: "HyperText Markup Language"
          }
        ]
      },
      {
        name: "Module 2: Styling with CSS",
        description: "Learn how to style and layout your web pages using CSS to create visually appealing designs.",
        contentBlocks: [
          {
            type: "Text",
            title: "CSS Basics",
            body: "CSS stands for Cascading Style Sheets. It describes how HTML elements are to be displayed on screen."
          },
          {
            type: "Question",
            title: "CSS Syntax Quiz",
            questionText: "Which property is used to change the text color in CSS?",
            options: ["font-style", "text-color", "color", "background-color"],
            correctAnswer: "color"
          }
        ]
      }
    ]
  };

  //   const [generatedCourse, setGeneratedCourse] = useState(generatedCoursea); // mock course for styleing is the object above


  const handleGenerateCourse = async () => {
    if (!courseTitle.trim() || !courseDescription.trim() || !courseTopics.trim() || !startingPoint.trim() || !finishLine.trim()) {
      setError('Please fill in all fields for AI generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCourse(null);

    try {
      console.log('🚀 Generate button clicked!');

      // Test server health first
      console.log('🔍 Checking FastAPI server health...');
      const healthResponse = await fetch('http://localhost:8001/health');

      if (!healthResponse.ok) {
        throw new Error(`FastAPI server not responding: ${healthResponse.status}`);
      }

      const healthData = await healthResponse.json();
      console.log('✅ FastAPI server health check passed:', healthData);

      const request: GenerateCourseRequest = {
        course_title: courseTitle.trim(),
        course_topics: courseTopics.trim(),
        course_description: courseDescription.trim(),
        starting_point_description: startingPoint.trim(),
        finish_line_description: finishLine.trim(),
      };

      console.log('📤 Sending course generation request:', request);
      const generatedCourse = await courseGenerationService.generateCourse(request);
      console.log('📥 Received generated course:', generatedCourse);

      setGeneratedCourse(generatedCourse);
      console.log('✅ Course generation completed successfully!');

    } catch (error) {
      console.error('❌ Course generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#171717', marginBottom: '30px', textAlign: 'center' }}>
        AI Course Generation
      </h1>

      {/* Course Generation Form */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#171717', marginBottom: '20px' }}>
          Generate Course with AI
        </h2>

        {/* Course Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#171717' }}>
            Course Title:
          </label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#171717'
            }}
            placeholder="e.g., Introduction to Python Programming"
          />
        </div>

        {/* Course Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#171717' }}>
            Course Description:
          </label>
          <textarea
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            required
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: '#ffffff',
              color: '#171717'
            }}
            placeholder="Brief description of what this course covers..."
          />
        </div>

        {/* Course Topics */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#171717' }}>
            Course Topics:
          </label>
          <textarea
            value={courseTopics}
            onChange={(e) => setCourseTopics(e.target.value)}
            required
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: '#ffffff',
              color: '#171717'
            }}
            placeholder="List the main topics this course should cover..."
          />
        </div>

        {/* Starting Point */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#171717' }}>
            Starting Point (Prerequisites):
          </label>
          <textarea
            value={startingPoint}
            onChange={(e) => setStartingPoint(e.target.value)}
            required
            rows={2}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: '#ffffff',
              color: '#171717'
            }}
            placeholder="What should students know before starting this course?"
          />
        </div>

        {/* Finish Line */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#171717' }}>
            Finish Line (Learning Outcomes):
          </label>
          <textarea
            value={finishLine}
            onChange={(e) => setFinishLine(e.target.value)}
            required
            rows={2}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: '#ffffff',
              color: '#171717'
            }}
            placeholder="What will students be able to do after completing this course?"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateCourse}
          disabled={isGenerating}
          style={{
            backgroundColor: isGenerating ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isGenerating ? 'Generating Course...' : 'Generate Course with AI'}
        </button>

        {/* Error Display */}
        {error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24'
          }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Generated Course Display */}
      {generatedCourse && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h2 style={{ color: '#155724', marginBottom: '20px' }}>
            ✅ Generated Course: {generatedCourse.course_title}
          </h2>

          <p style={{ color: '#155724', marginBottom: '20px' }}>
            {generatedCourse.course_description}
          </p>

          <div style={{ color: '#155724' }}>
            <strong>Modules Generated: {generatedCourse.modules.length}</strong>
          </div>

          {generatedCourse.modules.map((module, index) => (
            <div key={index} style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#ffffff',
              border: '1px solid #c3e6cb',
              borderRadius: '4px'
            }}>
              <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                📚 {module.title}
              </h3>
              <p style={{ color: '#155724', margin: '0 0 10px 0', fontSize: '14px' }}>
                {module.body}
              </p>
              <div style={{ color: '#155724', fontSize: '12px' }}>
                Content Blocks: {module.contentBlocks.length}
              </div>

              {/* Show content blocks */}
              {module.contentBlocks.map((block, blockIndex) => (
                <div key={blockIndex} style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ marginRight: '10px' }}>
                      {block.type === 'Text' ? '📝' : '❓'}
                    </span>
                    <strong style={{ color: '#495057' }}>{block.title}</strong>
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '14px' }}>
                    {block.type === 'Text' ? 'Text Content' : 'Question'}
                  </div>

                  {/* Show actual content*/}
                  {block.type === 'Text' && (
                    <div style={{ marginTop: '8px', color: "#212529" }}>
                      {block.body}
                    </div>
                  )}
                  {block.type === 'Question' && (
                    <div>
                      <div><strong>Question: </strong>{block.questionText}</div>
                      {/* <ul>
                        {block.options?.map((option, i) => (
                          <li key={i}>{option}</li>
                        ))}
                      </ul> */}
                      <form>
                        {block.options?.map((option, i) => (
                          <label key={i} style={{ display: 'flex', marginBottom: '6px', gap: '6px' }}>
                            <input
                              type="radio"
                              name={`question-${block.questionText}`} // use a unique name
                              value={option}
                              style={{
                                margin: 0, // Reset browser default spacing
                              }}
                            // Optional: check if the option is the correct answer (readonly display)
                            // defaultChecked={option === block.correctAnswer}
                            // disabled // remove this line if you want the user to interact
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                        <Button>Submit</Button>
                      </form>
                      <div style={{ display: 'none' }}><strong>Correct Answer: </strong>{block.correctAnswer}</div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 