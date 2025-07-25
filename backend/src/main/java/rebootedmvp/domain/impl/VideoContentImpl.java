package rebootedmvp.domain.impl;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "Video_Info")
public class VideoContentImpl extends ContentEntityImpl {

    // private String questionText;

    @Column(name = "video_url", nullable = false)
    private String videoUrl;

    public VideoContentImpl() {
        this.contentType = ContentType.Video;

    }

    public VideoContentImpl(String title, String body, String videoURL, Long moduleId) {
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.contentType = ContentType.Video;
        this.videoUrl = videoURL;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String URL) {
        this.videoUrl = URL;
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
        return ContentType.Video;
    }

    @Override
    public void setComplete(boolean complete) {
        throw new UnsupportedOperationException("Unimplemented method 'setComplete'");
    }
}
