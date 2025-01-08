using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User> GetUserByEmailOrUsernameAsync(string text);
    Task<int> CreateUserAsync(User user);
    
    void UpdateUserRelationship(Friendship friendship);
    
    Task<List<Friendship>> GetAllRelationshipsWithStatus(int user_id, string status);
    
    
    // Include other methods related to User if needed
}