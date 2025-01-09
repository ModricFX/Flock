namespace flock.Controllers.Dtos;

public class UpdatePasswordDto
{
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

public class UpdateProfileDto
{
    public string Username { get; set; }
    public string Email { get; set; }
}