package rebootedmvp.dto;

import java.util.ArrayList;
import java.util.List;

import rebootedmvp.Content.ContentType;
import rebootedmvp.Match;

public class NewMatchingQuestionContentDTO extends NewContentDTO {

    private List<Match> matches;

    public NewMatchingQuestionContentDTO() {
        this.type = ContentType.MatchingQuestion;
    }

    public NewMatchingQuestionContentDTO(String title, String body, Long moduleId,
            List<Match> matches) {
        this.type = ContentType.MatchingQuestion;
        this.title = title;
        this.body = body;
        this.moduleId = moduleId;
        this.matches = new ArrayList<>(matches);
    }

    public List<Match> getMatches() {
        return matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = new ArrayList<>(matches);
    }

}
