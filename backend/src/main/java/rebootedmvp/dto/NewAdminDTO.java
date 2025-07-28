package rebootedmvp.dto;

import rebootedmvp.User;

public class NewAdminDTO extends NewUserDTO {

    // Default constructor (needed for frameworks like Jackson)
    public NewAdminDTO() {
        super();
    }

    // Constructor with all fields
    public NewAdminDTO(String username, String email, String supabaseUserId) {
        super(username, User.UserType.Admin, email, supabaseUserId);
    }

}
