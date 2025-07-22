package rebootedmvp.dto;

import java.util.ArrayList;
import java.util.List;

import rebootedmvp.Content.ContentType;
import rebootedmvp.Match;

public class MatchingQuestionContentDTO extends ContentDTO {

    private List<Match> matches;

    // public QuestionContentDTO() {
    // super()
    // }

    public MatchingQuestionContentDTO(Long id, String title, String body, boolean isComplete, List<Match> matches,
            Long moduleId) {
        super(id, ContentType.MatchingQuestion, title, body, isComplete, moduleId);
        this.matches = new ArrayList<>(matches);
    }

    public List<Match> getMatches() {
        return matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = matches;
    }

}
