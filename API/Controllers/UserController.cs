// Controllers/UserController.cs

using flock.Data.Repositories.Interfaces;
using flock.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace flock.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
    
        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
    
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            // Check if the user is authenticated
            if (!User.Identity.IsAuthenticated)
                return Unauthorized("User is not authenticated.");

            var userEmail = User.Identity.Name; // This should be populated from the token
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Invalid token.");

            var user = await _userRepository.GetUserByEmailAsync(userEmail);
            if (user == null)
                return NotFound("User not found.");

            var userDto = new UserDto
            {
                Id_user = user.Id_user,
                First_name = user.First_name,
                Last_name = user.Last_name,
                Email = user.Email,
                Email_verified = user.Email_verified,
                Date_created = user.Date_created,
                Date_updated = user.Date_updated
            };

            return Ok(userDto);
        }

    }
}