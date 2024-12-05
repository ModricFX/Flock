using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User> GetUserByEmailAsync(string email);
    Task<int> CreateUserAsync(User user);
    // Include other methods related to User if needed
}