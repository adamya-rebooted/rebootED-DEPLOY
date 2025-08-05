package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewImageContentDTO extends NewContentDTO {

    private String URL;

    public NewImageContentDTO() {
    }

    public NewImageContentDTO(String title, String body, Long moduleId, String URL) {
        super(ContentType.Image, title, body, moduleId);
        this.URL = URL;
    }

    public String getURL() {
        return URL;
    }

    public void setURL(String URL) {
        this.URL = URL;
    }
}
