using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ServiceDefaults;
public static class AuthenticationExtensions
{
    public static IServiceCollection AddDefaultAuthentication(this IHostApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;

        var keycloakSection = configuration.GetSection("Keycloak");

        if (!keycloakSection.Exists())
        {
            return services;
        }

        services.AddAuthentication()
            .AddKeycloakJwtBearer(
                serviceName: keycloakSection.GetRequiredValue("ServiceName"),
                realm: keycloakSection.GetRequiredValue("Realm"),
                options =>
                {
                    options.Audience = keycloakSection.GetRequiredValue("Audience");

                    if (builder.Environment.IsDevelopment())
                    {
                        options.RequireHttpsMetadata = false;
                    }
                });

        services.AddAuthorization();

        return services;
    }
}