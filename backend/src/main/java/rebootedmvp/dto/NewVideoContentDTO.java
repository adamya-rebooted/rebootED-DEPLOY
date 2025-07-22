package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewVideoContentDTO extends NewContentDTO {

    private String videoURL;

    public NewVideoContentDTO() {
    }

    public NewVideoContentDTO(String title, String body, Long moduleId) {
        super(ContentType.Video, title, body, moduleId);
    }

    public String getVideoURL() {
        return videoURL;
    }

    public void setVideoURL(String videoURL) {
        this.videoURL = videoURL;
    }
}
