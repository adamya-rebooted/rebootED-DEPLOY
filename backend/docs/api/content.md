# Content API

## Overview
The Content API provides endpoints for managing content blocks (text and questions) within modules.

## Endpoints

### Get All Content
Retrieve a list of all content blocks.

**Request:**
```http
GET /api/content
```

**Response:**
```http
200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "type": "Text",
    "title": "Introduction to Java",
    "body": "Java is a programming language...",
    "isComplete": false,
    "moduleId": 1
  },
  {
    "id": 2,
    "type": "MultipleChoiceQuestion",
    "title": "Java Basics Quiz",
    "body": "What is the main method signature?",
    "isComplete": true,
    "moduleId": 1,
    "options": ["public static void main(String[] args)", "main(String[] args)", "void main()"],
    "correctAnswer": "public static void main(String[] args)",
    "userAnswer": "public static void main(String[] args)"
  }
]
```

### Get Content by ID
Retrieve a specific content block by its ID.

**Request:**
```http
GET /api/content/{id}
```

**Parameters:**
- `id` (path parameter) - Content ID

**Response:**
```http
200 OK
Content-Type: application/json

{
  "id": 1,
  "type": "Text",
  "title": "Introduction to Java",
  "body": "Java is a programming language...",
  "isComplete": false,
  "moduleId": 1
}
```

**Error Response:**
```http
404 Not Found
```

### Get Content by Module ID
Retrieve all content blocks for a specific module.

**Request:**
```http
GET /api/content/module/{moduleId}
```

**Parameters:**
- `moduleId` (path parameter) - Module ID

**Response:**
```http
200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "type": "Text",
    "title": "Introduction to Java",
    "body": "Java is a programming language...",
    "isComplete": false,
    "moduleId": 1
  }
]
```

### Create Content
Create a new content block.

**Request for Text Content:**
```http
POST /api/content
Content-Type: application/json

{
  "type": "Text",
  "title": "Introduction to Java",
  "body": "Java is a programming language...",
  "moduleId": 1
}
```

**Request for Question Content:**
```http
POST /api/content
Content-Type: application/json

{
  "type": "MultipleChoiceQuestion",
  "title": "Java Basics Quiz",
  "body": "What is the main method signature?",
  "moduleId": 1
}
```

**Response:**
```http
201 Created
Content-Type: application/json

{
  "id": 1,
  "type": "Text",
  "title": "Introduction to Java",
  "body": "Java is a programming language...",
  "isComplete": false,
  "moduleId": 1
}
```

**Error Response:**
```http
400 Bad Request
```
*When title is empty, type is null, or type is unsupported*

### Update Content
Update an existing content block.

**Request:**
```http
PUT /api/content/{id}
Content-Type: application/json

{
  "title": "Advanced Java Concepts",
  "body": "Advanced Java programming concepts...",
  "moduleId": 1
}
```

**Parameters:**
- `id` (path parameter) - Content ID

**Response:**
```http
200 OK
Content-Type: application/json

{
  "id": 1,
  "type": "Text",
  "title": "Advanced Java Concepts",
  "body": "Advanced Java programming concepts...",
  "isComplete": false,
  "moduleId": 1
}
```

**Error Responses:**
```http
404 Not Found
```
*When content doesn't exist*

```http
400 Bad Request
```
*When request data is invalid*

### Delete Content
Delete a content block by ID.

**Request:**
```http
DELETE /api/content/{id}
```

**Parameters:**
- `id` (path parameter) - Content ID

**Response:**
```http
204 No Content
```

**Error Response:**
```http
404 Not Found
```
*When content doesn't exist*

### Mark Content Complete
Mark a text content block as complete.

**Request:**
```http
POST /api/content/{id}/complete
```

**Parameters:**
- `id` (path parameter) - Content ID

**Response:**
```http
200 OK
Content-Type: application/json

{
  "id": 1,
  "type": "Text",
  "title": "Introduction to Java",
  "body": "Java is a programming language...",
  "isComplete": true,
  "moduleId": 1
}
```

**Error Response:**
```http
404 Not Found
```
*When content doesn't exist*

### Submit Answer
Submit an answer for a question content block.

**Request:**
```http
POST /api/content/{id}/answer
Content-Type: application/json

{
  "answer": "public static void main(String[] args)"
}
```

**Parameters:**
- `id` (path parameter) - Content ID

**Response:**
```http
200 OK
Content-Type: application/json

{
  "id": 2,
  "type": "MultipleChoiceQuestion",
  "title": "Java Basics Quiz",
  "body": "What is the main method signature?",
  "isComplete": true,
  "moduleId": 1,
  "options": ["public static void main(String[] args)", "main(String[] args)", "void main()"],
  "correctAnswer": "public static void main(String[] args)",
  "userAnswer": "public static void main(String[] args)"
}
```

**Error Responses:**
```http
404 Not Found
```
*When content doesn't exist*

```http
400 Bad Request
```
*When answer is missing*

## Examples

### Creating Text Content with curl
```bash
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Text",
    "title": "Java Variables",
    "body": "Variables are containers for storing data values...",
    "moduleId": 1
  }'
```

### Getting Content for a Module with curl
```bash
curl http://localhost:8080/api/content/module/1
```

### Marking Content Complete with curl
```bash
curl -X POST http://localhost:8080/api/content/1/complete
```

### Submitting Answer with curl
```bash
curl -X POST http://localhost:8080/api/content/2/answer \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "public static void main(String[] args)"
  }'
```