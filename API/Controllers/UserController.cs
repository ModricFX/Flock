using flock.Data.Repositories.Interfaces;
using flock.Models;
using flock.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace flock.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [SwaggerOperation(
            Summary = "Create user",
            Description = "Creates the user resource with the password of choice and all the other info."
        )]
        [HttpPost()]
        public async Task<IActionResult> Register(CreateUserDto request)
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest("User already exists.");

            // Hash the password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                First_name = request.First_name,
                Last_name = request.Last_name,
                Email = request.Email,
                Password = passwordHash,
                Email_verified = false,
                Date_created = DateTime.UtcNow,
                Date_updated = DateTime.UtcNow,
                SysRowState = 1,
                Id_role = 2 // Default role for new users (User)
            };

            var userId = await _userRepository.CreateUserAsync(user);

            return Ok(new { UserId = userId, Message = "Registration successful." });
        }

        [SwaggerOperation(
            Summary = "Get authenticated user",
            Description = "Returns the user resource for the currently authenticated user."
        )]
        [HttpGet("me")]
        public async Task<IActionResult> GetAuthenticatedUser()
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