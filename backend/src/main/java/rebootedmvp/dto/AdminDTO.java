package rebootedmvp.dto;

import rebootedmvp.User;
import rebootedmvp.domain.impl.AdminImpl;
import rebootedmvp.domain.impl.TeacherImpl;

public class AdminDTO extends UserProfileDTO {

    // Default constructor (needed for frameworks like Jackson)
    public AdminDTO() {

    }

    // Constructor with all fields
    public AdminDTO(String supabaseUserId, String username, String email, String fullName) {
        super(supabaseUserId, username, User.UserType.Admin, email, fullName);
    }

    public AdminDTO(AdminImpl admin) {
        super(admin.getSupabaseUserId(), admin.getUsername(), User.UserType.Admin, admin.getEmail(),
                admin.getFullName());
    }

}
