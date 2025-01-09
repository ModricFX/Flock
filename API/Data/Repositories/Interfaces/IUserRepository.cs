using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserByEmailOrUsernameAsync(string text);
    Task<User?> GetUserById(int id);
    Task<int> CreateUserAsync(User user);
    Task<Friendship?> GetUserRelationships(int user_id, int use_user_id);
    
    void UpdateUserRelationship(Friendship friendship);
    
    Task<List<Friendship>> GetAllRelationshipsWithStatus(int user_id, string status);
    
    
    // Include other methods related to User if needed
}