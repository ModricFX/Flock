public class Event
{
    public int Id_event { get; set; }
    public string Icon_url { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    // TODO: Refactor to longitude/latitude representation or a separate Location table
    public string Location { get; set; }
    public DateTime Date_created { get; set; }
    public DateTime Date_updated { get; set; }

    // TODO: Add support for defining available event schedules
}