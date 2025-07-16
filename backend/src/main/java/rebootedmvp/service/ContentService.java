package rebootedmvp.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rebootedmvp.Content;
import rebootedmvp.ContentMapper;
import rebootedmvp.Module;
import rebootedmvp.ModuleMapper;
import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.QuestionContentImpl;
import rebootedmvp.dto.ContentDTO;
import rebootedmvp.dto.NewContentDTO;
import rebootedmvp.dto.QuestionContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.ModuleRepository;

@Service
@Transactional
public class ContentService {

    private static final Logger logger = LoggerFactory.getLogger(ContentService.class);

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Transactional(readOnly = true)
    public List<ContentDTO> findAll() {
        logger.debug("ContentService.findAll() called");
        return contentRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> findByModuleId(Long moduleId) {
        logger.debug("ContentService.findByModuleId({}) called", moduleId);
        return contentRepository.findByModuleIdOrderByCreatedAtAsc(moduleId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    @EntityGraph(attributePaths = { "teachers" })
    public ContentDTO findById(Long id) {
        logger.debug("ContentService.findById({}) called", id);
        Optional<Content> content = contentRepository.findById(id).map(ContentMapper::toDomain);
        return content.map(this::convertToDTO).orElse(null);
    }

    public ContentDTO create(NewContentDTO newContentDTO) {
        logger.debug("ContentService.create() called with type: {}", newContentDTO.getType());

        if (newContentDTO.getTitle() == null || newContentDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Content title cannot be empty");
        }
        if (newContentDTO.getType() == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }
        if (newContentDTO.getModuleId() == null) {
            throw new IllegalArgumentException("Module ID cannot be null");
        }

        // Find the module
        Optional<Module> moduleOpt = moduleRepository.findById(newContentDTO.getModuleId()).map(ModuleMapper::toDomain);
        if (moduleOpt.isEmpty()) {
            throw new IllegalArgumentException("Module not found with ID: " + newContentDTO.getModuleId());
        }
        Module module = moduleOpt.get();

        Content content;

        if ("Text".equals(newContentDTO.getType())) {
            content = new ContentEntityImpl(
                    newContentDTO.getTitle().trim(),
                    newContentDTO.getBody(),
                    module,
                    Content.ContentType.Text);
        } else if ("Question".equals(newContentDTO.getType())) {
            List<String> options = newContentDTO.getOptions() != null ? newContentDTO.getOptions() : List.of();
            String correctAnswer = newContentDTO.getCorrectAnswer() != null ? newContentDTO.getCorrectAnswer() : "";

            // Validate question data
            if (options.size() < 2) {
                throw new IllegalArgumentException("Question must have at least 2 options");
            }
            if (correctAnswer.isEmpty()) {
                throw new IllegalArgumentException("Question must have a correct answer");
            }
            if (!options.contains(correctAnswer)) {
                throw new IllegalArgumentException("Correct answer must be one of the provided options");
            }

            content = new ContentEntityImpl(
                    newContentDTO.getTitle().trim(),
                    newContentDTO.getBody(),
                    options,
                    correctAnswer,
                    module);
        } else {
            throw new IllegalArgumentException("Unsupported content type: " + newContentDTO.getType());
        }

        Content savedContent = contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Created content with ID: {} in module: {}", savedContent.getId(), module.getId());
        return convertToDTO(savedContent);
    }

    public ContentDTO update(Long id, NewContentDTO updateContentDTO) {
        logger.debug("ContentService.update({}) called", id);

        Optional<Content> contentOpt = contentRepository.findById(id).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            return null;
        }

        Content content = contentOpt.get();

        if (updateContentDTO.getTitle() != null && !updateContentDTO.getTitle().trim().isEmpty()) {
            content.setTitle(updateContentDTO.getTitle().trim());
        }
        if (updateContentDTO.getBody() != null) {
            if (content.getType() == Content.ContentType.Text) {
                content.setBody(updateContentDTO.getBody());
            }
        }

        // Update question-specific fields if this is a question
        if (content.getType() == Content.ContentType.Question) {
            ((QuestionContentImpl) content).setQuestionText(updateContentDTO.getBody());
            if (updateContentDTO.getOptions() != null) {
                ((QuestionContentImpl) content).setOptions(updateContentDTO.getOptions());
            }
            if (updateContentDTO.getCorrectAnswer() != null) {
                ((QuestionContentImpl) content).setCorrectAnswer(updateContentDTO.getCorrectAnswer());
            }
        }

        Content savedContent = contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Updated content with ID: {}", savedContent.getId());
        return

        convertToDTO(savedContent);
    }

    public boolean delete(Long id) {
        logger.debug("ContentService.delete({}) called", id);

        if (contentRepository.existsById(id)) {
            contentRepository.deleteById(id);
            logger.info("Deleted content with ID: {}", id);
            return true;
        }
        return false;
    }

    public ContentDTO markComplete(Long id) {
        logger.debug("ContentService.markComplete({}) called", id);

        Optional<Content> contentOpt = contentRepository.findById(id).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            return null;
        }

        Content content = contentOpt.get();
        content.setComplete(true);

        Content savedContent = contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Marked content {} as complete", savedContent.getId());
        return convertToDTO(savedContent);
    }

    public ContentDTO markIncomplete(Long id) {
        logger.debug("ContentService.markComplete({}) called", id);

        Optional<Content> contentOpt = contentRepository.findById(id).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            return null;
        }

        Content content = contentOpt.get();
        content.setComplete(false);

        Content savedContent = contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Marked content {} as complete", savedContent.getId());
        return convertToDTO(savedContent);
    }

    private ContentDTO convertToDTO(Content content) {
        if (content.getType() == Content.ContentType.Text) {
            return new TextContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    content.getModuleId());
        } else if (content.getType() == Content.ContentType.Question) {
            return new QuestionContentDTO(
                    content.getId(),
                    content.getTitle(),
                    ((ContentEntityImpl) content).getQuestionText(),
                    content.isComplete(),
                    content.getModuleId(),
                    ((ContentEntityImpl) content).getOptions(),
                    ((ContentEntityImpl) content).getCorrectAnswer());
        }
        return null;
    }
}
