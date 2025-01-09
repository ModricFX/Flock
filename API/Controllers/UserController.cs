using flock.Data.Repositories.Interfaces;
using flock.Controllers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using flock.Models;

namespace flock.Controllers
{
    [Route("api/user")]
    [ApiController]
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
            var existingUser = await _userRepository.GetUserByEmailOrUsernameAsync(request.Email);
            if (existingUser != null)
                return BadRequest("User already exists.");

            // Hash the password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                First_name = request.First_name,
                Last_name = request.Last_name,
                Username = request.Username,
                Email = request.Email,
                Password = passwordHash,
                Email_verified = false,
                Date_created = DateTime.UtcNow,
                Date_updated = DateTime.UtcNow,
                SysRowState = 1,
                Id_role = 1 // Default role for new users (User)
            };

            var userId = await _userRepository.CreateUserAsync(user);

            return Ok(new { UserId = userId, Message = "Registration successful." });
        }

        [SwaggerOperation(
            Summary = "Get authenticated user",
            Description = "Returns the user resource for the currently authenticated user."
        )]
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetAuthenticatedUser()
        {
            if (User?.Identity?.IsAuthenticated == false)
            {
                return Unauthorized();
            }
            
            var userEmail = User.Identity.Name; // This should be populated from the token
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Invalid token.");

            var user = await _userRepository.GetUserByEmailOrUsernameAsync(userEmail);
            if (user == null)
                return NotFound("User not found.");

            var userDto = new UserDto
            {
                Id_user = user.Id_user,
                First_name = user.First_name,
                Last_name = user.Last_name,
                Username = user.Username,
                Email = user.Email,
                Email_verified = user.Email_verified,
                Date_created = user.Date_created,
                Date_updated = user.Date_updated
            };

            return Ok(userDto);
        }
        
        [Route("/api/user/{id}")]
        [HttpGet()]
        [Authorize]
        public async Task<IActionResult> GetUserInfo(int id)
        {
            if (User?.Identity?.IsAuthenticated == false)
            {
                return Unauthorized();
            }
            
            var user = await _userRepository.GetUserById(id);
            if (user == null)
                return NotFound("User not found.");

            var userDto = new UserDto
            {
                Id_user = user.Id_user,
                First_name = user.First_name,
                Last_name = user.Last_name,
                Username = user.Username,
                Email = user.Email,
                Email_verified = user.Email_verified,
                Date_created = user.Date_created,
                Date_updated = user.Date_updated
            };

            return Ok(userDto);
        }
    
        [Route("/api/user/relationship")]
        [HttpPost()]
        [Authorize]
        public async Task<IActionResult> UpdateUserRelationship(RelationshipDto request){
            try
            {
                if (User?.Identity?.IsAuthenticated == false)
                {
                    return Unauthorized();
                }
                
                var user_data = await _userRepository.GetUserByEmailOrUsernameAsync(User.Identity.Name);

                var relationship = new Friendship
                {
                    Id_user = user_data.Id_user,
                    Use_id_user = request.related_user_id,
                    Status = request.status,
                    Date_updated = DateTime.UtcNow,
                };

                _userRepository.UpdateUserRelationship(relationship);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [Route("/api/user/relationship/{id}")]
        [HttpGet()]
        [Authorize]
        public async Task<IActionResult> GetAllRelationshipsWithStatus(int id, string status){
            try
            {
                if (User?.Identity?.IsAuthenticated == false)
                {
                    return Unauthorized();
                }
                var relationships = await _userRepository.GetAllRelationshipsWithStatus(id, status);

                return Ok(relationships);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        /// <summary>
        /// Posodobi geslo trenutno prijavljenega uporabnika,
        /// če se ujema staro geslo.
        /// </summary>
        [SwaggerOperation(
            Summary = "Update user's password",
            Description = "Updates the current user's password if the old password is correct."
        )]
        [HttpPut("password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto request)
        {
            try
            {
                // 1. Preverimo, ali je uporabnik avtenticiran
                if (!User.Identity.IsAuthenticated)
                    return Unauthorized("User is not authenticated.");

                // 2. Dobimo email iz tokena (Name = email iz claims)
                var userEmail = User.Identity.Name;
                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized("Invalid token.");

                // 3. Dobimo user objekt iz baze
                var user = await _userRepository.GetUserByEmailOrUsernameAsync(userEmail);
                if (user == null)
                    return NotFound("User not found.");

                // 4. Preverimo, ali se staro geslo ujema z BCrypt hashom v bazi
                bool isValidOldPassword = BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password);
                if (!isValidOldPassword)
                {
                    return BadRequest("Old password is incorrect.");
                }

                // 5. Hashiramo novo geslo in ga shranimo
                user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.Date_updated = DateTime.UtcNow; // posodobi "zadnjič posodobljeno"

                // 6. Shranimo spremembe v bazo
                await _userRepository.UpdateUserAsync(user);

                return Ok("Password updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Posodobi profilne podatke (username, email) trenutno prijavljenega uporabnika.
        /// </summary>
        [SwaggerOperation(
            Summary = "Update user's profile",
            Description = "Updates the current user's profile data (username, email)."
        )]
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            try
            {
                // 1. Preverimo avtentikacijo
                if (!User.Identity.IsAuthenticated)
                    return Unauthorized("User is not authenticated.");

                var userEmail = User.Identity.Name;
                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized("Invalid token.");

                // 2. Dobimo user iz baze
                var user = await _userRepository.GetUserByEmailOrUsernameAsync(userEmail);
                if (user == null)
                    return NotFound("User not found.");

                // 3. Posodobimo podatke (če so v requestu izpolnjeni)
                if (!string.IsNullOrEmpty(request.Username))
                    user.Username = request.Username;

                if (!string.IsNullOrEmpty(request.Email))
                    user.Email = request.Email;

                user.Date_updated = DateTime.UtcNow;

                // 4. Shranimo spremembe
                await _userRepository.UpdateUserAsync(user);

                return Ok("Profile updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Izbriše račun trenutno prijavljenega uporabnika (hard-delete ali soft-delete).
        /// </summary>
        [SwaggerOperation(
            Summary = "Delete the current user's account",
            Description = "Deletes the current user's account from the system."
        )]
        [HttpDelete("me")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                // 1. Preverimo avtentikacijo
                if (!User.Identity.IsAuthenticated)
                    return Unauthorized("User is not authenticated.");

                var userEmail = User.Identity.Name;
                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized("Invalid token.");

                // 2. Dobimo user iz baze
                var user = await _userRepository.GetUserByEmailOrUsernameAsync(userEmail);
                if (user == null)
                    return NotFound("User not found.");

                // 3. Dejanska brisanje (ali "soft delete", če to zahtevaš)
                await _userRepository.DeleteUserAsync(user.Id_user);

                return Ok("Account deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}