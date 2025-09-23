using System.Net.Http.Headers;

namespace Catalog.Api.Tests.Integrational;

public abstract class BaseIntegrationTest : IClassFixture<CatalogApiFactory>
{
    private readonly CatalogApiFactory _factory;
    private readonly KeycloakTokenHelper _keycloakTokenHelper;

    protected BaseIntegrationTest(CatalogApiFactory factory)
    {
        _factory = factory;
        _keycloakTokenHelper = new KeycloakTokenHelper(factory.KeycloakBaseUrl);
    }

    protected HttpClient CreateClient() => _factory.CreateClient();

    protected async Task<HttpClient> CreateAuthenticatedClientAsync(string username = "admin")
    {
        var client = _factory.CreateClient();
        var token = username.ToLower() switch
        {
            "admin" => await _keycloakTokenHelper.GetAdminTokenAsync(),
            "test" => await _keycloakTokenHelper.GetTestUserTokenAsync(),
            _ => throw new ArgumentException($"Unknown user: {username}")
        };

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}