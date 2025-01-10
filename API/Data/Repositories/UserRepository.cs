using flock.Data.DbContext;
using flock.Data.Repositories.Interfaces;
using flock.Models;
using Dapper;
using MySqlConnector;

namespace flock.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DapperContext _context;

        public UserRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailOrUsernameAsync(string text)
        {
            try
            {
                var query = @"
                        SELECT * 
                        FROM `user` 
                        WHERE (`email` = @Text OR `username` = @Text) 
                        AND `sysrowstate` = 1";

                using (var connection = _context.CreateConnection())
                {
                    return await connection.QueryFirstAsync<User>(query, new { Text = text });
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }


        public async Task<User?> GetUserById(int id)
        {
            var query = "SELECT * FROM `user` WHERE `id_user` = @Id AND `sysrowstate` = 1";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryFirstAsync<User>(query, new { Id = id });
            }
        }

        public async Task<int> CreateUserAsync(User user)
        {
            var query = @"
                INSERT INTO `user` (`id_role`, `first_name`, `last_name`, `username`, `email`, `password`, `email_verified`, `date_created`, `date_updated`, `sysrowstate`)
                VALUES (@Id_role, @First_name, @Last_name, @Username, @Email, @Password, @Email_verified, @Date_created, @Date_updated, @SysRowState);
                SELECT LAST_INSERT_ID();
            ";

            using (var connection = _context.CreateConnection())
            {
                var id = await connection.QuerySingleAsync<int>(query, user);
                return id;
            }
        }

        public async Task<Friendship?> GetUserRelationships(int user_id, int use_user_id)
        {
            try
            {
                var query =
                    "SELECT * FROM friendship WHERE (id_user = @Id_User AND use_id_user = @Use_id_user) OR (id_user = @Use_id_User AND use_id_user = @Id_User);";
                
                using (var connection = _context.CreateConnection())
                {
                    return await connection.QueryFirstAsync<Friendship>(query, new {Id_user = user_id, Use_id_user = use_user_id});
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async void UpdateUserRelationship(Friendship friendship)
        {
            var query = "DELETE FROM friendship WHERE (id_user = @Id_User AND use_id_user = @Use_id_user) OR (id_user = @Use_id_User AND use_id_user = @Id_User); INSERT INTO friendship (id_user, use_id_user, status, date_updated) VALUES (@Id_user ,@Use_id_user, @Status, @Date_updated);";
            
            
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, friendship);
            }
        }

        public async Task<List<Friendship>> GetAllRelationshipsWithStatus(int user_id, string status)
        {
            var query = "SELECT * FROM `friendship` WHERE `status` = @Status AND (`id_user` = @User_id OR `use_id_user` = @User_id);";

            if(status.ToLower() == "all")
                query = "SELECT * FROM `friendship` WHERE (`id_user` = @User_id OR `use_id_user` = @User_id);";
            
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.QueryAsync<Friendship>(query, new { Status = status, User_id = user_id });
                return result.ToList(); 
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            var query = @"
                UPDATE `user`
                SET 
                    `id_role` = @Id_role,
                    `first_name` = @First_name,
                    `last_name` = @Last_name,
                    `username` = @Username,
                    `email` = @Email,
                    `password` = @Password,
                    `email_verified` = @Email_verified,
                    `date_updated` = @Date_updated,
                    `sysrowstate` = @SysRowState
                WHERE `id_user` = @Id_user;
            ";

            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, user);
            }
        }

        public async Task DeleteUserAsync(int id)
        {
            var query = "UPDATE `user` SET `sysrowstate` = 0 WHERE `id_user` = @Id_user";

            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, new { Id_user = id });
            }
        }
    }
}
