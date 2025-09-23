using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class GetBrandByIdEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateBrandRequest> _brandGenerator = new Faker<Create.CreateBrandRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetBrandByIdEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnOk_WhenBrandExists()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var createResponse = await adminClient.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var createdBrand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        createdBrand.ShouldNotBeNull();

        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Brands.Get.Replace("{id:int}", createdBrand!.Id.ToString()));

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
        var anonClient = CreateClient();
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Brands.Get.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenBrandIsDeleted()
    {
        // Arrange
        var createRequest = _brandGenerator.Generate();
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var createResponse = await adminClient.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var createdBrand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        createdBrand.ShouldNotBeNull();

        await adminClient.DeleteAsync(ApiEndpoints.Brands.Delete.Replace("{id:int}", createdBrand!.Id.ToString()));

        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Brands.Get.Replace("{id:int}", createdBrand.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenIdIsInvalid()
    {
        // Arrange
        var anonClient = CreateClient();
        var invalidId = "invalid";

        // Act
        var response = await anonClient.GetAsync($"api/brand/{invalidId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}