namespace flock.Models;

public class UserNotification
{
    public bool Unread { get; set; }
    public int Id_User { get; set; }
    public int Id_Notification { get; set; }
    public DateTime Date_Received { get; set; }
}