package rebootedmvp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import rebootedmvp.domain.impl.UserProgress;
import rebootedmvp.domain.impl.UserProgressId;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, UserProgressId> {
    // You can also define custom queries here if needed, e.g.:
    // Optional<UserProgress> findByIdSupabaseUserIdAndIdCourseId(String
    // supabaseUserId, Long courseId);
    Optional<UserProgress> findByIdCourseIdAndIdSupabaseUserId(Long courseId, String supabaseUserId);

}
