package rebootedmvp.dto;

import rebootedmvp.Content;

public class VideoContentDTO extends ContentDTO {

    private String videoUrl;

    public VideoContentDTO(Long id, String title, String body, boolean isComplete, Long moduleId, String videoUrl) {
        super(id, Content.ContentType.Video, title, body, isComplete, moduleId);
        this.videoUrl = videoUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

}
