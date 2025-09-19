using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Catalog.Application;
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {

        services.AddMediator(
            (MediatorOptions options) =>
            {
                options.Assemblies = [typeof(IAssemblyMarker)];
                options.ServiceLifetime = ServiceLifetime.Scoped;
                options.PipelineBehaviors = [
                    typeof(Abstractions.Behaviors.ValidationBehavior<,>)
                ];
            }
        );

        services.AddValidatorsFromAssembly(typeof(IAssemblyMarker).Assembly, includeInternalTypes: true);

        return services;
    }
}