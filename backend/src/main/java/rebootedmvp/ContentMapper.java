package rebootedmvp;

import org.springframework.stereotype.Component;

import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.QuestionContentImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.domain.impl.VideoContentImpl;

@Component
public class ContentMapper {
    public static Content toDomain(ContentEntityImpl entity) {
        return entity;
    }

    public static ContentEntityImpl toEntity(Content content) {
        return switch (content.getType()) {
            case Text -> mapToTextContent(content);
            case Question -> mapToQuestionContent(content);
            case Video -> mapToVideoContent(content);
        };
    }

    private static TextContentImpl mapToTextContent(Content content) {
        TextContentImpl text = new TextContentImpl(
                content.getTitle(),
                content.getBody(),
                content.getModuleId());
        text.setId(content.getId());
        return text;
    }

    private static QuestionContentImpl mapToQuestionContent(Content content) {
        QuestionContentImpl question = new QuestionContentImpl(
                content.getTitle(),
                content.getBody(), // body as questionText
                ((QuestionContentImpl) content).getOptions(),
                content instanceof QuestionContentImpl qc ? qc.getCorrectAnswer() : null,
                content.getModuleId());
        question.setId(content.getId());
        return question;
    }

    private static VideoContentImpl mapToVideoContent(Content content) {
        VideoContentImpl video = new VideoContentImpl(
                content.getTitle(),
                content.getBody(), // body as questionText
                ((VideoContentImpl) content).getVideoURL(),
                content.getModuleId());
        video.setId(content.getId());
        return video;
    }
}