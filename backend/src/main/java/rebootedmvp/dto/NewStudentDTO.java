package rebootedmvp.dto;

import rebootedmvp.User;

public class NewStudentDTO extends NewUserDTO {
    // Default constructor (needed for frameworks like Jackson)
    public NewStudentDTO() {
        super();
    }

    // Constructor with all fields
    public NewStudentDTO(String username, String email, String supabaseUserId) {
        super(username, User.UserType.EmployeeUser, email, supabaseUserId);
    }

}
