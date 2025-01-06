using flock.Data.Repositories.Interfaces;
using flock.Models;
using flock.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

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
            Summary = "List events",
            Description = "Returns all existing event resources"
        )]
        [HttpGet()]
        public async Task<IActionResult> List()
        {
            // TODO: Implement
            throw new NotImplementedException();
        }

    }
}