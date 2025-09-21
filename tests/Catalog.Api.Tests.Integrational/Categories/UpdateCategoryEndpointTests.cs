using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;
using Catalog.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class UpdateCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateCategoryRequest> _createCategoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());
    private readonly Faker<Update.UpdateCategoryRequest> _updateCategoryGenerator = new Faker<Update.UpdateCategoryRequest>()
        .RuleFor(x => x.NewName, faker => faker.Company.CompanyName());

    public UpdateCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnOk_WhenDataIsValid()
    {
        // Arrange
        var createRequest = _createCategoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        var updateRequest = _updateCategoryGenerator.Generate();

        // Act
        var response = await _client.PutAsJsonAsync($"api/category/{category!.Id}", updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var updatedCategory = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        updatedCategory.ShouldNotBeNull();
        updatedCategory!.Id.ShouldBe(category.Id);
        updatedCategory.Name.ShouldBe(updateRequest.NewName);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var createRequest = _createCategoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        var updateRequest = new Update.UpdateCategoryRequest { NewName = string.Empty };

        // Act
        var response = await _client.PutAsJsonAsync($"api/category/{category!.Id}", updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999; // Using a large number that's unlikely to exist
        var updateRequest = _updateCategoryGenerator.Generate();

        // Act
        var response = await _client.PutAsJsonAsync($"api/category/{nonExistentId}", updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnConflict_WhenNameAlreadyExists()
    {
        // Arrange
        // Create first category
        var firstCategoryRequest = _createCategoryGenerator.Generate();
        var firstCategoryResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, firstCategoryRequest);
        var firstCategory = await firstCategoryResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        firstCategory.ShouldNotBeNull();

        // Create second category
        var secondCategoryRequest = _createCategoryGenerator.Generate();
        var secondCategoryResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, secondCategoryRequest);
        var secondCategory = await secondCategoryResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        secondCategory.ShouldNotBeNull();

        // Try to update second category with first category's name
        var updateRequest = new Update.UpdateCategoryRequest { NewName = firstCategory!.Name };

        // Act
        var response = await _client.PutAsJsonAsync($"api/category/{secondCategory!.Id}", updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problem.ShouldNotBeNull();
        problem!.Status.ShouldBe(409);
        problem.Title.ShouldBe(CategoryErrors.NameAlreadyExists.Code);
    }
}