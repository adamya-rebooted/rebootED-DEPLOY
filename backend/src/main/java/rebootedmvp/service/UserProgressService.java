package rebootedmvp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rebootedmvp.domain.impl.BooleanEntry;
import rebootedmvp.domain.impl.PairImpl;
import rebootedmvp.domain.impl.UserProgress;
import rebootedmvp.domain.impl.UserProgressId;
import rebootedmvp.repository.UserProgressRepository;

@Service
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;

    public UserProgressService(UserProgressRepository userProgressRepository) {
        this.userProgressRepository = userProgressRepository;
    }

    public Optional<UserProgress> getUserProgress(String supabaseUserId, Long courseId) {
        UserProgressId id = new UserProgressId(supabaseUserId, courseId);
        return userProgressRepository.findById(id);
    }

    @Transactional
    public UserProgress saveProgress(UserProgress progress) {
        for (PairImpl pair : progress.getProgress()) {
            pair.setUserCourseProgress(progress);
            for (BooleanEntry entry : pair.getRight()) {
                entry.setPair(pair);
            }
        }
        return userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgress updateTotalProgress(String supabaseUserId, Long courseId, double newProgress) {
        UserProgress progress = getUserProgress(supabaseUserId, courseId)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));
        progress.setTotalProgress(newProgress);
        return userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgress addPair(String supabaseUserId, Long courseId, Double left, List<Boolean> rightValues) {
        UserProgress progress = getUserProgress(supabaseUserId, courseId)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));

        PairImpl pair = new PairImpl();
        pair.setLeft(left);
        pair.setUserCourseProgress(progress);

        List<BooleanEntry> entries = new ArrayList<>();
        for (Boolean val : rightValues) {
            BooleanEntry entry = new BooleanEntry(val);
            entry.setPair(pair);
            entries.add(entry);
        }

        pair.setRight(entries);
        progress.getProgress().add(pair);
        return userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgress createInitialProgress(String supabaseUserId, Long courseId) {
        UserProgressId id = new UserProgressId(supabaseUserId, courseId);
        UserProgress progress = new UserProgress(id, 0.0, new ArrayList<>());
        return userProgressRepository.save(progress);
    }

    @Transactional
    public Optional<UserProgress> getProgressByCourseAndUser(Long courseId, String supabaseUserId) {
        return userProgressRepository.findById(new UserProgressId(supabaseUserId, courseId));
    }

    @Transactional
    public List<UserProgress> getAllProgress() {
        return userProgressRepository.findAll();
    }
}
