package rebootedmvp.domain.impl;

import java.util.List;

import jakarta.persistence.Entity;
import rebootedmvp.Content;

@Entity
@jakarta.persistence.DiscriminatorValue("TEXT")
public class TextContentImpl extends Content {

    public TextContentImpl(Long id, String title, String body) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.isComplete = false;
    }

    public TextContentImpl(Long id, String title, String body, Long moduleId) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.isComplete = false;
    }

    @Override
    public boolean isComplete() {
        return isComplete;
    }

    @Override
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    @Override
    public void setComplete(boolean complete) {
        isComplete = complete;
    }

    @Override
    public Long getModuleId() {
        return moduleId;
    }

    @Override
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    @Override
    public ContentType getType() {
        return ContentType.Text;
    }

    @Override
    public String getCorrectAnswer() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<String> getOptions() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getOptions'");
    }
}
