using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;
using Catalog.Domain.Errors;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class CreateCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public CreateCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = _categoryGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var category = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();
        category!.Name.ShouldBe(request.Name);
        response.Headers.Location!.ToString().ShouldContain(ApiEndpoints.Categories.Get.Replace("{id:int}", category.Id.ToString()));
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = new Create.CreateCategoryRequest { Name = string.Empty };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnConflict_WhenCategoryAlreadyExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = _categoryGenerator.Generate();

        // Act
        var firstResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);

        var secondResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        secondResponse.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var error = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        error!.Status.ShouldBe(409);
        error.Title.ShouldBe(CategoryErrors.NameAlreadyExists.Code);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var request = _categoryGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnForbidden_WhenUserIsTestUser()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var request = _categoryGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}