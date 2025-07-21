package rebootedmvp.dto;

import rebootedmvp.User;

public class NewUserDTO {
    private String username;
    private User.UserType userType;
    private String email;
    private String supabaseUserId;

    // Default constructor (needed for frameworks like Jackson)
    public NewUserDTO() {
    }

    // Constructor with all fields
    public NewUserDTO(String username, User.UserType userType, String email, String supabaseUserId) {
        this.username = username;
        this.userType = userType;
        this.email = email;
        this.supabaseUserId = supabaseUserId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public User.UserType getUserType() {
        return userType;
    }

    public void setUserType(User.UserType userType) {
        this.userType = userType;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSupabaseUserId() {
        return supabaseUserId;
    }

    public void setSupabaseUserId(String supabaseUserId) {
        this.supabaseUserId = supabaseUserId;
    }
}