using flock.Models;

namespace flock.Controllers.Dtos;
public class CreateEventDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime End_voting_date { get; set; }
    public string Id_user { get; set; }
    
    public CreateDateOptionDto[] Date_options { get; set; }
}
