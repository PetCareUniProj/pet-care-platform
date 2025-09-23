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
            var identitySection = configuration.GetSection("Identity");

            if (identitySection.Exists())
            {
                var serviceName = identitySection.GetRequiredValue("ServiceName");
                var realm = identitySection.GetRequiredValue("Realm");
                var authority = identitySection.GetAuthorityUri(realm);
                var scopes = identitySection.Exists()
                  ? identitySection.GetRequiredSection("Scopes").GetChildren().ToDictionary(p => p.Key, p => p.Value)
                  : new Dictionary<string, string?>();

                var authorizationUrl = $"{authority}/protocol/openid-connect/auth";
                var tokenUrl = $"{authority}/protocol/openid-connect/token";

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
    private static string GetAuthorityUri(
    this IConfiguration configuration,
    string realm)
    {
        var serviceUrl = configuration.GetRequiredValue("Url");

        return $"{serviceUrl}/realms/{realm}";
    }
}
