package rebootedmvp.dto;

import rebootedmvp.Content;

public abstract class ContentDTO {

    protected Long id;
    protected Content.ContentType type;
    protected String title;
    protected String body;
    protected boolean isComplete;
    protected Long moduleId;

    public ContentDTO(Content c) {
        this.id = c.getId();
        this.type = c.getType();
        this.title = c.getTitle();
        this.body = c.getBody();
        this.isComplete = c.isComplete();
        this.moduleId = c.getId();

    }

    public ContentDTO(Long id, Content.ContentType type, String title, String body, boolean isComplete,
            Long moduleId) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.body = body;
        this.isComplete = false;
        this.moduleId = moduleId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Content.ContentType getType() {
        return type;
    }

    public void setType(Content.ContentType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isComplete() {
        return isComplete;
    }

    public void setComplete(boolean complete) {
        isComplete = complete;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
}
