package rebootedmvp.dto;

import rebootedmvp.Content;

public class TextContentDTO extends ContentDTO {

    public TextContentDTO(Long id, String title, String body, boolean isComplete, Long moduleId) {
        super(id, Content.ContentType.Text, title, body, isComplete, moduleId);
    }

}
