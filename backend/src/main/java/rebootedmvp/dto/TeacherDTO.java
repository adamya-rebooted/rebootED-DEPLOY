package rebootedmvp.dto;

import rebootedmvp.User;
import rebootedmvp.domain.impl.TeacherImpl;

public class TeacherDTO extends UserProfileDTO {

    // Default constructor (needed for frameworks like Jackson)
    public TeacherDTO() {

    }

    // Constructor with all fields
    public TeacherDTO(String supabaseUserId, String username, String email, String fullName) {
        super(supabaseUserId, username, User.UserType.LDUser, email, fullName);
    }

    public TeacherDTO(TeacherImpl teacher) {
        super(teacher.getSupabaseUserId(), teacher.getUsername(), User.UserType.LDUser, teacher.getEmail(),
                teacher.getFullName());
    }

}
