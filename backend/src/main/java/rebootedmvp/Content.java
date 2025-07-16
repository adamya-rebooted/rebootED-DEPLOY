package rebootedmvp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // or JOINED, TABLE_PER_CLASS
@Table(name = "content")
public abstract class Content implements HasID {

    @Column(nullable = false)
    protected String title;

    @Column(columnDefinition = "TEXT")
    protected String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type")
    protected Content.ContentType contentType;

    @Column(name = "is_complete")
    protected boolean isComplete = false;

    @Column(name = "created_at", updatable = false)
    protected LocalDateTime createdAt;

    @Column(name = "updated_at")
    protected LocalDateTime updatedAt;

    // Many-to-One relationship back to Module
    @Column(name = "module_id", nullable = false)
    protected Long moduleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    // Fields specific to Question content type
    @Column(name = "question_text", columnDefinition = "TEXT")
    protected String questionText;

    @ElementCollection
    @CollectionTable(name = "content_options", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "option_text")
    protected List<String> optionText = new ArrayList<>();

    @Column(name = "correct_answer")
    protected String correctAnswer;

    @Column(name = "user_answer")
    protected String userAnswer;

    /**
     * Different atomic units of content blocks. Each one is an implementation
     * of this interface
     */
    public enum ContentType {
        Text,
        Question,
    }

    /**
     * Returns whether the task/object/question is complete or not
     */
    abstract public boolean isComplete();

    /**
     * Returns the content type of the user
     */
    abstract public ContentType getType();

    /**
     * Returns the id of the module that this content belongs to
     */
    abstract public Long getModuleId();

    /**
     * Sets the id that this content belongs to.
     * Note: This should likely only be used in service methods when adding/removing
     * contents.
     */
    abstract public void setModuleId(Long moduleId);

    /**
     * Sets the completeness of the content to 'complete'
     * 
     * @param complete - The new status of the content
     */
    abstract public void setComplete(boolean complete);

    abstract public String getCorrectAnswer();

    abstract public List<String> getOptions();

    /**
     * Returns the question text for Question content types
     * For Text content, this may return null or throw an exception
     */
    abstract public String getQuestionText();

}
