package rebootedmvp;

import org.springframework.stereotype.Component;

import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.MultipleChoiceQuestionContentImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.domain.impl.VideoContentImpl;
import rebootedmvp.domain.impl.*;

@Component
public class ContentMapper {
    public static Content toDomain(ContentEntityImpl entity) {
        return entity;
    }

    public static ContentEntityImpl toEntity(Content content) {
        return switch (content.getType()) {
            case Text -> mapToTextContent(content);
            case MultipleChoiceQuestion -> mapToQuestionContent(content);
            case Video -> mapToVideoContent(content);
            case MatchingQuestion -> mapToMatchingQuestionContent(content);
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

    private static MultipleChoiceQuestionContentImpl mapToQuestionContent(Content content) {
        MultipleChoiceQuestionContentImpl question = new MultipleChoiceQuestionContentImpl(
                content.getTitle(),
                content.getBody(), // body as questionText
                ((MultipleChoiceQuestionContentImpl) content).getOptions(),
                content instanceof MultipleChoiceQuestionContentImpl qc ? qc.getCorrectAnswer() : null,
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

    private static MatchingQuestionContentImpl mapToMatchingQuestionContent(Content content) {
        MatchingQuestionContentImpl matching = new MatchingQuestionContentImpl(
                content.getTitle(),
                content.getBody(), // body as questionText
                ((MatchingQuestionContentImpl) content).getMatches(),
                content.getModuleId());
        matching.setId(content.getId());
        return matching;
    }
}