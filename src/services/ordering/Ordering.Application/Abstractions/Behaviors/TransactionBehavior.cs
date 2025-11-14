using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ordering.Application.Abstractions.Behaviors;

internal sealed class TransactionBehavior<TMessage, TResponse>(
    IApplicationDbContext dbContext,
    IOrderingIntegrationEventService orderingIntegrationEventService,
    ILogger<TransactionBehavior<TMessage, TResponse>> logger)
    : IPipelineBehavior<TMessage, TResponse>
    where TMessage : IMessage
    where TResponse : class
{
    public async ValueTask<TResponse> Handle(
        TMessage message,
        MessageHandlerDelegate<TMessage, TResponse> next,
        CancellationToken cancellationToken)
    {
        TResponse response = default!;
        var typeName = message.GetType().Name;

        try
        {
            if (dbContext.HasActiveTransaction)
            {
                return await next(message, cancellationToken);
            }

            var strategy = dbContext.Database.CreateExecutionStrategy();

            await strategy.ExecuteAsync(async () =>
            {
                Guid transactionId;
                await using var transaction = await dbContext.BeginTransactionAsync(cancellationToken);
                using (logger.BeginScope(new List<KeyValuePair<string, object>> { new("TransactionContext", transaction.TransactionId) }))
                {
                    logger.LogInformation(
                        "Begin transaction {TransactionId} for {CommandName} ({@Command})",
                        transaction.TransactionId, typeName, message);

                    response = await next(message, cancellationToken);

                    logger.LogInformation(
                        "Commit transaction {TransactionId} for {CommandName}",
                        transaction.TransactionId, typeName);

                    await dbContext.CommitTransactionAsync(transaction, cancellationToken);
                    transactionId = transaction.TransactionId;
                }

                await orderingIntegrationEventService.PublishEventsThroughEventBusAsync(transactionId);

            });

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error handling transaction for {CommandName} ({@Command})", typeName, message);
            throw;
        }
    }
}