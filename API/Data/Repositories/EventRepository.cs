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
        var query = "SELECT * FROM `event` WHERE `id_event` = @Id";

        using (var connection = _context.CreateConnection())
        {
            return await connection.QueryFirstOrDefaultAsync<Event>(query, new { Id = id });
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


    public async Task<int> UpdateEvent(Event @event)
    {
        var query = @"
            UPDATE `event`
            SET 
                `id_event` = @Id_event, 
                `icon_url` = @Icon_url, 
                `name` = @Name, 
                `description` = @Description, 
                `location` = @Location, 
                `date_created` = @Date_created, 
                `date_updated` = @Date_updated);
            WHERE `id_event` = @Id_event;
        ";

        using (var connection = _context.CreateConnection())
        {
            var id = await connection.ExecuteAsync(query, @event);
            return id;
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
}

