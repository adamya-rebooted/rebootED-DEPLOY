package rebootedmvp.domain.impl;

import jakarta.persistence.Entity;

@Entity
public class ImageContentImpl extends ContentEntityImpl {

    public ImageContentImpl(String title, String body) {
        // this.id = id;
        this.title = title;
        this.body = body;
        this.isComplete = false;
        this.contentType = ContentType.Image;
    }

    public ImageContentImpl(String title, String body, Long moduleId) {
        // this.id = id;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.isComplete = false;
        this.contentType = ContentType.Image;

    }

    // ⚠️ Required by JPA — but not usable by normal code
    @Deprecated
    protected ImageContentImpl() {
        // JPA only
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
        return ContentType.Image;
    }

}
