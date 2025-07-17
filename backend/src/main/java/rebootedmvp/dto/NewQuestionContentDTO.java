package rebootedmvp.dto;

import java.util.List;

import rebootedmvp.Content.ContentType;

public class NewQuestionContentDTO extends NewContentDTO {

    private List<String> options;
    private String correctAnswer;

    public NewQuestionContentDTO() {
    }

    public NewQuestionContentDTO(ContentType type, String title, String body, Long moduleId,
            List<String> options, String correctAnswer) {
        super(type, title, body, moduleId, options, correctAnswer);
    }

    // Getters and Setters
    public List<String> getOptions() {
        return options;
    }

    @Override
    public void setOptions(List<String> options) {
        this.options = options;
    }

    @Override
    public String getCorrectAnswer() {
        return correctAnswer;
    }

    @Override
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

}
