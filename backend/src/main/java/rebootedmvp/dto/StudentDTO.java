package rebootedmvp.dto;

import rebootedmvp.User;
import rebootedmvp.domain.impl.StudentImpl;

public class StudentDTO extends UserProfileDTO {

    // Default constructor (needed for frameworks like Jackson)
    public StudentDTO() {

    }

    // Constructor with all fields
    public StudentDTO(String supabaseUserId, String username, String email, String fullName) {
        super(supabaseUserId, username, User.UserType.EmployeeUser, email, fullName);
    }

    public StudentDTO(StudentImpl student) {
        super(student.getSupabaseUserId(), student.getUsername(), User.UserType.EmployeeUser, student.getEmail(),
                student.getFullName());
    }

}
