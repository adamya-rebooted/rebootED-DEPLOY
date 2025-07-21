package rebootedmvp.domain.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import rebootedmvp.Match;

@Entity
// @DiscriminatorValue("QUESTION")
@Table(name = "Matching_Question_Info")
public class MatchingQuestionContentImpl extends ContentEntityImpl {

    // private String questionText;

    @ElementCollection
    @CollectionTable(name = "matching_question_matches", joinColumns = @JoinColumn(name = "question_id"))
    private List<Match> matches;

    public MatchingQuestionContentImpl() {
        this.contentType = ContentType.MatchingQuestion;

    }

    public MatchingQuestionContentImpl(String title, String questionText, List<Match> matches,
            Long moduleId) {
        this.title = title;
        this.body = questionText;
        this.matches = new ArrayList<>(matches);
        this.moduleId = moduleId;
        this.contentType = ContentType.MatchingQuestion;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public void setTitle(String title) {
        this.title = title;
    }

    public List<Match> getMatches() {
        return new ArrayList<>(matches);
    }

    public void setMatches(List<Match> matches) {
        this.matches = new ArrayList<>(matches);
    }

    @Override
    public Long getModuleId() {
        return moduleId;
    }

    @Override
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    @Override
    public ContentType getType() {
        return ContentType.MatchingQuestion;
    }

    @Override
    public String getBody() {
        return body;
    }

    @Override
    public void setBody(String newBody) {
        this.body = newBody;
    }

    @Override
    public void setComplete(boolean complete) {
        throw new UnsupportedOperationException("Unimplemented method 'setComplete'");
    }
}
