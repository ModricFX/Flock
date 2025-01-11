using flock.Controllers.Dtos;
using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface INotificationRepository
{
    
}

public interface IUserNotificationRepository
{
    Task<IEnumerable<UserNotificationJoined>> GetJoinedForUserAsync(int userId);
    Task<UserNotificationJoined> CreateNotificationForUserAsync(CreateNotificationRequestDto newNotification);
}