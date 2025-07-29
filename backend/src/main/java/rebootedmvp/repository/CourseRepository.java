package rebootedmvp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import rebootedmvp.domain.impl.CourseEntityImpl;

/**
 * Repository interface for Course entities.
 * Provides database access methods for Course operations.
 */
@Repository
public interface CourseRepository extends JpaRepository<CourseEntityImpl, Long> {

        /**
         * Find courses by title (case-insensitive)
         */
        List<CourseEntityImpl> findByTitleContainingIgnoreCase(String title);

        /**
         * Find courses where the user is a teacher
         */
        @Query("SELECT c FROM CourseEntityImpl c JOIN c.teachers t WHERE t.id = :userId")
        @EntityGraph(attributePaths = { "teachers" })
        List<CourseEntityImpl> findCoursesByTeacherId(@Param("userId") String userId);

        /**
         * Find courses where the user is a student
         */
        @Query("SELECT c FROM CourseEntityImpl c JOIN c.students s WHERE s.id = :userId")
        @EntityGraph(attributePaths = { "students" })
        List<CourseEntityImpl> findCoursesByStudentId(@Param("userId") String userId);

        /**
         * Find courses where the user is either a teacher or student
         */
        @Query("SELECT DISTINCT c FROM CourseEntityImpl c " +
                        "LEFT JOIN c.teachers t " +
                        "LEFT JOIN c.students s " +
                        "WHERE t.supabaseUserId = :userId OR s.supabaseUserId = :userId")
        List<CourseEntityImpl> findCoursesByUserId(@Param("userId") String userId);

        /**
         * Check if a user is a teacher of a specific course
         */
        @Query("SELECT COUNT(c) > 0 FROM CourseEntityImpl c JOIN c.teachers t WHERE c.id = :courseId AND t.id = :userId")
        boolean isUserTeacherOfCourse(@Param("courseId") Long courseId, @Param("userId") String userId);

        /**
         * Check if a user is a student of a specific course
         */
        @Query("SELECT COUNT(c) > 0 FROM CourseEntityImpl c JOIN c.students s WHERE c.id = :courseId AND s.id = :userId")
        boolean isUserStudentOfCourse(@Param("courseId") Long courseId, @Param("userId") String userId);

        /**
         * Find courses created within a date range
         */
        @Query("SELECT c FROM CourseEntityImpl c WHERE c.createdAt BETWEEN :startDate AND :endDate")
        List<CourseEntityImpl> findCoursesCreatedBetween(@Param("startDate") java.time.LocalDateTime startDate,
                        @Param("endDate") java.time.LocalDateTime endDate);

        /**
         * Count total number of students across all courses
         */
        @Query("SELECT COUNT(DISTINCT s) FROM CourseEntityImpl c JOIN c.students s")
        Long countTotalStudents();

        /**
         * Count total number of teachers across all courses
         */
        @Query("SELECT COUNT(DISTINCT t) FROM CourseEntityImpl c JOIN c.teachers t")
        Long countTotalTeachers();

        @NonNull
        @EntityGraph(attributePaths = { "teachers", "students" })
        List<CourseEntityImpl> findAll();
}