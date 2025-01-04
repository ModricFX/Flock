using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using flock.Data.Repositories.Interfaces;
using flock.Helpers;
using flock.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Swashbuckle.AspNetCore.Annotations;

namespace flock.Controllers
{
    [Route("api/auth/token")]
    [ApiController]
    public class AuthTokenController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtSettings _jwtSettings;

        public AuthTokenController(IUserRepository userRepository, IOptions<JwtSettings> jwtSettings)
        {
            _userRepository = userRepository;
            _jwtSettings = jwtSettings.Value;
        }

        [SwaggerOperation(
            Summary = "Login user",
            Description = "Login the user by creating the temporary authentication token."
        )]
        [HttpPost()]
        public async Task<IActionResult> Login(CreateUserTokenDto request)
        {
            var user = await _userRepository.GetUserByEmailOrUsernameAsync(request.Email);
            if (user == null)
                return Unauthorized("No user with this email or username");

            var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            if (!isValid)
                return Unauthorized("Invalid credentials.");

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("ID_user", user.Id_user.ToString()),
                    new Claim(ClaimTypes.Name, user.Email),
                    // Add the Date_updated claim
                    new Claim("Date_updated", user.Date_updated.ToUniversalTime().Ticks.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenValidityInMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [SwaggerOperation(
            Summary = "Renew auth token",
            Description = "Creates a new auth token given the old one. Operation fails if the user resource was updated since the old token was issued."
        )]
        [HttpPost("renew")]
        [Authorize]
        public async Task<IActionResult> RenewToken()
        {
            var userId = User.FindFirst("ID_user")?.Value;
            if (userId == null)
                return Unauthorized("Invalid token.");

            var userEmail = User.Identity.Name;
            var user = await _userRepository.GetUserByEmailOrUsernameAsync(userEmail);
            if (user == null)
                return Unauthorized("User not found.");

            // Extract the Date_updated ticks from the token
            var dateUpdatedClaim = User.FindFirst("Date_updated")?.Value;
            if (dateUpdatedClaim == null)
                return Unauthorized("Invalid token format.");

            if (!long.TryParse(dateUpdatedClaim, out long tokenDateUpdatedTicks))
                return Unauthorized("Invalid token format.");

            var tokenDateUpdated = new DateTime(tokenDateUpdatedTicks, DateTimeKind.Utc);

            // Compare current user's Date_updated with the token's Date_updated
            if (user.Date_updated.ToUniversalTime() != tokenDateUpdated)
            {
                // The user has changed since the token was issued, do not renew.
                return Unauthorized("User data changed. Please log in again.");
            }

            // If unchanged, generate a new token
            var newToken = GenerateJwtToken(user);
            return Ok(new { Token = newToken });
        }

    }

}
