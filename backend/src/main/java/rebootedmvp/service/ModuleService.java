package rebootedmvp.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import rebootedmvp.Content;
import rebootedmvp.ContentMapper;
import rebootedmvp.Module;
import rebootedmvp.ModuleMapper;
import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.QuestionContentImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.dto.ContentDTO;
import rebootedmvp.dto.NewContentDTO;
import rebootedmvp.dto.QuestionContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.ModuleRepository;

@Service
@Transactional
public class ModuleService {

    private static final Logger logger = LoggerFactory.getLogger(ModuleService.class);

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ContentRepository contentRepository;

    /**
     * Returns a list of all content in all modules
     */
    @Transactional(readOnly = true)
    public List<ContentDTO> findAll() {
        logger.debug("ModuleService.findAll() called - returning all content");
        return mapToDTO(contentRepository.findAll().stream().map(ContentMapper::toDomain).toList());
    }

    /**
     * Returns a list of all content within the module with given ID
     */
    @Transactional(readOnly = true)
    public List<ContentDTO> getById(Long moduleId) {
        logger.debug("ModuleService.getById({}) called - getting content for module", moduleId);

        if (!moduleRepository.existsById(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        return mapToDTO(contentRepository.findByModuleIdOrderByCreatedAtAsc(moduleId)
                .stream()
                .map(ContentMapper::toDomain)
                .toList());
    }

    /**
     * Returns the specific content within the module
     */
    @Transactional(readOnly = true)
    public ContentDTO getById(Long moduleId, Long contentId) {
        logger.debug("ModuleService.getById({}, {}) called - getting specific content", moduleId, contentId);

        if (!moduleRepository.existsById(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        Optional<Content> contentOpt = contentRepository.findById(contentId).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content not found with id: " + contentId);
        }

        Content content = contentOpt.get();
        if (!content.getModuleId().equals(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Content " + contentId + " does not belong to module " + moduleId);
        }

        return convertToDTO(content);
    }

    /**
     * Adds new content to the specified module
     */
    public Long addNew(Long moduleId, NewContentDTO newContentDTO) {
        logger.debug("ModuleService.addNew({}, {}) called", moduleId, newContentDTO.getTitle());

        if (newContentDTO.getTitle() == null || newContentDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("The title must be supplied in the DTO");
        }

        Optional<Module> moduleOpt = moduleRepository.findById(moduleId).map(ModuleMapper::toDomain);
        if (moduleOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        Module module = moduleOpt.get();

        // Set the module ID in the DTO for the content service
        newContentDTO.setModuleId(moduleId);

        Content content;
        if (null == newContentDTO.getType()) {
            throw new IllegalArgumentException("Unsupported content type: " + newContentDTO.getType());
        } else
            switch (newContentDTO.getType()) {
                case "Text" -> content = new ContentEntityImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        module,
                        Content.ContentType.Text);
                case "Question" -> content = new ContentEntityImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        newContentDTO.getOptions(),
                        newContentDTO.getCorrectAnswer(),
                        module);
                default -> throw new IllegalArgumentException("Unsupported content type: " + newContentDTO.getType());
            }

        Content savedContent = contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Created content with ID: {} in module: {}", savedContent.getId(), moduleId);
        return savedContent.getId();
    }

    /**
     * Updates content within a module
     */
    public void update(Long moduleId, Long contentId, NewContentDTO updateDTO) {
        logger.debug("ModuleService.update({}, {}, {}) called", moduleId, contentId, updateDTO.getTitle());

        if (!moduleRepository.existsById(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        Optional<Content> contentOpt = contentRepository.findById(contentId).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content not found with id: " + contentId);
        }

        Content content = contentOpt.get();
        if (!content.getModuleId().equals(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Content " + contentId + " does not belong to module " + moduleId);
        }

        if (updateDTO.getTitle() != null && !updateDTO.getTitle().trim().isEmpty()) {
            content.setTitle(updateDTO.getTitle().trim());
        }

        switch (content.getType()) {
            case Text -> {
                content = (TextContentImpl) content;
                if (updateDTO.getBody() != null) {
                    content.setBody(updateDTO.getBody());
                }
            }
            case Question -> {
                QuestionContentImpl questionContent = (QuestionContentImpl) content;
                if (updateDTO.getBody() != null) {
                    questionContent.setQuestionText(updateDTO.getBody());
                }
                if (updateDTO.getOptions() != null) {
                    questionContent.setOptions(updateDTO.getOptions());
                }
                if (updateDTO.getCorrectAnswer() != null) {
                    questionContent.setCorrectAnswer(updateDTO.getCorrectAnswer());
                }
            }
        }
        contentRepository.save(ContentMapper.toEntity(content));
        logger.info("Updated content with ID: {} in module: {}", contentId, moduleId);
    }

    /**
     * Deletes content from a module
     */
    public boolean delete(Long moduleId, Long contentId) {
        logger.debug("ModuleService.delete({}, {}) called", moduleId, contentId);

        if (!moduleRepository.existsById(moduleId)) {
            return false;
        }

        Optional<Content> contentOpt = contentRepository.findById(contentId).map(ContentMapper::toDomain);
        if (contentOpt.isEmpty()) {
            return false;
        }

        Content content = contentOpt.get();
        if (!content.getModuleId().equals(moduleId)) {
            return false;
        }

        contentRepository.deleteById(contentId);
        logger.info("Deleted content with ID: {} from module: {}", contentId, moduleId);
        return true;
    }

    private static List<ContentDTO> mapToDTO(List<Content> toMap) {
        return toMap.stream().map(
                elem -> convertToDTO(elem)).toList();
    }

    private static ContentDTO convertToDTO(Content content) {
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
