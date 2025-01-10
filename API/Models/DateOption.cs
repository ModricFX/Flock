namespace flock.Models;

public class DateOption
{
    public int Id_date_option { get; set; }
    public int Id_event  { get; set; }
    public DateTime Date_start { get; set; }
    public DateTime Date_end { get; set; }
}