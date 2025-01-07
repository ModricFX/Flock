namespace flock.Controllers.Dtos;

public class EventDto
{
    public int Id_event { get; set; }
    public int Id_user { get; set; }

    public string Name { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime End_voting_date { get; set; }
    public DateTime Chosen_date_start { get; set; }
    public DateTime Chosen_date_end { get; set; }
    
    public int SysRowState { get; set; }
    
    public DateOptionDto[] Date_options { get; set; }
}