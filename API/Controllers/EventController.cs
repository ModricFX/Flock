using flock.Data.Repositories.Interfaces;
using flock.Controllers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using flock.Models;
using Microsoft.AspNetCore.Identity;

namespace flock.Controllers
{
    [Route("api/event")]
    [ApiController]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventRepository _eventRepository;

        public EventController(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        [SwaggerOperation(
            Summary = "Create event",
            Description = "Creates the event resource."
        )]
        [HttpPost()]
        public async Task<IActionResult> Create(CreateEventDto request)
        {
            try
            {
                var user = await _eventRepository.GetUserById(request.Id_user);
                
                Event ev = new Event{
                    Name = request.Name,
                    Description = request.Description,
                    Id_user = user.Id_user,
                    Location = request.Location,
                    End_voting_date = request.End_voting_date,
                    Date_created = DateTime.UtcNow,
                    Date_updated = DateTime.UtcNow,
                    SysRowState = 1,
                };
                
                var event_id = await _eventRepository.CreateEvent(ev);
                
                ev.Invitations = new List<Invitation>();
                ev.Votes = new List<Chose>();
                ev.Date_options = new List<DateOption>();

                foreach (var dateOption in request.Date_options)
                {
                    DateOption opt = new DateOption
                    {
                        Id_event = event_id,
                        Date_end = dateOption.Date_start,
                        Date_start = dateOption.Date_end,
                    };
                    
                    ev.Date_options.Add(await _eventRepository.CreateDateOption(opt));
                }

                foreach (var tagId in request.Tag_ids)
                {
                    _ = _eventRepository.AddTag(event_id, tagId);
                }
                
                foreach (var user_id in request.Participant_ids)
                {
                    Invitation inv = new Invitation
                    {
                        Id_user = user_id,
                        Id_event = event_id,
                        Status = "pending",
                        Date_invited = DateTime.UtcNow,
                    };
                    
                    ev.Invitations.Add(await _eventRepository.SendInvitation(inv));
                }
                
                return Ok(ev);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [SwaggerOperation(
            Summary = "Update event",
            Description = "Updates the event resource."
        )]
        [HttpPut()]
        public async Task<IActionResult> Update(EventDto request)
        {
            try
            {
                Event currentEvent = await _eventRepository.GetEventById(request.Id_event);

                if (currentEvent == null)
                {
                    return BadRequest("event not found");
                }
                currentEvent.Invitations = await _eventRepository.GetInvitations(currentEvent.Id_event);
                currentEvent.Votes = await _eventRepository.GetVotes(currentEvent.Id_event);
                currentEvent.Date_options = await _eventRepository.GetDateOptions(currentEvent.Id_event);

                if (currentEvent.Id_user != request.Id_user)
                {
                    return Unauthorized();
                }

                // Update event details
                currentEvent.Name = request.Name;
                currentEvent.Description = request.Description;
                currentEvent.Location = request.Location;
                currentEvent.End_voting_date = request.End_voting_date;
                currentEvent.Chosen_date_start = request.Chosen_date_start;
                currentEvent.Chosen_date_end = request.Chosen_date_end;
                currentEvent.Date_updated = DateTime.UtcNow;
                currentEvent.SysRowState = request.SysRowState;

                if (!await _eventRepository.UpdateEvent(currentEvent))
                {
                    return BadRequest();
                }
                
                List<DateOption> newDateOptions = new List<DateOption>();
                
                if (request.Date_options != null)
                {
                    foreach (var dateOption in request.Date_options)
                    {
                        DateOption transformedDateOption = new DateOption
                        {
                            Id_event = currentEvent.Id_event,
                            Date_end = dateOption.Date_end,
                            Date_start = dateOption.Date_start,
                            Id_date_option = dateOption.Id_date_option,
                        };

                        if (transformedDateOption.Id_date_option == 0)
                        {
                            newDateOptions.Add(await _eventRepository.CreateDateOption(transformedDateOption));
                        }
                        else
                        {
                            newDateOptions.Add(await _eventRepository.UpdateDateOption(transformedDateOption));
                        }
                    }
                }

                if (currentEvent.Date_options != null && currentEvent.Date_options.Count > 0)
                {
                    foreach (var dateOption in currentEvent.Date_options)
                    {
                        if(!newDateOptions.Exists(x => x.Id_date_option == dateOption.Id_date_option))
                            _ = _eventRepository.DeleteDateOption(dateOption.Id_date_option);
                    }
                }
                
                currentEvent.Date_options = newDateOptions;
                
                List<Invitation> newInvitations = new List<Invitation>();

                if (request.Participant_ids != null)
                {
                    foreach (var id in request.Participant_ids)
                    {
                        Invitation inv = new Invitation
                        {
                            Id_user = id,
                            Id_event = currentEvent.Id_event,
                            Date_invited = DateTime.UtcNow,
                            Status = "pending"
                        };
                        
                        if (currentEvent.Invitations == null)
                        {
                            newInvitations.Add(await _eventRepository.SendInvitation(inv));
                        }
                        else
                        {
                            Invitation? search = currentEvent.Invitations.Find(x => x.Id_user == id);
                            if(search == null)
                                newInvitations.Add(await _eventRepository.SendInvitation(inv));
                            else
                                newInvitations.Add(search);
                        }
                    }
                }

                if (currentEvent.Invitations != null && currentEvent.Invitations.Count > 0)
                {
                    List<Invitation> invitationsToRemove = new List<Invitation>();
    
                    foreach (var invite in currentEvent.Invitations)
                    {
                        if (!newInvitations.Exists(x => x.Id_user == invite.Id_user))
                        {
                            invitationsToRemove.Add(invite);
                        }
                    }
                    
                    foreach (var invite in invitationsToRemove)
                    {
                        await _eventRepository.DeleteInvitation(invite.Id_event, invite.Id_user);
                    }
                }

                currentEvent.Invitations = await _eventRepository.GetInvitations(currentEvent.Id_event);
                
                return Ok(currentEvent);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }


        [SwaggerOperation(
            Summary = "Get event",
            Description = "Returns selected event"
        )]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            try
            {
                Event currentEvent = await _eventRepository.GetEventById(id);
                currentEvent.Invitations = await _eventRepository.GetInvitations(currentEvent.Id_event);
                currentEvent.Votes = await _eventRepository.GetVotes(currentEvent.Id_event);
                currentEvent.Date_options = await _eventRepository.GetDateOptions(currentEvent.Id_event);
                
                return Ok(currentEvent);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [SwaggerOperation(
            Summary = "List events",
            Description = "Returns all existing event resources"
        )]
        [HttpGet()]
        public async Task<IActionResult> List()
        {
            try
            {
                List<Event> events = await _eventRepository.GetAllEvents();
                foreach (var ev in events)
                {
                    ev.Invitations = await _eventRepository.GetInvitations(ev.Id_event);
                    ev.Votes = await _eventRepository.GetVotes(ev.Id_event);
                    ev.Date_options = await _eventRepository.GetDateOptions(ev.Id_event);
                }
                return Ok(events);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [SwaggerOperation(
            Summary = "Delete event",
            Description = "Deletes the event resource."
        )]
        [HttpDelete()]
        public async Task<IActionResult> Delete(DeleteEventDto eventDeletion, int user_id)
        {
            try
            {
                if(eventDeletion.Id_user != user_id)
                    return Unauthorized();
                
                _eventRepository.DeleteEvent(eventDeletion.Id_event);
                return Ok("Success");

            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}