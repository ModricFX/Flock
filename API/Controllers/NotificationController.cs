using Microsoft.AspNetCore.Mvc;
using flock.Data.Repositories.Interfaces;
using flock.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using flock.Controllers.Dtos;
using flock.Data.Repositories;

namespace flock.Controllers;

[ApiController]
[Route("api/notification")]
public class NotificationController : ControllerBase
{
    private readonly IUserNotificationRepository _userNotificationRepository;

    public NotificationController(IUserNotificationRepository userNotificationRepository)
    {
        _userNotificationRepository = userNotificationRepository;
    }
    
    
    [HttpGet]
    [Route("notifications")]
    public async Task<ActionResult<IEnumerable<UserNotificationJoined>>> GetNotificationsForUser()
    {
        var idUserClaim = User.FindFirst("id_user");
        if (idUserClaim == null)
        {
            return Unauthorized("You are not authorized to access these notifications.");
        }
        // Extract user ID from JWT token
        var userIdFromToken = int.Parse(idUserClaim.Value);

        var notifications = await _userNotificationRepository.GetJoinedForUserAsync(userIdFromToken);
        return Ok(notifications);
    }
    
    
    [HttpPost]
    [Route("markAsRead/{notificationId}")]
    public async Task<ActionResult> MarkAsRead(int notificationId)
    {
        var idUserClaim = User.FindFirst("id_user");
        if (idUserClaim == null)
        {
            return Unauthorized("You are not authorized to access these notifications.");
        }
        // Extract user ID from JWT token
        var userIdFromToken = int.Parse(idUserClaim.Value);

        var result = await _userNotificationRepository.MarkAsReadAsync(userIdFromToken, notificationId);
        if (!result)
        {
            return NotFound("Notification not found or you are not authorized to mark it as read.");
        }

        return NoContent();
    }
    
    [HttpDelete]
    public async Task<ActionResult> DeleteNotification(int notificationId)
    {
        var idUserClaim = User.FindFirst("id_user");
        if (idUserClaim == null)
        {
            return Unauthorized("You are not authorized to access these notifications.");
        }
        // Extract user ID from JWT token
        var userIdFromToken = int.Parse(idUserClaim.Value);

        var result = await _userNotificationRepository.DeleteNotification(userIdFromToken, notificationId);
        if (!result)
        {
            return NotFound("Notification not found or you are not authorized to delete it.");
        }

        return NoContent();
    }
    
    [HttpPost]
    public async Task<ActionResult<UserNotificationJoined>> CreateNotificationForUser(CreateNotificationRequestDto newNotification)
    {
        var createdNotification = await _userNotificationRepository.CreateNotificationForUserAsync(newNotification);
        return CreatedAtAction(nameof(GetNotificationsForUser), new { userId = createdNotification.Id_User }, createdNotification);
    }
}