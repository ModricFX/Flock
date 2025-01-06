public class Event
{
    public int Id_event { get; set; }
    public string Icon_url { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public User Owner { get; set; }

    // TODO: Refactor to longitude/latitude representation or a separate Location table
    public string Location { get; set; }
    public DateTime Date_created { get; set; }
    public DateTime Date_updated { get; set; }
    public DateTime End_voting_date { get; set; }
    public int SysRowState { get; set; }


    // TODO: Add support for defining available event schedules
}