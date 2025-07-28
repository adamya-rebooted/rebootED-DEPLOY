package rebootedmvp.dto;

import rebootedmvp.User;

public abstract class UserProfileDTO {
    private String supabaseUserId;
    private String username;
    private String email;
    private User.UserType userType;
    private String fullName;

    public UserProfileDTO() {
        // Default constructor needed for frameworks like Jackson
    }

    public UserProfileDTO(String id, String username, User.UserType userType, String email, String fullName) {
        this.fullName = fullName;
        this.supabaseUserId = id;
        this.username = username;
        this.userType = userType;
        this.email = email;
    }

    public String getId() {
        return supabaseUserId;
    }

    public void setSupabaseUserId(String id) {
        this.supabaseUserId = id;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}