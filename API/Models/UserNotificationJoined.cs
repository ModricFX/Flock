namespace flock.Models;

public class UserNotificationJoined
{
    // From usernotification table
    public int Id_User { get; set; }
    public int Id_Notification { get; set; }
    public bool Unread { get; set; }
    public DateTime? Date_Received { get; set; }

    // Nested Notification object
    public Notification Notification { get; set; }
}