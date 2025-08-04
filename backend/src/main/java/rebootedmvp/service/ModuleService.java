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
import rebootedmvp.domain.impl.CourseEntityImpl;
import rebootedmvp.domain.impl.ImageContentImpl;
import rebootedmvp.domain.impl.MatchingQuestionContentImpl;
import rebootedmvp.domain.impl.MultipleChoiceQuestionContentImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.domain.impl.VideoContentImpl;
import rebootedmvp.dto.ContentDTO;
import rebootedmvp.dto.ImageContentDTO;
import rebootedmvp.dto.MatchingQuestionContentDTO;
import rebootedmvp.dto.MultipleChoiceQuestionContentDTO;
import rebootedmvp.dto.NewContentDTO;
import rebootedmvp.dto.NewMatchingQuestionContentDTO;
import rebootedmvp.dto.NewMultipleChoiceQuestionContentDTO;
import rebootedmvp.dto.NewVideoContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.dto.VideoContentDTO;
import rebootedmvp.exception.CoursePublishedException;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.ModuleRepository;

@Service
@Transactional
public class ModuleService {

    private static final Logger logger = LoggerFactory.getLogger(ModuleService.class);

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private CourseRepository courseRepository;

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
        Optional<CourseEntityImpl> course = courseRepository.findById(module.getCourseId());
        if (course.get() != null) {
            if (course.get().isPublished() == true) {
                throw new CoursePublishedException("addNew");
            }
        }

        // Set the module ID in the DTO for the content service
        newContentDTO.setModuleId(moduleId);

        Content content;
        if (null == newContentDTO.getType()) {
            throw new IllegalArgumentException("Unsupported content type: " + newContentDTO.getType());
        } else
            switch (newContentDTO.getType()) {
                case Text -> content = new TextContentImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        module.getId());
                case MultipleChoiceQuestion -> content = new MultipleChoiceQuestionContentImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        ((NewMultipleChoiceQuestionContentDTO) newContentDTO).getOptions(),
                        ((NewMultipleChoiceQuestionContentDTO) newContentDTO).getCorrectAnswer(),
                        moduleId);
                case Video -> content = new VideoContentImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        ((NewVideoContentDTO) newContentDTO).getVideoUrl(),
                        moduleId);
                case MatchingQuestion -> content = new MatchingQuestionContentImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        ((NewMatchingQuestionContentDTO) newContentDTO).getMatches(),
                        moduleId);
                case Image -> content = new ImageContentImpl(
                        newContentDTO.getTitle().trim(),
                        newContentDTO.getBody(),
                        module.getId());
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

        Module module = moduleRepository.findById(moduleId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId));

        Optional<CourseEntityImpl> course = courseRepository.findById(module.getCourseId());
        if (course.get() != null) {
            if (course.get().isPublished() == true) {
                throw new CoursePublishedException("update");
            }
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
                if (updateDTO.getTitle() != null) {
                    content.setTitle(updateDTO.getTitle());
                }
                if (updateDTO.getBody() != null) {
                    content.setBody(updateDTO.getBody());
                }
            }
            case MultipleChoiceQuestion -> {
                MultipleChoiceQuestionContentImpl questionContent = (MultipleChoiceQuestionContentImpl) content;
                NewMultipleChoiceQuestionContentDTO qDTO = (NewMultipleChoiceQuestionContentDTO) updateDTO;
                if (updateDTO.getTitle() != null) {
                    content.setTitle(updateDTO.getTitle());
                }
                if (updateDTO.getBody() != null) {
                    questionContent.setQuestionText(updateDTO.getBody());
                }
                if ((qDTO).getOptions() != null) {
                    questionContent.setOptions(qDTO.getOptions());
                }
                if (((NewMultipleChoiceQuestionContentDTO) updateDTO).getCorrectAnswer() != null) {
                    questionContent
                            .setCorrectAnswer(((NewMultipleChoiceQuestionContentDTO) updateDTO).getCorrectAnswer());
                }
            }
            case Video -> {
                VideoContentImpl videoContent = (VideoContentImpl) content;
                if (updateDTO.getTitle() != null) {
                    content.setTitle(updateDTO.getTitle());
                }
                if (updateDTO.getBody() != null) {
                    videoContent.setBody(updateDTO.getBody());
                }
                if (((NewVideoContentDTO) updateDTO).getVideoUrl() != null) {
                    videoContent.setVideoUrl(((NewVideoContentDTO) updateDTO).getVideoUrl());
                }
            }
            case MatchingQuestion -> {
                MatchingQuestionContentImpl matchingContent = (MatchingQuestionContentImpl) content;
                NewMatchingQuestionContentDTO mDTO = (NewMatchingQuestionContentDTO) updateDTO;
                if (updateDTO.getTitle() != null) {
                    content.setTitle(updateDTO.getTitle());
                }
                if (updateDTO.getBody() != null) {
                    matchingContent.setBody(updateDTO.getBody());
                }
                if (mDTO.getMatches() != null) {
                    matchingContent.setMatches(mDTO.getMatches());
                }
            }
            case Image -> {
                content = (ImageContentImpl) content;
                if (updateDTO.getTitle() != null) {
                    content.setTitle(updateDTO.getTitle());
                }
                if (updateDTO.getBody() != null) {
                    content.setBody(updateDTO.getBody());
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
        Module module = moduleRepository.findById(moduleId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId));

        Optional<CourseEntityImpl> course = courseRepository.findById(module.getCourseId());
        if (course.get() != null) {
            if (course.get().isPublished() == true) {
                throw new CoursePublishedException("delete");
            }
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
        return switch (content.getType()) {
            case Text -> new TextContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    content.getModuleId());

            case MultipleChoiceQuestion -> new MultipleChoiceQuestionContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    content.getModuleId(),
                    ((MultipleChoiceQuestionContentImpl) content).getOptions(),
                    ((MultipleChoiceQuestionContentImpl) content).getCorrectAnswer());

            case Video -> new VideoContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    content.getModuleId(),
                    ((VideoContentImpl) content).getVideoUrl());

            case MatchingQuestion -> new MatchingQuestionContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    ((MatchingQuestionContentImpl) content).getMatches(),
                    content.getModuleId());
            case Image -> new ImageContentDTO(
                    content.getId(),
                    content.getTitle(),
                    content.getBody(),
                    content.isComplete(),
                    content.getModuleId());

        };
    }
}
