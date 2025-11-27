using System.Text.Json.Serialization;
using EventBus.Extensions;
using SubscriptionProcessor.Events;
using SubscriptionProcessor.Services;

namespace SubscriptionProcessor.Extensions;

public static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.AddRabbitMqEventBus("eventbus")
               .ConfigureJsonOptions(options => options.TypeInfoResolverChain.Add(IntegrationEventContext.Default));

        builder.AddNpgsqlDataSource("orderingDb");
        builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();

        builder.Services.AddOptions<BackgroundTaskOptions>()
            .BindConfiguration(nameof(BackgroundTaskOptions));

        builder.Services.AddHostedService<RecurringOrderActivationService>();
    }
}

    [JsonSerializable(typeof(RecurringOrderReadyEvent))]
internal sealed partial class IntegrationEventContext : JsonSerializerContext;
