using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;
using Catalog.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class CreateBrandEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateRequest> _brandGenerator = new Faker<Create.CreateRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public CreateBrandEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var request = _brandGenerator.Generate();

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var brand = await response.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();
        brand!.Name.ShouldBe(request.Name);
        response.Headers.Location!.ToString().ShouldContain($"/brands/{brand.Id}");
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var request = new Create.CreateRequest { Name = string.Empty };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnConflict_WhenBrandAlreadyExists()
    {
        // Arrange
        var request = _brandGenerator.Generate();

        // Act
        var firstResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);

        var secondResponse = await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, request);

        // Assert
        secondResponse.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var error = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        error!.Status.ShouldBe(409);
        error.Title.ShouldBe(BrandErrors.NameAlreadyExists.Code);
    }
}