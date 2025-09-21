using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;
using Catalog.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class CreateCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public CreateCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var request = _categoryGenerator.Generate();

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var category = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();
        category!.Name.ShouldBe(request.Name);
        response.Headers.Location!.ToString().ShouldContain($"/category/{category.Id}");
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var request = new Create.CreateCategoryRequest { Name = string.Empty };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnConflict_WhenCategoryAlreadyExists()
    {
        // Arrange
        var request = _categoryGenerator.Generate();

        // Act
        var firstResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);

        var secondResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        secondResponse.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var error = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        error!.Status.ShouldBe(409);
        error.Title.ShouldBe(CategoryErrors.NameAlreadyExists.Code);
    }
}