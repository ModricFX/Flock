using flock.Data.DbContext;
using flock.Data.Repositories.Interfaces;
using flock.Models;
using Dapper;

namespace flock.Data.Repositories;
public class EventRepository : IEventRepository
{
    private readonly DapperContext _context;

    public EventRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<Event> GetEventById(string id)
    {
        var query = @"
        SELECT e.*, d.*
        FROM `event` e
        LEFT JOIN `date_option` d ON e.id_event = d.id_event
        WHERE e.`id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            var eventDictionary = new Dictionary<int, Event>();

            var eventWithDateOptions = await connection.QueryAsync<Event, DateOption, Event>(
                query,
                (eventObj, dateOption) =>
                {
                    if (!eventDictionary.TryGetValue(eventObj.Id_event, out var eventEntry))
                    {
                        eventEntry = eventObj;
                        eventEntry.Date_options = new List<DateOption>();
                        eventDictionary.Add(eventEntry.Id_event, eventEntry);
                    }

                    if (dateOption != null)
                    {
                        eventEntry.Date_options.Add(dateOption);
                    }

                    return eventEntry;
                },
                new { Id = id },
                splitOn: "Id_date_option"
            );

            return eventWithDateOptions.FirstOrDefault();
        }
    }

    public async Task<List<Event>> GetAllEvents()
    {
        var query = @"
        SELECT e.*, d.*
        FROM `event` e
        LEFT JOIN `date_option` d ON e.id_event = d.id_event
        WHERE e.`sysrowstate` = 1";

        using (var connection = _context.CreateConnection())
        {
            var eventDictionary = new Dictionary<int, Event>();

            var events = await connection.QueryAsync<Event, DateOption, Event>(
                query,
                (eventObj, dateOption) =>
                {
                    if (!eventDictionary.TryGetValue(eventObj.Id_event, out var eventEntry))
                    {
                        eventEntry = eventObj;
                        eventEntry.Date_options = new List<DateOption>();
                        eventDictionary.Add(eventEntry.Id_event, eventEntry);
                    }

                    if (dateOption != null)
                    {
                        eventEntry.Date_options.Add(dateOption);
                    }

                    return eventEntry;
                },
                splitOn: "Id_date_option"
            );

            return events.Distinct().ToList();
        }
    }


    public async Task<User> GetUserById(string id)
    {
        var query = "SELECT * FROM `user` WHERE `id_user` = @Id";

        using (var connection = _context.CreateConnection())
        {
            return await connection.QueryFirstOrDefaultAsync<User>(query, new { Id = id });
        }
    }

    public async Task<int> CreateEvent(Event @event)
    {
        var query = @"
            INSERT INTO `event` (`id_event`, `name`, `description`, `location`, `date_created`, `date_updated`, `end_voting_date`, `id_user`, `sysrowstate`)
            VALUES (@Id_event, @Name, @Description, @Location, @Date_created, @Date_updated, @End_voting_date, @Id_user, @SysRowState);
            SELECT LAST_INSERT_ID();
        ";

        using (var connection = _context.CreateConnection())
        {
            var parameters = new
            {
                @event.Id_event,
                @event.Name,
                @event.Description,
                @event.Location,
                @event.Date_created,
                @event.Date_updated,
                @event.End_voting_date,
                Id_user = @event.Owner.Id_user,
                @event.SysRowState,
            };

            var ret_id = await connection.QuerySingleAsync<int>(query, parameters);
            return ret_id;
        }
    }

    public async Task<int> CreateDateOption(DateOption option)
    {
        var query = @"
            INSERT INTO `date_option` (`id_event`, `date_start`, `date_end`)
            VALUES (@Id_event, @DateStart, @DateEnd);
            SELECT LAST_INSERT_ID();
        ";
        
        using (var connection = _context.CreateConnection())
        {
            var ret_id = await connection.QuerySingleAsync<int>(query, option);
            return ret_id;
        }
    }


    public async void UpdateEvent(Event @event)
    {
        var query = @"
            UPDATE `event`
            SET 
                `name` = @Name, 
                `description` = @Description, 
                `location` = @Location, 
                `end_voting_date` = @End_voting_date, 
                `chosen_date_start` = @Chosen_date_start, 
                `chosen_date_end` = @Chosen_date_end, 
                `date_updated` = @Date_updated,
                `sysrowstate` = @SysRowState
            WHERE `id_event` = @Id_event;
        ";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, @event);
        }
    }

    public async void UpdateDateOption(DateOption option)
    {
        var query = @"
            UPDATE `date_option`
            SET 
                `date_start` = @DateStart, 
                `date_end` = @DateEnd 
            WHERE `id_date_option` = @Id_date_option;
        ";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, option);
        }
    }

    public async void AddTag(string event_id, string tag_id)
    {
        var query = "INSERT INTO `categorizes_as` (`id_event`, `id_tag`) VALUES(@Id_event, @Id_tag);";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new {Id_event = event_id, Id_tag = tag_id});
        }
    }

    public async void DeleteEvent(string id)
    {
        var query = "DELETE FROM `event` WHERE `id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new { Id = id });
        }
    }
    
    public async void DeleteDateOption(string id)
    {
        var query = "DELETE FROM `date_option` WHERE `id_date_option` = @Id";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new { Id = id });
        }
    }
    
}

