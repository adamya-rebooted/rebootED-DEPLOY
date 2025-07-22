package rebootedmvp.dto;

import java.util.List;

import rebootedmvp.Content.ContentType;

public class NewMultipleChoiceQuestionContentDTO extends NewContentDTO {

    private List<String> options;
    private String correctAnswer;

    public NewMultipleChoiceQuestionContentDTO() {
    }

    public NewMultipleChoiceQuestionContentDTO(String title, String body, Long moduleId,
            List<String> options, String correctAnswer) {
        this.type = ContentType.MultipleChoiceQuestion;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.options = options;
        this.correctAnswer = correctAnswer;
    }

    // Getters and Setters
    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

}
