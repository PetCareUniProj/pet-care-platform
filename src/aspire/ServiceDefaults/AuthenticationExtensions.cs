using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

        var identitySection = configuration.GetSection("Identity");
        var clientId = identitySection.GetRequiredValue("ClientId");
        if (!identitySection.Exists())
        {
            return services;
        }

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddKeycloakJwtBearer(
                serviceName: identitySection.GetRequiredValue("ServiceName"),
                realm: identitySection.GetRequiredValue("Realm"),
                options =>
                {

                    if (builder.Environment.IsDevelopment())
                    {
                        options.TokenValidationParameters.ValidAudiences = new[] { "account", clientId };
                        options.RequireHttpsMetadata = false;
                    }
                    else
                    {
                        options.Audience = identitySection.GetRequiredValue("ClientId");

                    }

                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = context =>
                        {
                            var claimsIdentity = context.Principal!.Identity as ClaimsIdentity;
                            var resourceAccess = context.Principal.FindFirst("resource_access")?.Value;
                            if (resourceAccess != null)
                            {
                                var obj = System.Text.Json.JsonDocument.Parse(resourceAccess);
                                if (obj.RootElement.TryGetProperty(clientId, out var catalogApi))
                                {
                                    if (catalogApi.TryGetProperty("roles", out var roles))
                                    {
                                        foreach (var role in roles.EnumerateArray())
                                        {
                                            claimsIdentity!.AddClaim(new Claim(ClaimsIdentity.DefaultRoleClaimType, role.GetString()!));
                                        }
                                    }
                                }
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

        return services;
    }
}