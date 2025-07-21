'use client';

import { useState } from 'react';
import { backendApiClient } from '@/utils/api/backend-client';

export default function AuthTestComponent() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAuth = async () => {
    setIsLoading(true);
    try {
      // Test with a simple backend endpoint that should work
      const response = await fetch('http://localhost:8080/api/auth-test/generate-token?email=test@example.com&role=teacher', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Backend connection successful! Token: ${data.token?.substring(0, 50)}...`);
      } else {
        setTestResult(`❌ Backend connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiWithAuth = async () => {
    setIsLoading(true);
    try {
      // Test an API call that requires authentication
      const courses = await backendApiClient.getCourses();
      setTestResult(`✅ Authenticated API call successful! Found ${courses.length} courses`);
    } catch (error) {
      setTestResult(`❌ Authenticated API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      margin: '20px',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🧪 Phase 1 Authentication Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testAuth} 
          disabled={isLoading}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        <button 
          onClick={testApiWithAuth} 
          disabled={isLoading}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Test API with Auth Headers'}
        </button>
      </div>
      
      {testResult && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '10px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#e2e3e5', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <strong>Phase 1 Status:</strong> Backend API client now includes JWT authentication headers from Supabase sessions.
        <br />
        <strong>Next:</strong> Test both buttons to verify the integration is working correctly.
      </div>
    </div>
  );
} 