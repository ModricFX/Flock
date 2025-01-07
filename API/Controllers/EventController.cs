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
        public async Task<IActionResult> Update(CreateEventDto request)
        {
           // TODO: Implement (make sure to check if a user is authorized to update the event)
           throw new NotImplementedException();
        }

        [SwaggerOperation(
            Summary = "Get event",
            Description = "Returns selected event"
        )]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(string id)
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
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                _eventRepository.DeleteEvent(id);
                return Ok("Success");

            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}