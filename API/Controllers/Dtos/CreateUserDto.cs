namespace flock.Models.Auth
{
    public class CreateUserDto
    {
        public string First_name { get; set; }
        public string Last_name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}