namespace flock.Models;
public class User
{
    public int Id_user { get; set; }
    public int Id_role { get; set; }
    public string First_name { get; set; }
    public string Last_name { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public bool Email_verified { get; set; }
    public DateTime Date_created { get; set; }
    public DateTime Date_updated { get; set; }
    public int SysRowState { get; set; }
}