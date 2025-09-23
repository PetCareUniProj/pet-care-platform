using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Catalog.Api.Tests.Integrational;

public sealed class KeycloakTokenHelper
{
    private readonly string _tokenEndpoint;
    private const string PublicClientId = "public-client-web";

    public KeycloakTokenHelper(string keycloakBaseUrl)
    {
        _tokenEndpoint = $"{keycloakBaseUrl}/realms/pet-care-platform/protocol/openid-connect/token";
    }

    public async Task<string> GetAdminTokenAsync()
    {
        return await GetTokenAsync("admin", "admin");
    }

    public async Task<string> GetTestUserTokenAsync()
    {
        return await GetTokenAsync("test", "test");
    }

    private async Task<string> GetTokenAsync(string username, string password)
    {
        using var httpClient = new HttpClient();

        var tokenRequest = new FormUrlEncodedContent([
            new("grant_type", "password"),
            new("client_id", PublicClientId),
            new("username", username),
            new("password", password),
            new("scope", "openid profile email ")
        ]);

        using var authRequestContent = tokenRequest;

        using var authRequest = new HttpRequestMessage(HttpMethod.Post, new Uri(_tokenEndpoint));
        authRequest.Content = authRequestContent;

        using var authorizationResponse = await httpClient.SendAsync(authRequest);

        authorizationResponse.EnsureSuccessStatusCode();

        var authToken = await authorizationResponse.Content.ReadFromJsonAsync<AuthToken>();

        return authToken!.AccessToken;
    }
}

internal sealed class AuthToken
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; init; } = default!;
}
