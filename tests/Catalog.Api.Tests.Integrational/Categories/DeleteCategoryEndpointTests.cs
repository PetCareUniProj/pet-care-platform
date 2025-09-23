using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class DeleteCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public DeleteCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNoContent_WhenCategoryExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        // Act
        var response = await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", category!.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenCategoryIsAlreadyDeleted()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var category = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        category.ShouldNotBeNull();

        // Delete the category first
        await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", category!.Id.ToString()));

        // Act - Try to delete it again
        var response = await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", category.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var nonExistentId = 1;

        // Act
        var response = await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnForbidden_WhenUserIsTestUser()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var nonExistentId = 1;

        // Act
        var response = await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}