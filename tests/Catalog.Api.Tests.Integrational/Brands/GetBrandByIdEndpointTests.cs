using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class GetBrandByIdEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateRequest> _brandGenerator = new Faker<Create.CreateRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetBrandByIdEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnOk_WhenBrandExists()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var createdBrand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        createdBrand.ShouldNotBeNull();

        // Act
        var response = await _client.GetAsync($"api/brands/{createdBrand!.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var retrievedBrand = await response.Content.ReadFromJsonAsync<BrandResponse>();
        retrievedBrand.ShouldNotBeNull();
        retrievedBrand!.Id.ShouldBe(createdBrand.Id);
        retrievedBrand.Name.ShouldBe(createdBrand.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenBrandDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await _client.GetAsync($"api/brands/{nonExistentId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenBrandIsDeleted()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var createdBrand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        createdBrand.ShouldNotBeNull();

        // Delete the brand
        await _client.DeleteAsync($"api/brands/{createdBrand!.Id}");

        // Act
        var response = await _client.GetAsync($"api/brands/{createdBrand.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenIdIsInvalid()
    {
        // Arrange
        var invalidId = "invalid";

        // Act
        var response = await _client.GetAsync($"api/brands/{invalidId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}