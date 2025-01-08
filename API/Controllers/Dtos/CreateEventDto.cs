using flock.Models;

namespace flock.Controllers.Dtos;
public class CreateEventDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime End_voting_date { get; set; }
    public int Id_user { get; set; }
    
    public CreateDateOptionDto[] Date_options { get; set; }
    public int[] Tag_ids { get; set; }
    
    public int[] Participant_ids { get; set; }
}
