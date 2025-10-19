using Dapper;
using EventBus.Abstractions;
using Microsoft.Extensions.Options;
using OrderProcessor.Events;

namespace OrderProcessor.Services;

public sealed class GracePeriodManagerService(
    IOptions<BackgroundTaskOptions> options,
    IEventBus eventBus,
    ILogger<GracePeriodManagerService> logger,
    IDbConnectionFactory connectionFactory) : BackgroundService
{
    private readonly BackgroundTaskOptions _options = options?.Value ?? throw new ArgumentNullException(nameof(options));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var delayTime = TimeSpan.FromSeconds(_options.CheckUpdateTime);

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("GracePeriodManagerService is starting.");
            stoppingToken.Register(() => logger.LogDebug("GracePeriodManagerService background task is stopping."));
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            if (logger.IsEnabled(LogLevel.Debug))
            {
                logger.LogDebug("GracePeriodManagerService background task is doing background work.");
            }

            await CheckConfirmedGracePeriodOrders();

            await Task.Delay(delayTime, stoppingToken);
        }

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("GracePeriodManagerService background task is stopping.");
        }
    }

    private async Task CheckConfirmedGracePeriodOrders()
    {
        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("Checking confirmed grace period orders");
        }

        var orderIds = await GetConfirmedGracePeriodOrders();

        foreach (var orderId in orderIds)
        {
            var confirmGracePeriodEvent = new GracePeriodConfirmedIntegrationEvent(orderId);

            logger.LogInformation("Publishing integration event: {IntegrationEventId} - ({@IntegrationEvent})", confirmGracePeriodEvent.Id, confirmGracePeriodEvent);

            await eventBus.PublishAsync(confirmGracePeriodEvent);
        }
    }

    private async Task<List<int>> GetConfirmedGracePeriodOrders()
    {
        try
        {
            using var connection = await connectionFactory.CreateConnectionAsync();

            const string query = """
                SELECT "id"
                FROM public.orders
                WHERE CURRENT_TIMESTAMP - "order_date" >= @GracePeriodTime AND "order_status" = 'Submitted'
                """;

            var parameters = new { GracePeriodTime = TimeSpan.FromMinutes(_options.GracePeriodTime) };

            var ids = await connection.QueryAsync<int>(query, parameters);

            return ids.ToList();
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An error occurred while retrieving confirmed grace period orders.");
        }

        return new List<int>();
    }
}