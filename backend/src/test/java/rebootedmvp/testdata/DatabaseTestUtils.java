package rebootedmvp.testdata;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rebootedmvp.domain.impl.ModuleEntityImpl;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.domain.impl.MultipleChoiceQuestionContentImpl;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.ModuleRepository;
import rebootedmvp.repository.CourseRepository;

import java.util.List;

@Component
@Transactional
public class DatabaseTestUtils {

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    public TextContentImpl saveTextContent(String title, String body, Long moduleId) {
        TextContentImpl content = TestContentDataBuilder.textContent()
            .withTitle(title)
            .withBody(body)
            .withModuleId(moduleId)
            .buildEntity();
        return contentRepository.save(content);
    }

    public TextContentImpl saveTextContent(TextContentImpl content) {
        return contentRepository.save(content);
    }

    public ModuleEntityImpl saveModule(String title, String body, Long courseId) {
        ModuleEntityImpl module = TestContentDataBuilder.module()
            .withTitle(title)
            .withBody(body)
            .withCourseId(courseId)
            .buildEntity();
        return moduleRepository.save(module);
    }

    public ModuleEntityImpl saveModule(ModuleEntityImpl module) {
        return moduleRepository.save(module);
    }

    public TextContentImpl findContentById(Long id) {
        return (TextContentImpl) contentRepository.findById(id).orElse(null);
    }

    public ModuleEntityImpl findModuleById(Long id) {
        return (ModuleEntityImpl) moduleRepository.findById(id).orElse(null);
    }

    public boolean contentExists(Long id) {
        return contentRepository.existsById(id);
    }

    public boolean moduleExists(Long id) {
        return moduleRepository.existsById(id);
    }

    public long countContent() {
        return contentRepository.count();
    }

    public long countModules() {
        return moduleRepository.count();
    }

    public void deleteContent(Long id) {
        contentRepository.deleteById(id);
    }

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }

    public void deleteAllContent() {
        contentRepository.deleteAll();
    }

    public void deleteAllModules() {
        moduleRepository.deleteAll();
    }

    public MultipleChoiceQuestionContentImpl saveMultipleChoiceContent(String title, String body, List<String> options, String correctAnswer, Long moduleId) {
        MultipleChoiceQuestionContentImpl content = TestContentDataBuilder.multipleChoiceContent()
            .withTitle(title)
            .withBody(body)
            .withOptions(options)
            .withCorrectAnswer(correctAnswer)
            .withModuleId(moduleId)
            .buildEntity();
        return contentRepository.save(content);
    }

    public MultipleChoiceQuestionContentImpl saveMultipleChoiceContent(MultipleChoiceQuestionContentImpl content) {
        return contentRepository.save(content);
    }

    public MultipleChoiceQuestionContentImpl findMultipleChoiceById(Long id) {
        return (MultipleChoiceQuestionContentImpl) contentRepository.findById(id).orElse(null);
    }

    public TextContentImpl createAndSaveTestContentWithModule() {
        // Create a module first
        ModuleEntityImpl module = saveModule("Test Module", "Test module description", 1L);
        
        // Create content linked to that module
        return saveTextContent("Test Content", "Test content body", module.getId());
    }

    public MultipleChoiceQuestionContentImpl createAndSaveTestMCContentWithModule() {
        // Create a module first
        ModuleEntityImpl module = saveModule("Test MC Module", "Test module for MC questions", 1L);
        
        // Create MC content linked to that module
        return saveMultipleChoiceContent(
            "Test MC Question", 
            "What is the correct test answer?", 
            List.of("A", "B", "C", "D"), 
            "B", 
            module.getId()
        );
    }

    public TestDataSet createBasicTestDataSet() {
        ModuleEntityImpl module = saveModule("Integration Test Module", "Module for integration testing", 1L);
        TextContentImpl content = saveTextContent("Integration Test Content", "Content for integration testing", module.getId());
        
        return new TestDataSet(module, content);
    }

    public MCTestDataSet createBasicMCTestDataSet() {
        ModuleEntityImpl module = saveModule("MC Integration Test Module", "Module for MC integration testing", 1L);
        MultipleChoiceQuestionContentImpl mcContent = saveMultipleChoiceContent(
            "Integration Test MC Question", 
            "What is the correct answer for integration testing?", 
            List.of("Option A", "Option B", "Option C", "Option D"), 
            "Option B", 
            module.getId()
        );
        
        return new MCTestDataSet(module, mcContent);
    }

    public static class TestDataSet {
        private final ModuleEntityImpl module;
        private final TextContentImpl content;

        public TestDataSet(ModuleEntityImpl module, TextContentImpl content) {
            this.module = module;
            this.content = content;
        }

        public ModuleEntityImpl getModule() {
            return module;
        }

        public TextContentImpl getContent() {
            return content;
        }

        public Long getModuleId() {
            return module.getId();
        }

        public Long getContentId() {
            return content.getId();
        }
    }

    public static class MCTestDataSet {
        private final ModuleEntityImpl module;
        private final MultipleChoiceQuestionContentImpl mcContent;

        public MCTestDataSet(ModuleEntityImpl module, MultipleChoiceQuestionContentImpl mcContent) {
            this.module = module;
            this.mcContent = mcContent;
        }

        public ModuleEntityImpl getModule() {
            return module;
        }

        public MultipleChoiceQuestionContentImpl getMCContent() {
            return mcContent;
        }

        public Long getModuleId() {
            return module.getId();
        }

        public Long getMCContentId() {
            return mcContent.getId();
        }

        public List<String> getOptions() {
            return mcContent.getOptions();
        }

        public String getCorrectAnswer() {
            return mcContent.getCorrectAnswer();
        }
    }
}