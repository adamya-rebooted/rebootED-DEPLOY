package rebootedmvp.dto;

import rebootedmvp.Content;

public class ImageContentDTO extends ContentDTO {

    public ImageContentDTO(Long id, String title, String body, boolean isComplete, Long moduleId) {
        super(id, Content.ContentType.Image, title, body, isComplete, moduleId);
    }
}
