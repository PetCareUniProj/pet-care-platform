using Catalog.Infrastructure.Database;
using Catalog.Infrastructure.Time;
using IntegrationEventLogEF.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.Application.Abstractions.Data;
using Ordering.Infrastructure.Database;
using Ordering.Infrastructure.DomainEvents;
using Ordering.Infrastructure.IntegrationalEvents;
using SharedKernel;

namespace Ordering.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration) =>
        services
            .AddServices()
            .AddDatabase(configuration);

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<IDomainEventsDispatcher, DomainEventsDispatcher>();
        services.AddTransient<IIntegrationEventLogService, IntegrationEventLogService<ApplicationDbContext>>();
        services.AddTransient<IOrderingIntegrationEventService, OrderingIntegrationEventService>();
        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("orderingDb");

        services.AddDbContext<ApplicationDbContext>(
            options => options
                .UseNpgsql(connectionString, npgsqlOptions =>
                    npgsqlOptions.MigrationsHistoryTable(HistoryRepository.DefaultTableName, Schemas.Default))
                .UseSnakeCaseNamingConvention());

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }
}