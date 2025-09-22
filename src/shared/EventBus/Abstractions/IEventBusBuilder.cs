using Microsoft.Extensions.DependencyInjection;

namespace EventBus.Abstractions;

public interface IEventBusBuilder
{
    IServiceCollection Services { get; }
}
