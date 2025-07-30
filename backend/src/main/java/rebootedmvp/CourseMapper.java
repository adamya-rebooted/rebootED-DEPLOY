package rebootedmvp;

import org.springframework.stereotype.Component;

import rebootedmvp.domain.impl.CourseEntityImpl;

@Component
public class CourseMapper {
    public static Course toDomain(CourseEntityImpl entity) {
        return entity;
    }

    public static CourseEntityImpl toEntity(Course domain) {
        // If already the correct type, just cast and return
        // If more course type are
        if (domain instanceof CourseEntityImpl courseEntityImpl) {
            return courseEntityImpl;
        }

        // Otherwise, reconstruct it manually
        CourseEntityImpl entity = new CourseEntityImpl(domain.getTitle(), domain.getBody());
        entity.setId(domain.getId());
        entity.setTitle(domain.getTitle());
        entity.setBody(domain.getBody());
        entity.setTeachers(domain.getTeachers());
        entity.setStudents(domain.getStudents());

        return entity;
    }
}