package rebootedmvp.testdata;

import rebootedmvp.Content;
import rebootedmvp.domain.impl.ModuleEntityImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.domain.impl.MultipleChoiceQuestionContentImpl;
import rebootedmvp.dto.NewTextContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.dto.NewMultipleChoiceQuestionContentDTO;
import rebootedmvp.dto.MultipleChoiceQuestionContentDTO;

import java.util.List;
import java.util.Arrays;

public class TestContentDataBuilder {

    public static class TextContentBuilder {
        private String title = "Test Content Title";
        private String body = "Test content body with detailed information.";
        private Long moduleId = 1L;
        private boolean isComplete = false;

        public TextContentBuilder withTitle(String title) {
            this.title = title;
            return this;
        }

        public TextContentBuilder withBody(String body) {
            this.body = body;
            return this;
        }

        public TextContentBuilder withModuleId(Long moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public TextContentBuilder withComplete(boolean complete) {
            this.isComplete = complete;
            return this;
        }

        public TextContentImpl buildEntity() {
            TextContentImpl content = new TextContentImpl(title, body, moduleId);
            content.setComplete(isComplete);
            return content;
        }

        public NewTextContentDTO buildNewDTO() {
            return new NewTextContentDTO(title, body, moduleId);
        }

        public TextContentDTO buildDTO() {
            return new TextContentDTO(null, title, body, isComplete, moduleId);
        }

        public TextContentDTO buildDTOWithId(Long id) {
            return new TextContentDTO(id, title, body, isComplete, moduleId);
        }
    }

    public static class ModuleBuilder {
        private String title = "Test Module";
        private String body = "Test module description";
        private Long courseId = 1L;
        private double weight = 1.0;

        public ModuleBuilder withTitle(String title) {
            this.title = title;
            return this;
        }

        public ModuleBuilder withBody(String body) {
            this.body = body;
            return this;
        }

        public ModuleBuilder withCourseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public ModuleBuilder withWeight(double weight) {
            this.weight = weight;
            return this;
        }

        public ModuleEntityImpl buildEntity() {
            ModuleEntityImpl module = new ModuleEntityImpl(title, body, courseId);
            module.setWeight(weight);
            return module;
        }
    }

    public static class MultipleChoiceBuilder {
        private String title = "Test Multiple Choice Question";
        private String body = "What is the correct answer to this test question?";
        private Long moduleId = 1L;
        private boolean isComplete = false;
        private List<String> options = Arrays.asList("Option A", "Option B", "Option C", "Option D");
        private String correctAnswer = "Option B";

        public MultipleChoiceBuilder withTitle(String title) {
            this.title = title;
            return this;
        }

        public MultipleChoiceBuilder withBody(String body) {
            this.body = body;
            return this;
        }

        public MultipleChoiceBuilder withModuleId(Long moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public MultipleChoiceBuilder withComplete(boolean complete) {
            this.isComplete = complete;
            return this;
        }

        public MultipleChoiceBuilder withOptions(List<String> options) {
            this.options = options;
            return this;
        }

        public MultipleChoiceBuilder withOptions(String... options) {
            this.options = Arrays.asList(options);
            return this;
        }

        public MultipleChoiceBuilder withCorrectAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
            return this;
        }

        public MultipleChoiceQuestionContentImpl buildEntity() {
            MultipleChoiceQuestionContentImpl content = new MultipleChoiceQuestionContentImpl(
                title, body, options, correctAnswer, moduleId
            );
            // Note: MultipleChoiceQuestionContentImpl doesn't implement setComplete
            return content;
        }

        public NewMultipleChoiceQuestionContentDTO buildNewDTO() {
            return new NewMultipleChoiceQuestionContentDTO(title, body, moduleId, options, correctAnswer);
        }

        public MultipleChoiceQuestionContentDTO buildDTO() {
            return new MultipleChoiceQuestionContentDTO(null, title, body, isComplete, moduleId, options, correctAnswer);
        }

        public MultipleChoiceQuestionContentDTO buildDTOWithId(Long id) {
            return new MultipleChoiceQuestionContentDTO(id, title, body, isComplete, moduleId, options, correctAnswer);
        }
    }

    // Factory methods for common test scenarios
    public static TextContentBuilder textContent() {
        return new TextContentBuilder();
    }

    public static MultipleChoiceBuilder multipleChoiceContent() {
        return new MultipleChoiceBuilder();
    }

    public static ModuleBuilder module() {
        return new ModuleBuilder();
    }

    // Pre-built common test data
    public static TextContentImpl createSimpleTextContent() {
        return textContent().buildEntity();
    }

    public static TextContentImpl createTextContentWithModule(Long moduleId) {
        return textContent().withModuleId(moduleId).buildEntity();
    }

    public static ModuleEntityImpl createSimpleModule() {
        return module().buildEntity();
    }

    public static ModuleEntityImpl createModuleWithCourse(Long courseId) {
        return module().withCourseId(courseId).buildEntity();
    }

    // DTO factory methods
    public static NewTextContentDTO createUpdateTextContentDTO() {
        return textContent()
            .withTitle("Updated Title")
            .withBody("Updated body content")
            .buildNewDTO();
    }

    public static NewTextContentDTO createUpdateTextContentDTO(String title, String body) {
        return textContent()
            .withTitle(title)
            .withBody(body)
            .buildNewDTO();
    }

    // Multiple Choice factory methods
    public static MultipleChoiceQuestionContentImpl createSimpleMultipleChoice() {
        return multipleChoiceContent().buildEntity();
    }

    public static MultipleChoiceQuestionContentImpl createMultipleChoiceWithModule(Long moduleId) {
        return multipleChoiceContent().withModuleId(moduleId).buildEntity();
    }

    public static NewMultipleChoiceQuestionContentDTO createUpdateMCQuestionDTO() {
        return multipleChoiceContent()
            .withTitle("Updated MC Question")
            .withBody("Updated question text")
            .withOptions("Updated A", "Updated B", "Updated C", "Updated D")
            .withCorrectAnswer("Updated B")
            .buildNewDTO();
    }

    public static NewMultipleChoiceQuestionContentDTO createUpdateMCQuestionDTO(String title, String body, List<String> options, String correctAnswer) {
        return multipleChoiceContent()
            .withTitle(title)
            .withBody(body)
            .withOptions(options)
            .withCorrectAnswer(correctAnswer)
            .buildNewDTO();
    }

    // Specific test scenarios
    public static NewMultipleChoiceQuestionContentDTO createScienceQuizDTO() {
        return multipleChoiceContent()
            .withTitle("Science Quiz")
            .withBody("What is H2O?")
            .withOptions("Water", "Hydrogen", "Oxygen", "Salt")
            .withCorrectAnswer("Water")
            .buildNewDTO();
    }

    public static NewMultipleChoiceQuestionContentDTO createMathQuizDTO() {
        return multipleChoiceContent()
            .withTitle("Math Quiz")
            .withBody("What is 2 + 2?")
            .withOptions("3", "4", "5", "6")
            .withCorrectAnswer("4")
            .buildNewDTO();
    }

    public static NewMultipleChoiceQuestionContentDTO createProgrammingQuizDTO() {
        return multipleChoiceContent()
            .withTitle("Programming Quiz")
            .withBody("Which is a Java keyword?")
            .withOptions("variable", "public", "function", "method")
            .withCorrectAnswer("public")
            .buildNewDTO();
    }
}