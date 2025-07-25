package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewVideoContentDTO extends NewContentDTO {

    private String videoUrl;

    public NewVideoContentDTO() {
    }

    public NewVideoContentDTO(String title, String body, Long moduleId) {
        super(ContentType.Video, title, body, moduleId);
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}
