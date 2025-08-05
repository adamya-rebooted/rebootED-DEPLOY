package rebootedmvp.dto;

import rebootedmvp.Content;

public class ImageContentDTO extends ContentDTO {

    private String imgURL;

    public ImageContentDTO(Long id, String title, String body, boolean isComplete, Long moduleId, String imgURL) {
        super(id, Content.ContentType.Image, title, body, isComplete, moduleId);
        this.imgURL = imgURL;
    }

    public String getURL() {
        return imgURL;
    }

    public void setURL(String newURL) {
        this.imgURL = newURL;
    }
}
