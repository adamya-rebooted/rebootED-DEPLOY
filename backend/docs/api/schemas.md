# API Schema Definitions

## Data Transfer Objects (DTOs)

### CourseDTO
Represents a course in API responses.

```json
{
  "id": 1,
  "title": "string",
  "body": "string",
  "teacherCount": 0,
  "studentCount": 0,
  "moduleCount": 0
}
```

**Fields:**
- `id` (Long) - Unique identifier for the course
- `title` (String) - Course title
- `body` (String) - Course description
- `teacherCount` (Integer) - Number of teachers assigned to the course
- `studentCount` (Integer) - Number of students enrolled in the course
- `moduleCount` (Integer) - Number of modules in the course

### NewCourseDTO
Used for creating and updating courses.

```json
{
  "title": "string",
  "body": "string"
}
```

**Fields:**
- `title` (String, required) - Course title. Cannot be empty or null.
- `body` (String, optional) - Course description

**Validation Rules:**
- `title` is required and cannot be empty or contain only whitespace
- `body` is optional and can be null

## Domain Objects

### Course Interface
The core course interface that defines course behavior.

**Methods:**
- `get_teachers()` - Returns Set<LDUser> of teachers
- `get_students()` - Returns Set<LDUser> of students  
- `get_modules()` - Returns List<Module> of course modules
- `getBody()` - Returns course description
- `getProgress(User user)` - Returns progress for a specific user

### CourseImpl
Concrete implementation of the Course interface.

**Fields:**
- `id` (Long) - Course identifier
- `title` (String) - Course title
- `body` (String) - Course description
- `teachers` (Set<LDUser>) - Set of teacher users
- `students` (Set<LDUser>) - Set of student users
- `modules` (List<Module>) - List of course modules

## Response Examples

### Single Course Response
```json
{
  "id": 1,
  "title": "Java Fundamentals",
  "body": "Introduction to Java programming language",
  "teacherCount": 2,
  "studentCount": 15,
  "moduleCount": 8
}
```

### Course List Response
```json
[
  {
    "id": 1,
    "title": "Java Fundamentals",
    "body": "Introduction to Java programming",
    "teacherCount": 2,
    "studentCount": 15,
    "moduleCount": 8
  },
  {
    "id": 2,
    "title": "Spring Boot Basics",
    "body": "Learn Spring Boot framework",
    "teacherCount": 1,
    "studentCount": 12,
    "moduleCount": 6
  }
]
```

### Error Response
```json
{
  "error": "Course title cannot be empty"
}
```

### ModuleDTO
Represents a module in API responses.

```json
{
  "id": 1,
  "title": "string",
  "body": "string",
  "progress": 0.5,
  "courseId": 1,
  "contentCount": 5
}
```

**Fields:**
- `id` (Long) - Unique identifier for the module
- `title` (String) - Module title
- `body` (String) - Module description
- `progress` (Double) - Progress percentage (0.0 to 1.0)
- `courseId` (Long) - ID of the course this module belongs to
- `contentCount` (Integer) - Number of content blocks in the module

### NewModuleDTO
Used for creating and updating modules.

```json
{
  "title": "string",
  "body": "string",
  "courseId": 1
}
```

**Fields:**
- `title` (String, required) - Module title. Cannot be empty or null.
- `body` (String, optional) - Module description
- `courseId` (Long, required) - ID of the course this module belongs to

### ContentDTO
Represents content blocks (text or questions) in API responses.

```json
{
  "id": 1,
  "type": "Text",
  "title": "string",
  "body": "string",
  "isComplete": false,
  "moduleId": 1
}
```

**Fields:**
- `id` (Long) - Unique identifier for the content
- `type` (String) - Content type ("Text" or "MultipleChoiceQuestion")
- `title` (String) - Content title
- `body` (String) - Content body/description
- `isComplete` (Boolean) - Whether the content has been completed
- `moduleId` (Long) - ID of the module this content belongs to

### NewContentDTO
Used for creating and updating content blocks.

```json
{
  "type": "Text",
  "title": "string",
  "body": "string",
  "moduleId": 1
}
```

**For Multiple Choice Question Content:**
```json
{
  "type": "MultipleChoiceQuestion",
  "title": "string",
  "body": "string",
  "moduleId": 1,
  "options": ["option1", "option2", "option3"],
  "correctAnswer": "option1"
}
```

**Fields:**
- `type` (String, required) - Content type ("Text" or "MultipleChoiceQuestion")
- `title` (String, required) - Content title. Cannot be empty or null.
- `body` (String, optional) - Content body/description
- `moduleId` (Long, required) - ID of the module this content belongs to
- `options` (List<String>, required for MultipleChoiceQuestion) - Available answer options
- `correctAnswer` (String, required for MultipleChoiceQuestion) - The correct answer

### QuestionContentDTO
Extended DTO for question content with answer tracking.

```json
{
  "id": 1,
  "type": "MultipleChoiceQuestion",
  "title": "string",
  "body": "string",
  "isComplete": true,
  "moduleId": 1,
  "options": ["option1", "option2", "option3"],
  "correctAnswer": "option1",
  "userAnswer": "option1"
}
```

**Fields:**
- Inherits all fields from `ContentDTO`
- `options` (List<String>) - Available answer options
- `correctAnswer` (String) - The correct answer
- `userAnswer` (String) - The user's submitted answer

### UserProfileDTO
Represents user profiles in API responses.

```json
{
  "id": "user123",
  "username": "string",
  "fullName": "string",
  "userType": "LDUser"
}
```

**Fields:**
- `id` (String) - Unique identifier for the user
- `username` (String) - User's username
- `fullName` (String) - User's full name
- `userType` (String) - Type of user ("LDUser" or "EmployeeUser")