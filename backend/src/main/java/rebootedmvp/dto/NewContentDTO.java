package rebootedmvp.dto;

import java.util.List;

import rebootedmvp.Content.ContentType;

public class NewContentDTO implements NewDTO {

    private ContentType type;
    private String title;
    private String body;
    private Long moduleId;
    private List<String> options;
    private String correctAnswer;

    public NewContentDTO() {
    }

    public NewContentDTO(ContentType type, String title, String body, Long moduleId) {
        this.type = type;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
    }

    public NewContentDTO(ContentType type, String title, String body, Long moduleId, List<String> options,
            String correctAnswer) {
        this.type = type;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.options = options;
        this.correctAnswer = correctAnswer;
    }

    public ContentType getType() {
        return type;
    }

    public void setType(ContentType type) {
        this.type = type;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    public String getBody() {
        return body;
    }

    @Override
    public void setBody(String body) {
        this.body = body;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    // public List<String> getOptions() {
    // return options;
    // }

    // public void setOptions(List<String> options) {
    // this.options = options;
    // }

    // public String getCorrectAnswer() {
    // return correctAnswer;
    // }

    // public void setCorrectAnswer(String correctAnswer) {
    // this.correctAnswer = correctAnswer;
    // }
}
