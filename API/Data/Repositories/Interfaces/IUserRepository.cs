using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User> GetUserByEmailOrUsernameAsync(string text);
    Task<int> CreateUserAsync(User user);
    // Include other methods related to User if needed
}