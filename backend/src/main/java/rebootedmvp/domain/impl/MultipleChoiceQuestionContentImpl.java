package rebootedmvp.domain.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
// @DiscriminatorValue("QUESTION")
@Table(name = "Multiple_Choice_Question_Info")
public class MultipleChoiceQuestionContentImpl extends ContentEntityImpl {

    // private String questionText;

    @Column(name = "correct_answer")
    private String correctAnswer;

    @ElementCollection
    @CollectionTable(name = "multiple_choice_question_options", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "option_text")
    private List<String> options;

    public MultipleChoiceQuestionContentImpl() {
        this.options = new ArrayList<>();
        this.contentType = ContentType.MultipleChoiceQuestion;

    }

    public MultipleChoiceQuestionContentImpl(String title, String questionText, List<String> options,
            String correctAnswer, Long moduleId) {
        this.title = title;
        this.body = questionText;
        this.options = new ArrayList<>(options);
        this.correctAnswer = correctAnswer;
        this.moduleId = moduleId;
        this.contentType = ContentType.MultipleChoiceQuestion;
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
        return ContentType.MultipleChoiceQuestion;
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
