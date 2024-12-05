namespace flock.Helpers;

public class JwtSettings
{
    public string Secret { get; set; }
    public int TokenValidityInMinutes { get; set; }
}