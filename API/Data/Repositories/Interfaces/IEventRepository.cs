using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IEventRepository
{
    Task<Event> GetEventById(string id);
    Task<List<Event>> GetAllEvents();
    Task<User> GetUserById(string id);
    Task<int> CreateEvent(Event user);
    Task<int> CreateDateOption(DateOption opt);
    void UpdateEvent(Event ev);
    void UpdateDateOption(DateOption option);
    void AddTag(string event_id, string tag_id);
    void DeleteEvent(string id);
    void DeleteDateOption(string id);
}