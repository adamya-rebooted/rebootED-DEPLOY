package rebootedmvp.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

import rebootedmvp.Content.ContentType;

public class NewContentDTO implements NewDTO {

    protected ContentType type;
    protected String title;
    protected String body;
    protected Long moduleId;

    public NewContentDTO() {
    }

    public NewContentDTO(ContentType type, String title, String body, Long moduleId) {
        this.type = type;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
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
