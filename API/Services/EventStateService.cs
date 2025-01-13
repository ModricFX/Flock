using System;
using System.Threading;
using System.Threading.Tasks;
using flock.Controllers.Dtos;
using flock.Data.Repositories.Interfaces;
using flock.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace flock.Services
{
    public class EventStateService(IServiceProvider serviceProvider, ILogger<EventStateService> logger)
        : BackgroundService
    {
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(1);

        /// <summary>
        /// ticks every <see cref="_interval"/>. 
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(_interval);

            logger.LogInformation("EventStateService started. Interval: {Interval}", _interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    await Workload(stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error in EventStateService DoWorkAsync");
                }
            }

            logger.LogInformation("EventStateService is stopping.");
        }

        /// <summary>
        /// will be called once per timer tick.
        /// </summary>
        private async Task Workload(CancellationToken stoppingToken)
        {
            using var scope = serviceProvider.CreateScope();
            var eventRepository = scope.ServiceProvider.GetRequiredService<IEventRepository>();
            
            var events = await eventRepository.GetEventsWithEndedVotingStage();

            foreach (var x in events.Where(x => x.Chosen_date_start == DateTime.MinValue && x.Chosen_date_end == DateTime.MinValue))
            {
                try
                {
                    await AssignVotedDate(x);
                    await NotifyParticipants(x);
                } catch (Exception ex)
                {
                    logger.LogError(ex, "Error in EventStateService Workload for event id {EventId}", x.Id_event);
                }
            }
        }

        private async Task AssignVotedDate(Event e)
        {
            using var scope = serviceProvider.CreateScope();
            var eventRepository = scope.ServiceProvider.GetRequiredService<IEventRepository>();

            var bestDateOption = await eventRepository.GetBestDateOption(e.Id_event);
            var allDateOptions = await eventRepository.GetDateOptions(e.Id_event);
            
            DateTime start, end;
            if (bestDateOption.Date_start == DateTime.MinValue || bestDateOption.Date_end == DateTime.MinValue || bestDateOption is null)
            {
                if (allDateOptions.Count == 0)
                {
                    throw new Exception("No date options available for event " + e.Id_event);
                }

                start = allDateOptions[0].Date_start;
                end = allDateOptions[0].Date_end;
            }
            else
            {
                
                start = bestDateOption.Date_start;
                end = bestDateOption.Date_end;
            }

            e.Chosen_date_end = end;
            e.Chosen_date_start = start;
            
            await eventRepository.UpdateEvent(e);
            Console.WriteLine($"Event {e.Id_event} has been updated with the chosen date: {e.Chosen_date_start} - {e.Chosen_date_end}");
        }

        private async Task NotifyParticipants(Event e)
        {
            using var scope = serviceProvider.CreateScope();
            var eventRepository = scope.ServiceProvider.GetRequiredService<IEventRepository>();
            var notiRepo = scope.ServiceProvider.GetRequiredService<IUserNotificationRepository>();

            var participants = await eventRepository.GetParticipantsAndOwner(e.Id_event);
            foreach (var p in participants)
            {
                var chosenDateStartUtc = e.Chosen_date_start.ToUniversalTime().ToString("o");
                var chosenDateEndUtc = e.Chosen_date_end.ToUniversalTime().ToString("o");

                var dto = new CreateNotificationRequestDto
                {
                    Id_User = p.Id_user,
                    Description = $"Chosen date for event {e.Name} is {{{chosenDateStartUtc}}} - {{{chosenDateEndUtc}}}",
                    Title = "Voting has ended",
                };
                await notiRepo.CreateNotificationForUserAsync(dto);
                Console.WriteLine($"Notification sent to {p.Username} about the chosen date for event {e.Id_event}");
            }
        }
    }
}
