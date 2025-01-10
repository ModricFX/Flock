using flock.Data.Repositories.Interfaces;
using flock.Controllers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using flock.Models;

namespace flock.Controllers
{
    [Route("api/event")]
    [ApiController]
    
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

                foreach (var dateOption in request.Date_options)
                {
                    DateOption opt = new DateOption
                    {
                        Id_event = event_id,
                        Date_end = dateOption.Date_start,
                        Date_start = dateOption.Date_end,
                    };
                    
                    _ = await _eventRepository.CreateDateOption(opt);
                }

                foreach (var tagId in request.Tag_ids)
                {
                    _eventRepository.AddTag(event_id, tagId);
                }
                
                foreach (var user_id in request.Participant_ids)
                {
                    _eventRepository.SendInvitation(event_id, user_id);
                }

                ev = await _eventRepository.GetEventById(event_id);
                ev.Invitations = await _eventRepository.GetInvitations(ev.Id_event);
                ev.Votes = await _eventRepository.GetVotes(ev.Id_event);
                
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
                Event current_event = await _eventRepository.GetEventById(request.Id_event);
                current_event.Invitations = await _eventRepository.GetInvitations(current_event.Id_event);
                current_event.Votes = await _eventRepository.GetVotes(current_event.Id_event);
                current_event.Date_options = await _eventRepository.GetDateOptions(current_event.Id_event);

                if (current_event.Id_user != request.Id_user)
                {
                    return Unauthorized();
                }

                // Update event details
                current_event.Name = request.Name;
                current_event.Description = request.Description;
                current_event.Location = request.Location;
                current_event.End_voting_date = request.End_voting_date;
                current_event.Chosen_date_start = request.Chosen_date_start;
                current_event.Chosen_date_end = request.Chosen_date_end;
                current_event.Date_updated = DateTime.UtcNow;
                current_event.SysRowState = request.SysRowState;

                Event newev = await _eventRepository.UpdateEvent(current_event);

                // Handle Date Options
                current_event.Date_options.RemoveAll(x =>
                    request.Date_options.Any(y => y.Id_date_option == x.Id_date_option));

                foreach (var opt in current_event.Date_options)
                {
                    await _eventRepository.DeleteDateOption(opt.Id_date_option);
                }

                foreach (var dateOption in request.Date_options)
                {
                    DateOption transformed_date_option = new DateOption
                    {
                        Id_date_option = dateOption.Id_date_option,
                        Id_event = current_event.Id_event,
                        Date_start = dateOption.Date_start,
                        Date_end = dateOption.Date_end,
                    };

                    if (dateOption.Id_date_option == 0)
                    {
                        await _eventRepository.CreateDateOption(transformed_date_option);
                    }
                    else
                    {
                        await _eventRepository.UpdateDateOption(transformed_date_option);
                    }
                }

                // Handle Invitations
                foreach (var id in request.Participant_ids)
                {
                    if (!current_event.Invitations.Exists(x => x.Id_user == id))
                    {
                        await _eventRepository.SendInvitation(current_event.Id_event, id);
                    }
                }

                current_event.Invitations.RemoveAll(x => x.Id_event == request.Id_event && request.Participant_ids.Contains(x.Id_user));

                foreach (var part in current_event.Invitations)
                {
                    await _eventRepository.DeleteInvitation(part.Id_event, part.Id_user);
                }

                newev.Invitations = await _eventRepository.GetInvitations(current_event.Id_event);
                newev.Votes = await _eventRepository.GetVotes(newev.Id_event);
                newev.Date_options = await _eventRepository.GetDateOptions(newev.Id_event);

                return Ok(newev);
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