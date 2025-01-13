using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using flock.Controllers.Dtos;
using flock.Data.DbContext;
using flock.Data.Repositories.Interfaces;
using flock.Models;


namespace flock.Data.Repositories
{
    public class UserNotificationRepository : IUserNotificationRepository
    {
        private readonly DapperContext _context;

        public UserNotificationRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
        {
            const string sql = @"
        UPDATE usernotification
        SET unread = false
        WHERE id_user = @UserId AND id_notification = @NotificationId;
    ";

            using var connection = _context.CreateConnection();
            var affectedRows = await connection.ExecuteAsync(sql, new { UserId = userId, NotificationId = notificationId });

            return affectedRows > 0;
        }

        public async Task<IEnumerable<UserNotificationJoined>> GetJoinedForUserAsync(int userId)
        {
            const string sql = @"
                SELECT 
                    un.id_user,
                    un.id_notification,
                    un.unread,
                    un.date_received,
                    -- We'll alias the notification PK so Dapper can split columns
                    n.id_notification AS N_id_notification,
                    n.title,
                    n.description
                FROM usernotification un
                INNER JOIN notification n ON un.id_notification = n.id_notification
                WHERE un.id_user = @UserId
                ORDER BY un.date_received DESC;
            ";

            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<UserNotificationJoined, Notification, UserNotificationJoined>(
                sql,
                (un, notif) =>
                {
                    un.Notification = notif;
                    return un;
                },
                new { UserId = userId },
                splitOn: "N_id_notification"
            );

            return result;
        }

        /// <summary>
        /// Creates a new notification and links it to a user. The client does not supply Id_Notification; it's auto-incremented.
        /// </summary>
        public async Task<UserNotificationJoined> CreateNotificationForUserAsync(CreateNotificationRequestDto dto)
        {
            const string insertNotificationSql = @"
                INSERT INTO notification (title, description)
                VALUES (@Title, @Description);
                SELECT LAST_INSERT_ID();
            ";

            const string insertUserNotificationSql = @"
                INSERT INTO usernotification (id_user, id_notification, unread, date_received)
                VALUES (@Id_User, @Id_Notification, @Unread, @Date_Received);
            ";

            using var connection = _context.CreateConnection();
            connection.Open();

            // We'll explicitly begin a transaction for atomicity
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1) Insert the notification, get the new auto-incremented ID
                var newNotificationId = await connection.ExecuteScalarAsync<long>(
                    insertNotificationSql,
                    new
                    {
                        Title = dto.Title,
                        Description = dto.Description
                    },
                    transaction
                );

                var notificationId = (int)newNotificationId; // Convert from long to int

                // 2) Insert into usernotification bridging table
                var bridgingParams = new
                {
                    Id_User = dto.Id_User,
                    Id_Notification = notificationId,
                    Date_Received = DateTime.UtcNow,
                    Unread = true
                };

                await connection.ExecuteAsync(
                    insertUserNotificationSql,
                    bridgingParams,
                    transaction
                );

                // 3) Commit
                transaction.Commit();

                // 4) Return the joined object with the newly generated IDs
                return new UserNotificationJoined
                {
                    Id_User = dto.Id_User,
                    Id_Notification = notificationId,
                    Unread = true,
                    Date_Received = bridgingParams.Date_Received,
                    Notification = new Notification
                    {
                        Id_Notification = notificationId,
                        Title = dto.Title,
                        Description = dto.Description
                    }
                };
            }
            catch
            {
                // Roll back if anything fails
                transaction.Rollback();
                throw;
            }
        }
    }
}