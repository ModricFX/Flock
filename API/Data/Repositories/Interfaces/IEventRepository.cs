using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IEventRepository
{
    Task<Event> GetEventById(string id);
    Task<List<Event>> GetAllEvents();
    Task<User> GetUserById(string id);
    Task<int> CreateEvent(Event user);
    Task<int> CreateDateOption(DateOption opt);
    Task<int> UpdateEvent(Event user);
    void DeleteEvent(string id);
}