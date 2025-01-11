using System;
using System.Threading;
using System.Threading.Tasks;
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
                    logger.LogError(ex, "Error in EventStateService Workload");
                }
            }
        }

        private async Task AssignVotedDate(Event e)
        {
            using var scope = serviceProvider.CreateScope();
            var eventRepository = scope.ServiceProvider.GetRequiredService<IEventRepository>();

            var bestDateOption = await eventRepository.GetBestDateOption(e.Id_event);
            // check if there are any votes
            if (bestDateOption is null)
            {
                throw new Exception("No votes for this event");
            }
            e.Chosen_date_end = bestDateOption.Date_end;
            e.Chosen_date_start = bestDateOption.Date_start;
            
            await eventRepository.UpdateEvent(e);
            Console.WriteLine($"Event {e.Id_event} has been updated with the chosen date: {e.Chosen_date_start} - {e.Chosen_date_end}");
        }

        private async Task NotifyParticipants(Event e)
        {
            using var scope = serviceProvider.CreateScope();
            var eventRepository = scope.ServiceProvider.GetRequiredService<IEventRepository>();

            var participants = await eventRepository.GetParticipantsAndOwner(e.Id_event);
            foreach (var p in participants)
            {
                // TODO: send email or notification
                Console.WriteLine($"Email sent to {p.Email} about the chosen date for event {e.Id_event}");
            }
        }
    }
}
