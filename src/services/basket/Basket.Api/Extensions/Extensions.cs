using System.Text.Json.Serialization;
using Basket.Api.IntegrationalEvents.EventHandling;
using Basket.Api.IntegrationalEvents.Events;

namespace Basket.Api.Extensions;

public static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.AddDefaultAuthentication();

        builder.AddRedisClient("redis");

        builder.Services.AddSingleton<IBasketRepository, RedisBasketRepository>();

        builder.AddRabbitMqEventBus("eventbus")
       .AddSubscription<OrderStartedIntegrationEvent, OrderStartedIntegrationEventHandler>()
       .ConfigureJsonOptions(options => options.TypeInfoResolverChain.Add(IntegrationEventContext.Default));
    }
}

[JsonSerializable(typeof(OrderStartedIntegrationEvent))]
internal partial class IntegrationEventContext : JsonSerializerContext
{

}