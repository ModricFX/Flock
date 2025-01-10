namespace flock.Models;

public class Invitation
{
    public int Id_user { get; set; }
    public User? User { get; set; }
    public int Id_event { get; set; }
    public DateTime Date_invited { get; set; }
    public string Status { get; set; }
}