using System.Security.Claims;
using System.Text.Json;
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
        IConfiguration configuration = builder.Configuration;

        var identitySection = configuration.GetSection("Identity");
        if (!identitySection.Exists())
        {
            return services;
        }

        var clientId = identitySection.GetRequiredValue("ClientId");
        var url = identitySection.GetRequiredValue("Url");
        var realm = identitySection.GetRequiredValue("Realm");
        var authority = $"{url}/realms/{realm}";
        var audience = identitySection.GetValue<string>("Audience") ?? clientId;

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.Audience = audience;
                options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();

                options.TokenValidationParameters.ValidAudiences = new[] { "account", clientId };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var claimsIdentity = context.Principal!.Identity as ClaimsIdentity;

                        // Add roles from resource_access.{clientId}
                        var resourceAccess = context.Principal.FindFirst("resource_access")?.Value;
                        if (resourceAccess is not null)
                        {
                            using var doc = JsonDocument.Parse(resourceAccess);
                            if (doc.RootElement.TryGetProperty(clientId, out var clientResource))
                            {
                                if (clientResource.TryGetProperty("roles", out var clientRoles))
                                {
                                    foreach (var role in clientRoles.EnumerateArray())
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

