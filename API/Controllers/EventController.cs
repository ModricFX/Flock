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
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventRepository _eventRepository;

        public EventController(IEventRepository userRepository)
        {
            _eventRepository = userRepository;
        }

        [SwaggerOperation(
            Summary = "Create event",
            Description = "Creates the event resource."
        )]
        [HttpPut()]
        public async Task<IActionResult> Create(CreateEventDto request)
        {
            // TODO: Implement
        }

        [SwaggerOperation(
            Summary = "Update event",
            Description = "Updates the event resource."
        )]
        [HttpPost()]
        public async Task<IActionResult> Update(CreateEventDto request)
        {
           // TODO: Implement (make sure to check if a user is authorized to update the event)
        }

        [SwaggerOperation(
            Summary = "List events",
            Description = "Returns all existing event resources"
        )]
        [HttpGet()]
        public async Task<IActionResult> List()
        {
            // TODO: Implement
        }

    }
}