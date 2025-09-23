using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.Extensions.Hosting;

public static partial class RabbitMqDependencyInjectionExtensions
{
    private sealed class EventBusBuilder(IServiceCollection services) : IEventBusBuilder
    {
        public IServiceCollection Services => services;
    }
}
