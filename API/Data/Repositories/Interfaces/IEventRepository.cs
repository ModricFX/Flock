using flock.Models;

namespace flock.Data.Repositories.Interfaces;

public interface IEventRepository
{
    Task<Event> GetEventById(int id);
    Task<List<Event>?> GetAllEvents();
    Task<List<Event>?> GetAllMyEvents(int user_id);
    Task<List<Invitation>?> GetInvitations(int event_id);
    Task<List<Chose>?> GetVotes(int event_id);
    Task<List<DateOption>?> GetDateOptions(int event_id);
    Task<List<UserAttendance>?> GetAttendance(int event_id);
    Task<bool> DeleteVote(Chose chose);
    Task<Chose> CastVote(Chose chose);
    Task<User> GetUserById(int id);
    Task<int> CreateEvent(Event user);
    Task<DateOption> CreateDateOption(DateOption opt);
    Task<bool> UpdateEvent(Event ev);
    Task<DateOption> UpdateDateOption(DateOption option);
    Task<bool> AddTag(int event_id, int tag_id);
    Task<Invitation> SendInvitation(Invitation invitation);
    Task<bool> DeleteInvitation(int event_id, int user_id);
    Task<bool> DeleteEvent(int id);
    Task<bool> DeleteDateOption(int id);
    Task<bool> UpdateUserAttendace(UserAttendance userAttendance);
    Task<List<Event>> GetEventsWithEndedVotingStage();
    Task<DateOption> GetBestDateOption(int eventId);
    Task<List<User>> GetParticipants(int eventId);
    Task<List<User>> GetParticipantsAndOwner(int eventId);
    
}