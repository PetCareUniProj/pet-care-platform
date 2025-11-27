using Dapper;
using EventBus.Abstractions;
using Microsoft.Extensions.Options;
using SubscriptionProcessor.Events;

namespace SubscriptionProcessor.Services;

public sealed class RecurringOrderScannerService(
    IOptions<BackgroundTaskOptions> options,
    IEventBus eventBus,
    ILogger<RecurringOrderScannerService> logger,
    IDbConnectionFactory connectionFactory) : BackgroundService
{
    private readonly BackgroundTaskOptions _options = options?.Value ?? throw new ArgumentNullException(nameof(options));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var delayTime = TimeSpan.FromSeconds(_options.CheckUpdateTime);

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("RecurringOrderScannerService is starting.");
            stoppingToken.Register(() => logger.LogDebug("RecurringOrderScannerService background task is stopping."));
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            if (logger.IsEnabled(LogLevel.Debug))
            {
                logger.LogDebug("RecurringOrderScannerService background task is doing background work.");
            }

            await PublishRecurringOrdersAsync();

            await Task.Delay(delayTime, stoppingToken);
        }

        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("RecurringOrderScannerService background task is stopping.");
        }
    }

    private async Task PublishRecurringOrdersAsync()
    {
        if (logger.IsEnabled(LogLevel.Debug))
        {
            logger.LogDebug("Checking submitted recurring orders");
        }

        var orderIds = await GetSubmittedRecurringOrdersAsync();

        foreach (var orderId in orderIds)
        {
            var confirmEvent = new GracePeriodConfirmedIntegrationEvent(orderId);

            logger.LogInformation(
                "Publishing integration event: {IntegrationEventId} - ({@IntegrationEvent})",
                confirmEvent.Id,
                confirmEvent);

            await eventBus.PublishAsync(confirmEvent);
        }
    }

    private async Task<List<int>> GetSubmittedRecurringOrdersAsync()
    {
        try
        {
            using var connection = await connectionFactory.CreateConnectionAsync();

             const string query = """
                SELECT "id"
                FROM public.orders
                WHERE "is_recurring" = true
                  AND "next_recurrence_date" IS NOT NULL
                  AND "next_recurrence_date" <= CURRENT_TIMESTAMP
                  AND "order_status" = 'Shipped'
                """;

            var ids = await connection.QueryAsync<int>(query);

            return ids.ToList();
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An error occurred while retrieving submitted recurring orders.");
        }

        return new List<int>();
    }
}
