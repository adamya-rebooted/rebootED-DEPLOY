package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewTextContentDTO extends NewContentDTO {

    public NewTextContentDTO() {
    }

    public NewTextContentDTO(ContentType type, String title, String body, Long moduleId) {
        super(type, title, body, moduleId);
    }

}
