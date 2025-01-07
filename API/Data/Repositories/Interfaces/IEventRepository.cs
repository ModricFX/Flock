using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IEventRepository
{
    Task<Event> GetEventById(int id);
    Task<List<Event>> GetAllEvents();
    Task<User> GetUserById(int id);
    Task<int> CreateEvent(Event user);
    Task<int> CreateDateOption(DateOption opt);
    void UpdateEvent(Event ev);
    void UpdateDateOption(DateOption option);
    void AddTag(int event_id, int tag_id);
    void DeleteEvent(int id);
    void DeleteDateOption(int id);
}