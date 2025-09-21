using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class DeleteBrandEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateBrandRequest> _brandGenerator = new Faker<Create.CreateBrandRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public DeleteBrandEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNoContent_WhenBrandExists()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var brand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();

        // Act
        var response = await _client.DeleteAsync($"api/brand/{brand!.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenBrandDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await _client.DeleteAsync($"api/brand/{nonExistentId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenBrandIsAlreadyDeleted()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var brand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();

        // Delete the brand first
        await _client.DeleteAsync($"api/brand/{brand!.Id}");

        // Act - Try to delete it again
        var response = await _client.DeleteAsync($"api/brand/{brand.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}