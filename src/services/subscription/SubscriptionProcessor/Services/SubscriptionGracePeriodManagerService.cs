using Dapper;
using EventBus.Abstractions;
using Microsoft.Extensions.Options;
using SubscriptionProcessor.Events;

namespace SubscriptionProcessor.Services;

public sealed class SubscriptionGracePeriodManagerService(
    IOptions<BackgroundTaskOptions> options,
    IEventBus eventBus,
    ILogger<SubscriptionGracePeriodManagerService> logger,
    IDbConnectionFactory connectionFactory) : BackgroundService
{
    private readonly BackgroundTaskOptions backgroundTaskOptions = options?.Value ?? throw new ArgumentNullException(nameof(options));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var delayTime = TimeSpan.FromSeconds(backgroundTaskOptions.CheckUpdateTime);

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("SubscriptionGracePeriodManagerService is starting.");
            stoppingToken.Register(() => logger.LogDebug("SubscriptionGracePeriodManagerService background task is stopping."));
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            if (logger.IsEnabled(LogLevel.Debug))
            {
                logger.LogDebug("SubscriptionGracePeriodManagerService background task is doing background work.");
            }

            await CheckConfirmedGracePeriodSubscriptions();

            await Task.Delay(delayTime, stoppingToken);
        }

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("SubscriptionGracePeriodManagerService background task is stopping.");
        }
    }

    private async Task CheckConfirmedGracePeriodSubscriptions()
    {
        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("Checking confirmed grace period subscriptions");
        }

        var subscriptionIds = await GetConfirmedGracePeriodSubscriptions();

        foreach (var subscriptionId in subscriptionIds)
        {
            var confirmGracePeriodEvent = new GracePeriodConfirmedIntegrationEvent(subscriptionId);

            logger.LogInformation("Publishing integration event: {IntegrationEventId} - ({@IntegrationEvent})", confirmGracePeriodEvent.Id, confirmGracePeriodEvent);

            await eventBus.PublishAsync(confirmGracePeriodEvent);
        }
    }

    private async Task<List<int>> GetConfirmedGracePeriodSubscriptions()
    {
        try
        {
            using var connection = await connectionFactory.CreateConnectionAsync();

            const string query = """
                SELECT id
                FROM public.subscriptions
                WHERE CURRENT_TIMESTAMP - subscription_date >= @GracePeriodTime AND subscription_status = 'Submitted'
                """;

            var parameters = new { GracePeriodTime = TimeSpan.FromMinutes(backgroundTaskOptions.GracePeriodTime) };

            var ids = await connection.QueryAsync<int>(query, parameters);

            return ids.ToList();
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An error occurred while retrieving confirmed grace period subscriptions.");
        }

        return [];
    }
}
