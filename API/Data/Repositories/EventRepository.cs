using flock.Data.DbContext;
using flock.Data.Repositories.Interfaces;
using Dapper;

namespace flock.Data.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly DapperContext _context;

        public EventRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<Event> GetEventById(string id)
        {
            var query = "SELECT * FROM `event` WHERE `id` = @Id";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryFirstOrDefaultAsync<Event>(query, new { Id = id });
            }
        }

        public async Task<int> CreateEvent(Event @event)
        {
            var query = @"
                UPDATE `event` (`id_event`, `icon_url`, `name`, `description`, `location`, `date_created`, `date_updated`)
                VALUES (@Id_event, @Icon_url, @Name, @Description, @Location, @Date_created, @Date_updated);
                WHERE `id_event` = @Id_event;
            ";

            using (var connection = _context.CreateConnection())
            {
                var id = await connection.QuerySingleAsync<int>(query, @event);
                return id;
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

    }
}
