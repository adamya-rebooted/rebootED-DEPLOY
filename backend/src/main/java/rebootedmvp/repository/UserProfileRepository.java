package rebootedmvp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import rebootedmvp.User;
import rebootedmvp.domain.impl.UserProfileImpl;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfileImpl, String> {

    /**
     * Find user by Supabase user ID
     */
    Optional<UserProfileImpl> findBySupabaseUserId(String supabaseUserId);

    /**
     * Find user by username
     */
    Optional<UserProfileImpl> findByUsername(String username);

    /**
     * Find user by email
     */
    Optional<UserProfileImpl> findByEmail(String email);

    /**
     * Check if user exists by Supabase user ID
     */
    boolean existsBySupabaseUserId(String supabaseUserId);

    /**
     * Check if username is taken
     */
    boolean existsByUsername(String username);

    /**
     * Check if email is taken
     */
    boolean existsByEmail(String email);

    /**
     * Find all users by user type
     */
    List<UserProfileImpl> findByUserType(User.UserType userType);

    /**
     * Find users by username containing (case insensitive search)
     */
    @Query("SELECT u FROM UserProfileImpl u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<UserProfileImpl> findByUsernameContainingIgnoreCase(@Param("username") String username);

    /**
     * Find users by full name containing (case insensitive search)
     */
    @Query("SELECT u FROM UserProfileImpl u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))")
    List<UserProfileImpl> findByFullNameContainingIgnoreCase(@Param("fullName") String fullName);

    /**
     * Find users by multiple usernames
     */
    @Query("SELECT u FROM User u WHERE u.username IN :usernames")
    List<UserProfileImpl> findByUsernameIn(@Param("usernames") List<String> usernames);

    /**
     * Count users by user type
     */
    Long countByUserType(User.UserType userType);
}