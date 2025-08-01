package rebootedmvp.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rebootedmvp.Course;
import rebootedmvp.CourseDoesNotExistException;
import rebootedmvp.CourseMapper;
import rebootedmvp.domain.impl.BooleanEntry;
import rebootedmvp.domain.impl.PairImpl;
import rebootedmvp.domain.impl.ModuleEntityImpl;
import rebootedmvp.domain.impl.UserProgress;
import rebootedmvp.domain.impl.UserProgressId;
import rebootedmvp.dto.UserProgressDTO;
import rebootedmvp.exception.UserNotInCourseException;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.ModuleRepository;
import rebootedmvp.repository.UserProgressRepository;

@Service
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;

    public UserProgressService(UserProgressRepository userProgressRepository, CourseRepository courseRepository,
            ModuleRepository moduleRepository) {
        this.userProgressRepository = userProgressRepository;
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
    }

    public UserProgressDTO getUserProgress(String supabaseUserId, Long courseId) {
        UserProgress userProgress = userProgressRepository.findByIdCourseIdAndIdSupabaseUserId(courseId, supabaseUserId)
                .orElseThrow(() -> new UserNotInCourseException(supabaseUserId, courseId));

        return new UserProgressDTO(userProgress);
    }

    @Transactional
    public void updateTotalProgress(String supabaseUserId, Long courseId, double newProgress) {
        UserProgress progress = userProgressRepository.findByIdCourseIdAndIdSupabaseUserId(courseId, supabaseUserId)
                .orElseThrow(() -> new UserNotInCourseException(supabaseUserId, courseId));

        progress.setTotalProgress(newProgress);
        userProgressRepository.save(progress);
    }

    @Transactional
    public void createUserProgress(String supabaseUserId, Long courseId) {
        UserProgressId id = new UserProgressId(supabaseUserId, courseId);
        List<PairImpl> right = new ArrayList<>();
        List<ModuleEntityImpl> modules = moduleRepository.findByCourseId(courseId);
        for (ModuleEntityImpl module : modules) {
            List<BooleanEntry> list = Collections.nCopies(module.getNumContents(), new BooleanEntry(false));
            right.add(new PairImpl(0., list));
        }

        UserProgress progress = new UserProgress(id, 0.0, right);
        userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgressDTO getProgressByCourseAndUser(Long courseId, String supabaseUserId) {
        return new UserProgressDTO(userProgressRepository.findById(new UserProgressId(supabaseUserId, courseId))
                .orElseThrow(() -> new UserNotInCourseException(supabaseUserId, courseId)));
    }

    @Transactional
    public List<UserProgressDTO> getAllProgress() {
        return userProgressRepository.findAll().stream().map(UserProgressDTO::new).toList();
    }

    @Transactional
    public void updateContentCompleted(Long courseId, String supabaseUserId, int moduleNum, int contentNum,
            boolean newStatus) {
        UserProgress toEdit = userProgressRepository.findByIdCourseIdAndIdSupabaseUserId(courseId, supabaseUserId)
                .orElseThrow(
                        () -> new UserNotInCourseException(supabaseUserId, supabaseUserId));
        toEdit.getProgress().get(moduleNum).setBool(contentNum, newStatus);
        userProgressRepository.save(toEdit);
    }
}
