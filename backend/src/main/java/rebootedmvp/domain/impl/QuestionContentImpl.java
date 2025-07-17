package rebootedmvp.domain.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;

@Entity
// @DiscriminatorValue("QUESTION")
public class QuestionContentImpl extends ContentEntityImpl {

    // private String questionText;
    private boolean complete;

    @Column(name = "correct_answer")
    private String correctAnswer;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "option_text")
    private List<String> options;

    public QuestionContentImpl() {
        this.options = new ArrayList<>();
        this.contentType = ContentType.Question;

    }

    public QuestionContentImpl(String title, String questionText, List<String> options,
            String correctAnswer, Long moduleId) {
        this.title = title;
        this.body = questionText;
        this.options = new ArrayList<>(options);
        this.correctAnswer = correctAnswer;
        this.moduleId = moduleId;
        complete = false;
        this.contentType = ContentType.Question;
    }

    @Override
    public boolean isComplete() {
        return complete;
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

    public String getQuestionText() {
        return body;
    }

    public void setQuestionText(String questionText) {
        this.body = questionText;
    }

    public List<String> getOptions() {
        return new ArrayList<>(options);
    }

    @Override
    public void setOptions(List<String> options) {
        this.options = new ArrayList<>(options);
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
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
        return ContentType.Question;
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
