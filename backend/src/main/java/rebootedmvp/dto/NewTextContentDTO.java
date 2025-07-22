package rebootedmvp.dto;

import rebootedmvp.Content.ContentType;

public class NewTextContentDTO extends NewContentDTO {

    public NewTextContentDTO() {
    }

    public NewTextContentDTO(String title, String body, Long moduleId) {
        super(ContentType.Text, title, body, moduleId);
    }

}
