using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Items;
using Catalog.Application.Brands;
using Catalog.Application.Categories;
using Catalog.Application.Items;

namespace Catalog.Api.Tests.Integrational.Items;

public sealed class GetItemByIdOrSlugEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly int _brandId;
    private readonly int _categoryId;
    private readonly Faker<Create.CreateItemRequest> _itemGenerator;

    public GetItemByIdOrSlugEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        // Create an authenticated client for seeding data
        var adminClient = CreateAuthenticatedClientAsync("admin").GetAwaiter().GetResult();

        // Seed a brand
        var brandResponse = adminClient.PostAsJsonAsync(ApiEndpoints.Brands.Create, new
        {
            Name = "Test Brand " + Guid.NewGuid()
        }).GetAwaiter().GetResult();
        brandResponse.EnsureSuccessStatusCode();
        var brand = brandResponse.Content.ReadFromJsonAsync<BrandResponse>().GetAwaiter().GetResult();
        _brandId = brand!.Id;

        // Seed a category
        var categoryResponse = adminClient.PostAsJsonAsync(ApiEndpoints.Categories.Create, new
        {
            Name = "Test Category " + Guid.NewGuid()
        }).GetAwaiter().GetResult();
        categoryResponse.EnsureSuccessStatusCode();
        var category = categoryResponse.Content.ReadFromJsonAsync<CategoryResponse>().GetAwaiter().GetResult();
        _categoryId = category!.Id;

        // Setup item generator with seeded IDs
        _itemGenerator = new Faker<Create.CreateItemRequest>()
            .RuleFor(x => x.Slug, f => f.Random.AlphaNumeric(10).ToLower())
            .RuleFor(x => x.Name, f => f.Commerce.ProductName())
            .RuleFor(x => x.Description, f => f.Commerce.ProductDescription())
            .RuleFor(x => x.Price, f => f.Random.Decimal(1, 1000))
            .RuleFor(x => x.PictureFileName, f => f.System.FileName("jpg"))
            .RuleFor(x => x.CatalogBrandId, _brandId)
            .RuleFor(x => x.AvailableStock, f => f.Random.Int(0, 100))
            .RuleFor(x => x.RestockThreshold, f => f.Random.Int(0, 10))
            .RuleFor(x => x.MaxStockThreshold, f => f.Random.Int(10, 200))
            .RuleFor(x => x.OnReorder, f => f.Random.Bool())
            .RuleFor(x => x.CategoryIds, _ => new List<int> { _categoryId });
    }

    private async Task<ItemResponse> CreateItemAsync()
    {
        // Use admin client to create an item
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var request = _itemGenerator.Generate();
        var response = await adminClient.PostAsJsonAsync(ApiEndpoints.Items.Create, request);
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        return item!;
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnOk_WhenItemExists_ById()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createdItem = await CreateItemAsync();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var retrievedItem = await response.Content.ReadFromJsonAsync<ItemResponse>();
        retrievedItem.ShouldNotBeNull();
        retrievedItem!.Id.ShouldBe(createdItem.Id);
        retrievedItem.Slug.ShouldBe(createdItem.Slug);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnOk_WhenItemExists_BySlug()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createdItem = await CreateItemAsync();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Slug));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var retrievedItem = await response.Content.ReadFromJsonAsync<ItemResponse>();
        retrievedItem.ShouldNotBeNull();
        retrievedItem!.Id.ShouldBe(createdItem.Id);
        retrievedItem.Slug.ShouldBe(createdItem.Slug);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnNotFound_WhenItemDoesNotExist_ById()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var nonExistentId = 999999;

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnNotFound_WhenItemDoesNotExist_BySlug()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var nonExistentSlug = "non-existent-slug-12345";

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", nonExistentSlug));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnNotFound_WhenItemIsDeleted()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createdItem = await CreateItemAsync();
        var deleteResponse = await client.DeleteAsync(ApiEndpoints.Items.Delete.Replace("{id:int}", createdItem.Id.ToString()));
        deleteResponse.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        // Act
        var responseById = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Id.ToString()));
        var responseBySlug = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Slug));

        // Assert
        responseById.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        responseBySlug.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnOk_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var createdItem = await CreateItemAsync();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetByIdOrSlugAsync_ShouldReturnOk_WhenUserIsTestUser()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var createdItem = await CreateItemAsync();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", createdItem.Id.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var retrievedItem = await response.Content.ReadFromJsonAsync<ItemResponse>();
        retrievedItem.ShouldNotBeNull();
        retrievedItem!.Id.ShouldBe(createdItem.Id);
    }
}