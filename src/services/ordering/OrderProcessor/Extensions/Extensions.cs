using System.Text.Json.Serialization;
using EventBus.Extensions;
using OrderProcessor.Events;
using OrderProcessor.Services;
namespace OrderProcessor.Extensions;
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

        builder.Services.AddHostedService<GracePeriodManagerService>();
    }
}

[JsonSerializable(typeof(GracePeriodConfirmedIntegrationEvent))]
internal sealed partial class IntegrationEventContext : JsonSerializerContext;