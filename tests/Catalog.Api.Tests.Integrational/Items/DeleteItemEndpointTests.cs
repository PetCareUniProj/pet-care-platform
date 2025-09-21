using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Items;
using Catalog.Application.Brands;
using Catalog.Application.Categories;
using Catalog.Application.Items;

namespace Catalog.Api.Tests.Integrational.Items;

public sealed class DeleteItemEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateItemRequest> _itemGenerator;
    private readonly int _brandId;
    private readonly int _categoryId;

    public DeleteItemEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();

        // Seed a brand
        var brandResponse = _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, new
        {
            Name = "Test Brand " + Guid.NewGuid()
        }).GetAwaiter().GetResult();
        brandResponse.EnsureSuccessStatusCode();
        var brand = brandResponse.Content.ReadFromJsonAsync<BrandResponse>().GetAwaiter().GetResult();
        _brandId = brand!.Id;

        // Seed a category
        var categoryResponse = _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, new
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

    private async Task<int> CreateItemAsync()
    {
        var request = _itemGenerator.Generate();
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        return item!.Id;
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNoContent_WhenItemExists()
    {
        // Arrange
        var itemId = await CreateItemAsync();

        // Act
        var response = await _client.DeleteAsync(ApiEndpoints.Items.Delete.Replace("{id:int}", itemId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999999;

        // Act
        var response = await _client.DeleteAsync(ApiEndpoints.Items.Delete.Replace("{id:int}", nonExistentId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnNotFound_WhenItemIsAlreadyDeleted()
    {
        // Arrange
        var itemId = await CreateItemAsync();

        // Delete the item first
        var firstDelete = await _client.DeleteAsync(ApiEndpoints.Items.Delete.Replace("{id:int}", itemId.ToString()));
        firstDelete.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        // Act - Try to delete it again
        var response = await _client.DeleteAsync(ApiEndpoints.Items.Delete.Replace("{id:int}", itemId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}