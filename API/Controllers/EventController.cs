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
                    Owner = user,
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
                        DateStart = dateOption.DateStart,
                        DateEnd = dateOption.DateEnd,
                    };
                    
                    _ = await _eventRepository.CreateDateOption(opt);
                }

                foreach (var tagId in request.Tag_ids)
                {
                    _eventRepository.AddTag(event_id, tagId);
                }

                return Ok("Success, event id:" + event_id);
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

                if (current_event.Id_user != request.Id_user)
                {
                    return Unauthorized();
                }

                current_event.Name = request.Name;
                current_event.Description = request.Description;
                current_event.Location = request.Location;
                current_event.End_voting_date = request.End_voting_date;
                current_event.Chosen_date_start = request.Chosen_date_start;
                current_event.Chosen_date_end = request.Chosen_date_end;
                current_event.Date_updated = DateTime.UtcNow;
                current_event.SysRowState = request.SysRowState;

                _eventRepository.UpdateEvent(current_event);

                current_event.Date_options.RemoveAll(x =>
                    request.Date_options.Any(y => y.Id_date_option == x.Id_date_option));

                foreach (var opt in current_event.Date_options)
                {
                    _eventRepository.DeleteDateOption(opt.Id_date_option);
                }

                foreach (var dateOption in request.Date_options)
                {
                    DateOption transformed_date_option = new DateOption
                    {
                        Id_date_option = dateOption.Id_date_option,
                        Id_event = current_event.Id_event,
                        DateStart = dateOption.DateStart,
                        DateEnd = dateOption.DateEnd,
                    };

                    if (dateOption.Id_date_option == 0)
                    {
                        await _eventRepository.CreateDateOption(transformed_date_option);

                        continue;
                    }
                    
                    _eventRepository.UpdateDateOption(transformed_date_option);
                }

                return Ok("Success");
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
                return Ok(await _eventRepository.GetEventById(id));
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
                return Ok(await _eventRepository.GetAllEvents());
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