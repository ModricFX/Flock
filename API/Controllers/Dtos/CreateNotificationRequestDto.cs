namespace flock.Controllers.Dtos;

public class CreateNotificationRequestDto
{
    // Which user gets this new notification
    public int Id_User { get; set; }

    // Notification fields
    public string Title { get; set; }
    public string Description { get; set; }
}