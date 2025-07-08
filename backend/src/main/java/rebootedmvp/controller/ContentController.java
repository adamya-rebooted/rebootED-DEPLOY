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
import rebootedmvp.service.ContentService;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    @Autowired
    private ContentService contentService;

    @GetMapping
    public ResponseEntity<List<ContentDTO>> getAllContent() {
        List<ContentDTO> content = contentService.findAll();
        return ResponseEntity.ok(content);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentDTO> getContentById(@PathVariable Long id) {
        ContentDTO content = contentService.findById(id);
        if (content == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(content);
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<ContentDTO>> getContentByModuleId(@PathVariable Long moduleId) {
        List<ContentDTO> content = contentService.findByModuleId(moduleId);
        return ResponseEntity.ok(content);
    }

    @PostMapping
    public ResponseEntity<ContentDTO> createContent(@RequestBody NewContentDTO newContentDTO) {
        try {
            ContentDTO createdContent = contentService.create(newContentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdContent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentDTO> updateContent(@PathVariable Long id,
            @RequestBody NewContentDTO updateContentDTO) {
        try {
            ContentDTO updatedContent = contentService.update(id, updateContentDTO);
            if (updatedContent == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedContent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        boolean deleted = contentService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ContentDTO> markContentComplete(@PathVariable Long id) {
        ContentDTO content = contentService.markComplete(id);
        if (content == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(content);
    }

    // @PostMapping("/{id}/answer")
    // public ResponseEntity<ContentDTO> submitAnswer(@PathVariable Long id,
    // @RequestBody Map<String, String> request) {
    // String answer = request.get("answer");
    // if (answer == null) {
    // return ResponseEntity.badRequest().build();
    // }

    // // ContentDTO content = contentService.submitAnswer(id, answer);
    // if (content == null) {
    // return ResponseEntity.notFound().build();
    // }
    // return ResponseEntity.ok(content);
    // }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }
}
