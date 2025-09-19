using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace ServiceDefaults;
public static partial class Extensions
{
    public static IServiceCollection AddSwaggerGenWithAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSwaggerGen(options =>
        {
            var keycloakSection = configuration.GetSection("Keycloak");

            if (keycloakSection.Exists())
            {
                var authority = keycloakSection.GetRequiredValue("Authority");
                var realm = keycloakSection.GetRequiredValue("Realm");

                var scopes = keycloakSection.Exists()
                  ? keycloakSection.GetRequiredSection("Scopes").GetChildren().ToDictionary(p => p.Key, p => p.Value)
                  : new Dictionary<string, string?>();

                var authorizationUrl = $"{authority}/realms/{realm}/protocol/openid-connect/auth";
                var tokenUrl = $"{authority}/realms/{realm}/protocol/openid-connect/token";

                options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {

                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri(authorizationUrl),
                            TokenUrl = new Uri(tokenUrl),
                            Scopes = scopes
                        }
                    },
                    Description = "OAuth2 Authorization Code Flow with PKCE"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "oauth2"
                            }
                        },
                        scopes.Keys.ToArray()
                    }
                });
            }
        });

        return services;
    }
}
