package rebootedmvp.domain.impl;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;

import jakarta.persistence.Table;
import rebootedmvp.Course;
import rebootedmvp.CourseDoesNotExistException;
import rebootedmvp.InaccessibleCourseException;
import rebootedmvp.User;
import rebootedmvp.dto.NewAdminDTO;

@Entity
@Table(name = "admin")
public class AdminImpl extends UserProfileImpl {

    public AdminImpl() {
        this.userType = UserType.Admin;
    }

    public AdminImpl(String supabaseUserId, NewAdminDTO newUserDTO) {
        super(newUserDTO.getUsername(), supabaseUserId, User.UserType.Admin, newUserDTO.getEmail());
    }

    public AdminImpl(String username, String supabaseUserId, String email, String fullName) {
        super(username, supabaseUserId, User.UserType.Admin, email, fullName);
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public List<String> getCourseNames() {
        throw new UnsupportedOperationException("You cannot call getCourseNames for an Administrator");
    }

    @Override
    public boolean hasAccess(String courseName) {
        return true;
    }

    @Override
    public Course getCourse(String courseName) throws InaccessibleCourseException, CourseDoesNotExistException {
        throw new UnsupportedOperationException("You cannot call getCourse for an Administrator");

    }
}
