namespace flock.Models;

public class DateOption
{
    public int Id_date_option { get; set; }
    public int Id_event  { get; set; }
    public DateTime DateStart { get; set; }
    public DateTime DateEnd { get; set; }
}