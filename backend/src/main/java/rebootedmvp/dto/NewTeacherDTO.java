package rebootedmvp.dto;

import rebootedmvp.User;

public class NewTeacherDTO extends NewUserDTO {

    // Default constructor (needed for frameworks like Jackson)
    public NewTeacherDTO() {
        super();
    }

    // Constructor with all fields
    public NewTeacherDTO(String username, String email, String supabaseUserId) {
        super(username, User.UserType.Teacher, email, supabaseUserId);
    }

}
