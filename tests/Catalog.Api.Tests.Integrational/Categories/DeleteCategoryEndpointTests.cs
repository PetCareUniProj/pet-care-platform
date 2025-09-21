using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class DeleteCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public DeleteCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNoContent_WhenCategoryExists()
    {
        // Arrange
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        // Act
        var response = await _client.DeleteAsync($"api/category/{category!.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await _client.DeleteAsync($"api/category/{nonExistentId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenCategoryIsAlreadyDeleted()
    {
        // Arrange
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        // Delete the category first
        await _client.DeleteAsync($"api/category/{category!.Id}");

        // Act - Try to delete it again
        var response = await _client.DeleteAsync($"api/category/{category.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}