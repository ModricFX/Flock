using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IEventRepository
{
    Task<Event> GetEventById(string id);
    Task<User> GetUserById(string id);
    Task<int> CreateEvent(Event user);
    Task<int> CreateDateOption(DateOption opt);
    Task<int> UpdateEvent(Event user);
}