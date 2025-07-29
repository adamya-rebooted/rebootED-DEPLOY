package rebootedmvp;

import org.springframework.stereotype.Component;

import rebootedmvp.domain.impl.AdminImpl;
import rebootedmvp.domain.impl.StudentImpl;
import rebootedmvp.domain.impl.TeacherImpl;
import rebootedmvp.domain.impl.UserProfileImpl;

@Component
public class UserMapper {
    public static User toDomain(UserProfileImpl entity) {
        return entity;
    }

    public static UserProfileImpl toEntity(User domain) {
        return switch (domain.getUserType()) {
            case Student -> new StudentImpl(domain.getUsername(), domain.getSupabaseUserId(),
                    domain.getEmail(), domain.getFullName());
            case Teacher -> new TeacherImpl(domain.getSupabaseUserId(), domain.getUsername(), domain.getEmail(),
                    domain.getFullName());
            case Admin -> new AdminImpl(domain.getSupabaseUserId(), domain.getUsername(), domain.getEmail(),
                    domain.getFullName());
            default -> throw new IllegalArgumentException("Unsupported user type: " + domain.getUserType());
        };

    }
}