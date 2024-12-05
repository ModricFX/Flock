using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using flock.Data.Repositories.Interfaces;
using flock.Helpers;
using flock.Models;
using flock.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace flock.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtSettings _jwtSettings;

        public AuthController(IUserRepository userRepository, IOptions<JwtSettings> jwtSettings)
        {
            _userRepository = userRepository;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
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

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
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
                    new Claim(ClaimTypes.Name, user.Email)
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenValidityInMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        
        [HttpPost("renew-token")]
        [Authorize]
        public IActionResult RenewToken()
        {
            var userId = User.FindFirst("ID_user")?.Value;
            if (userId == null)
                return Unauthorized("Invalid token.");

            // Retrieve user data if necessary
            var userEmail = User.Identity.Name;

            var user = _userRepository.GetUserByEmailAsync(userEmail).Result;
            if (user == null)
                return Unauthorized("User not found.");

            // Generate new JWT token
            var token = GenerateJwtToken(user);

            return Ok(new { Token = token });
        }
    }
    
}
