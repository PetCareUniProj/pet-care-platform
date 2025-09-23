using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class CreateBrandEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateBrandRequest> _brandGenerator = new Faker<Create.CreateBrandRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public CreateBrandEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var request = _brandGenerator.Generate();
        var client = await CreateAuthenticatedClientAsync("admin");

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var brand = await response.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();
        brand!.Name.ShouldBe(request.Name);
        response.Headers.Location!.ToString().ShouldContain(ApiEndpoints.Brands.Get.Replace("{id:int}", brand.Id.ToString()));
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var request = _brandGenerator.Generate();
        var client = CreateClient(); // Non-authenticated client

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("   ")]
    [InlineData("a very long brand name that exceeds the maximum allowed length of one hundred characters, which should fail validation because it is too long")]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenNameIsInvalid(string? invalidName)
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = new Create.CreateBrandRequest { Name = invalidName };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnConflict_WhenNameAlreadyExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = _brandGenerator.Generate();

        // Create the brand first
        var firstResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Act - Try to create the same brand again
        var secondResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        secondResponse.StatusCode.ShouldBe(HttpStatusCode.Conflict);
    }
}