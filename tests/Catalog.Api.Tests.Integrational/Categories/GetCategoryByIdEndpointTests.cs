using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class GetCategoryByIdEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetCategoryByIdEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnOk_WhenCategoryExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        createdCategory.ShouldNotBeNull();

        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Categories.Get.Replace("{id:int}", createdCategory!.Id.ToString()));

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
        var anonClient = CreateClient();
        var nonExistentId = 999999; // Using a large number that's unlikely to exist

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Categories.Get.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNotFound_WhenCategoryIsDeleted()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _categoryGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        createdCategory.ShouldNotBeNull();

        await client.DeleteAsync(ApiEndpoints.Categories.Delete.Replace("{id:int}", createdCategory!.Id.ToString()));

        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Categories.Get.Replace("{id:int}", createdCategory.Id.ToString()));

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
        var response = await anonClient.GetAsync(ApiEndpoints.Categories.Get.Replace("{id:int}", invalidId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}