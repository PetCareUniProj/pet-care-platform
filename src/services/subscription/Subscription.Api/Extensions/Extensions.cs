using System.Reflection;
using Asp.Versioning;
using EventBus.Abstractions;
using EventBus.Extensions;
using Microsoft.OpenApi.Models;
using Subscription.Api.Auth;
using Subscription.Api.Infrastructure;
using Subscription.Application;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.IntegrationalEvents.Events;
using Subscription.Application.IntegrationalEvents.Handlers;
using Subscription.Infrastructure;
using Subscription.Infrastructure.Database;
using ServiceDefaults;
namespace Subscription.Api.Extensions;

internal static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        builder.AddDefaultAuthentication();
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AuthConstants.AdminUserPolicyName,
                policy => policy.RequireRole(AuthConstants.AdminUserRoleName));
        });
        services.AddHttpContextAccessor();
        services.AddTransient<IIdentityService, IdentityService>();

        builder.Services
            .AddApplication()
            .AddInfrastructure(configuration);
        services.AddMigration<ApplicationDbContext, ApplicationDbContextSeed>();

        builder.AddRabbitMqEventBus("eventbus")
            .AddEventBusSubscriptions();

        services.ConfigureOpenApi(configuration);
        // Exception Handling
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        // Endpoints
        services.AddEndpoints(Assembly.GetExecutingAssembly());
    }

    private static IServiceCollection ConfigureOpenApi(this IServiceCollection services, IConfiguration configuration)
    {
        // API Versioning
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1.0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new MediaTypeApiVersionReader("api-version");
        }).AddApiExplorer();

        // OpenAPI/Swagger
        var identitySection = configuration.GetSection("Identity");
        if (!identitySection.Exists())
        {
            return services;
        }

        var url = identitySection.GetRequiredValue("Url");
        var realm = identitySection.GetRequiredValue("Realm");
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                var securityScheme = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            // localhost for the user interaction
                            AuthorizationUrl = new Uri($"{url}/realms/{realm}/protocol/openid-connect/auth"),
                            // keycloak for the proxy
                            TokenUrl = new Uri($"http://keycloak/realms/{realm}/protocol/openid-connect/token")
                        }
                    }
                };
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes.Add("oauth2", securityScheme);

                var securityRequirement = new OpenApiSecurityRequirement { [securityScheme] = [] };
                document.SecurityRequirements = [securityRequirement];

                return Task.CompletedTask;
            });
        });
        services.AddEndpointsApiExplorer();

        return services;
    }

    private static void AddEventBusSubscriptions(this IEventBusBuilder eventBus)
    {
        eventBus.AddSubscription<GracePeriodConfirmedIntegrationEvent, GracePeriodConfirmedIntegrationEventHandler>();
        eventBus.AddSubscription<SubscriptionStockConfirmedIntegrationEvent, SubscriptionStockConfirmedIntegrationEventHandler>();
        eventBus.AddSubscription<SubscriptionStockRejectedIntegrationEvent, SubscriptionStockRejectedIntegrationEventHandler>();
        eventBus.AddSubscription<SubscriptionPaymentFailedIntegrationEvent, SubscriptionPaymentFailedIntegrationEventHandler>();
        eventBus.AddSubscription<SubscriptionPaymentSucceededIntegrationEvent, SubscriptionPaymentSucceededIntegrationEventHandler>();
    }
}


