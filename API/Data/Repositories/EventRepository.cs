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

    public async Task<Event> GetEventById(int id)
    {
        var query = @"
        SELECT *
        FROM `event`
        WHERE `id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            return await connection.QueryFirstOrDefaultAsync<Event>(query, new { Id = id });
        }
    }

    public async Task<List<Event>?> GetAllEvents()
    {
        var query = @"
        SELECT *
        FROM `event`
        WHERE `sysrowstate` = 1";

        using (var connection = _context.CreateConnection())
        {
            var events = await connection.QueryAsync<Event>(query);
            return events.ToList();
        }
    }

    public async Task<List<Event>?> GetAllMyEvents(int user_id)
    {
        var query = @"
        SELECT e.*
        FROM event e
        LEFT JOIN invitation i ON e.id_event = i.id_event
        WHERE (e.id_user = @Id_user OR i.id_user = @Id_user) AND e.sysrowstate = 1
        GROUP BY e.id_event;";

        using (var connection = _context.CreateConnection())
        {
            var events = await connection.QueryAsync<Event>(query, new {Id_user = user_id});
            return events.ToList();
        }
    }

    public async Task<List<Invitation>?> GetInvitations(int event_id)
    {
        var query = @"
        SELECT i.*, u.* 
        FROM `invitation` i
        JOIN `user` u ON i.`Id_user` = u.`Id_user`
        WHERE `Id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            var result = await connection.QueryAsync<Invitation, User, Invitation>(
                query,
                (invitation, user) => 
                {
                    invitation.User = user;
                    return invitation;
                },
                new { Id = event_id },
                splitOn: "Id_user");

            return result.ToList();
        }
    }

    public async Task<List<Chose>?> GetVotes(int event_id)
    {
        var query = @"
        SELECT c.id_user, c.id_date_option
        FROM chose c INNER JOIN date_option d on c.id_date_option = d.id_date_option INNER JOIN event e ON d.id_event = e.id_event
        WHERE d.id_event = @Event_id";

        using (var connection = _context.CreateConnection())
        {
            var result = await connection.QueryAsync<Chose>(query, new { Event_id = event_id });

            return result.ToList();
        }
    }

    public async Task<List<DateOption>?> GetDateOptions(int event_id)
    {
        var query = @"
        SELECT *
        FROM date_option
        WHERE id_event = @Event_id";

        using (var connection = _context.CreateConnection())
        {
            var result = await connection.QueryAsync<DateOption>(query, new { Event_id = event_id });

            return result.ToList();
        }
    }

    public async Task<bool> DeleteVote(Chose chose)
    {
        var query = "DELETE FROM chose WHERE id_user = @Id_user AND id_date_option = @Id_date_option;";
        
        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, chose);
        }
        
        return true;
    }

    public async Task<Chose> CastVote(Chose chose)
    {
        var query = "INSERT INTO chose (id_user, id_date_option) VALUES (@Id_user, @Id_date_option);";
        
        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, chose);
        }

        return chose;
    }

    public async Task<User> GetUserById(int id)
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
                Id_user = @event.Id_user,
                @event.SysRowState,
            };

            var ret_id = await connection.QuerySingleAsync<int>(query, parameters);
            return ret_id;
        }
    }

    public async Task<DateOption> CreateDateOption(DateOption option)
    {
        var query = @"
            INSERT INTO `date_option` (`id_event`, `date_start`, `date_end`)
            VALUES (@Id_event, @Date_start, @Date_end);
            SELECT * FROM `date_option` WHERE `id_date_option` = LAST_INSERT_ID();
        ";
        
        using (var connection = _context.CreateConnection())
        {
            return await connection.QuerySingleAsync<DateOption>(query, option);
        }
    }


    public async Task<bool> UpdateEvent(Event @event)
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
        WHERE `id_event` = @Id_event";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, @event);

            return true;
        }
    }


    public async Task<DateOption> UpdateDateOption(DateOption option)
    {
        var query = @"
            UPDATE `date_option`
            SET 
                `date_start` = @Date_start, 
                `date_end` = @Date_end 
            WHERE `id_date_option` = @Id_date_option;
        ";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, option);
        }
        
        return option;
    }

    public async Task<bool> AddTag(int event_id, int tag_id)
    {
        var query = "INSERT INTO `categorizes_as` (`id_event`, `id_tag`) VALUES(@Id_event, @Id_tag);";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new {Id_event = event_id, Id_tag = tag_id});
        }

        return true;
    }
    
    public async Task<Invitation> SendInvitation(Invitation invitation)
    {
        var query = "INSERT INTO `invitation` (`id_event`, `id_user`, `status`, `date_invited`) VALUES(@Id_event, @Id_user, @Status, @Date_invited);";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, invitation);
        }

        return invitation;
    }
    
    public async Task<bool> DeleteInvitation(int event_id, int user_id)
    {
        var query = "DELETE FROM `invitation` WHERE `id_event` = @Id_event AND `id_user` = @Id_user;";

        using (var connection = _context.CreateConnection())
        {
            var parameters = new
            {
                Id_event = event_id,
                Id_user = user_id,
            };
            
            await connection.ExecuteAsync(query, parameters);
        }

        return true;
    }

    public async Task<bool> DeleteEvent(int id)
    {
        var query = "DELETE FROM `event` WHERE `id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new { Id = id });
        }

        return true;
    }
    
    public async Task<bool> DeleteDateOption(int id)
    {
        var query = "DELETE FROM `date_option` WHERE `id_date_option` = @Id";

        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new { Id = id });
        }
        
        return true;
    }

    /// <summary>
    /// Get all events that have ended the voting stage and have not yet selected a date
    /// </summary>
    /// <returns></returns>
    public async Task<List<Event>> GetEventsWithEndedVotingStage()
    {
        var query = @"
        SELECT DISTINCT e.*
        FROM `event` e
        JOIN `date_option` d ON e.`id_event` = d.`id_event`
        WHERE e.`end_voting_date` < NOW() AND e.`chosen_date_start` IS NULL";
        
        using var connection = _context.CreateConnection();
        var result = await connection.QueryAsync<Event>(query);

        return result.ToList();
    }
    /// <summary>
    /// Returns the date option with the most votes for a given event
    /// </summary>
    /// <param name="eventId"></param>
    /// <returns></returns>
    public async Task<DateOption> GetBestDateOption(int eventId)
    {
        var query = @"
        SELECT d.*
        FROM `date_option` d
        JOIN `chose` c ON d.`id_date_option` = c.`id_date_option`
        WHERE d.`id_event` = @Id_event
        GROUP BY d.`id_date_option`
        ORDER BY COUNT(c.`id_user`) DESC
        LIMIT 1;
        ";

        using var connection = _context.CreateConnection();
        var result = await connection.QueryFirstOrDefaultAsync<DateOption>(query, new { Id_event = eventId });

        return result;
    }
    
    public async Task<List<User>> GetParticipants(int eventId)
    {
        var query = @"
        SELECT u.*
        FROM `user` u
        JOIN `invitation` i ON u.`id_user` = i.`id_user`
        WHERE i.`id_event` = @Id_event;
        ";

        using var connection = _context.CreateConnection();
        var result = await connection.QueryAsync<User>(query, new { Id_event = eventId });

        return result.ToList();
    }
    
    public async Task<List<User>> GetParticipantsAndOwner(int eventId)
    {
        var query = @"
    SELECT u.*
    FROM `user` u
    JOIN `invitation` i ON u.`id_user` = i.`id_user`
    WHERE i.`id_event` = @Id_event
    UNION
    SELECT u.*
    FROM `user` u
    JOIN `event` e ON u.`id_user` = e.`id_user`
    WHERE e.`id_event` = @Id_event;
    ";

        using var connection = _context.CreateConnection();
        var result = await connection.QueryAsync<User>(query, new { Id_event = eventId });

        return result.ToList();
    }
}

