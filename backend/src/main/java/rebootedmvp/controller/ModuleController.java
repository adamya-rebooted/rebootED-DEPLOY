package rebootedmvp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.ContentDTO;
import rebootedmvp.dto.NewContentDTO;
import rebootedmvp.dto.NewQuestionContentDTO;
import rebootedmvp.dto.NewTextContentDTO;
import rebootedmvp.service.ModuleService;

@RestController
@RequestMapping("/api/modules/{moduleId}")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<ContentDTO>> getAllContents(@PathVariable Long moduleId) {
        return ResponseEntity.ok(moduleService.findAll());
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<ContentDTO> getContentById(@PathVariable Long moduleId, @PathVariable Long contentId) {
        ContentDTO con = moduleService.getById(moduleId, contentId);
        if (con == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(con);
    }

    @PostMapping("/addQuestion")
    public ResponseEntity<Long> createQuestionContent(@PathVariable Long moduleId,
            @RequestBody NewQuestionContentDTO newContentDTO) {
        try {
            Long contentId = moduleService.addNew(moduleId, newContentDTO);
            return ResponseEntity.ok(contentId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/addText")
    public ResponseEntity<Long> createTextContent(@PathVariable Long moduleId,
            @RequestBody NewTextContentDTO newContentDTO) {
        try {
            Long contentId = moduleService.addNew(moduleId, newContentDTO);
            return ResponseEntity.ok(contentId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{contentId}")
    public void updateContent(@PathVariable Long moduleId, @PathVariable Long ContentId,
            @RequestBody NewContentDTO updateContentDTO) {
        moduleService.update(moduleId, ContentId, updateContentDTO);
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long moduleId, @PathVariable Long contentId) {
        boolean deleted = moduleService.delete(moduleId, contentId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }

}
