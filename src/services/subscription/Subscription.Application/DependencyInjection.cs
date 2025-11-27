using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Subscription.Application;
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {

        services.AddMediator(
            (options) =>
            {
                options.Assemblies = [typeof(IAssemblyMarker)];
                options.ServiceLifetime = ServiceLifetime.Scoped;
                options.PipelineBehaviors = [
                    typeof(ValidationBehavior<,>),
                    typeof(TransactionBehavior<,>)
                ];
            }
        );
        services.Scan(scan => scan.FromAssembliesOf(typeof(IAssemblyMarker))
        .AddClasses(classes => classes.AssignableTo(typeof(IDomainEventHandler<>)), publicOnly: false)
        .AsImplementedInterfaces()
        .WithScopedLifetime());
        services.AddValidatorsFromAssembly(typeof(IAssemblyMarker).Assembly, includeInternalTypes: true);

        return services;
    }
}
