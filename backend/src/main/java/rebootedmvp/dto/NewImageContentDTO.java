package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewImageContentDTO extends NewContentDTO {
    public NewImageContentDTO() {
    }

    public NewImageContentDTO(String title, String body, Long moduleId) {
        super(ContentType.Image, title, body, moduleId);
    }
}
