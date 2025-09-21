using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class GetCategoryByIdEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetCategoryByIdEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnOk_WhenCategoryExists()
    {
        // Arrange
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        createdCategory.ShouldNotBeNull();

        // Act
        var response = await _client.GetAsync($"api/category/{createdCategory!.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var retrievedCategory = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        retrievedCategory.ShouldNotBeNull();
        retrievedCategory!.Id.ShouldBe(createdCategory.Id);
        retrievedCategory.Name.ShouldBe(createdCategory.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await _client.GetAsync($"api/category/{nonExistentId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenCategoryIsDeleted()
    {
        // Arrange
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        createdCategory.ShouldNotBeNull();

        // Delete the category
        await _client.DeleteAsync($"api/category/{createdCategory!.Id}");

        // Act
        var response = await _client.GetAsync($"api/category/{createdCategory.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenIdIsInvalid()
    {
        // Arrange
        var invalidId = "invalid";

        // Act
        var response = await _client.GetAsync($"api/category/{invalidId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}