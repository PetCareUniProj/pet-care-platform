using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Items;
using Catalog.Application.Brands;
using Catalog.Application.Categories;
using Catalog.Application.Items;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Items;

public sealed class UpdateItemEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly int _brandId;
    private readonly int _categoryId;
    private readonly Faker<Create.CreateItemRequest> _itemGenerator;

    public UpdateItemEndpointTests(CatalogApiFactory factory) : base(factory)
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

    private async Task<int> CreateItemAsync()
    {
        // Use admin client to create an item
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var request = _itemGenerator.Generate();
        var response = await adminClient.PostAsJsonAsync(ApiEndpoints.Items.Create, request);
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        return item!.Id;
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnOk_WhenDataIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "updated-slug",
            Name = "Updated Name",
            Description = "Updated Description",
            Price = 123.45m,
            PictureFileName = "updated.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 50,
            RestockThreshold = 5,
            MaxStockThreshold = 100,
            OnReorder = true,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        item.ShouldNotBeNull();
        item!.Id.ShouldBe(itemId);
        item.Name.ShouldBe(updateRequest.Name);
        item.Slug.ShouldBe(updateRequest.Slug);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "notfound-slug",
            Name = "Not Found",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", "999999"), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = string.Empty,
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenSlugIsInvalid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "INVALID SLUG!",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenPriceIsZeroOrNegative()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequestZero = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 0,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };
        var updateRequestNegative = updateRequestZero with { Price = -10 };

        // Act
        var responseZero = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequestZero);
        var responseNegative = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequestNegative);

        // Assert
        responseZero.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        responseNegative.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnConflict_WhenSlugAlreadyExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId1 = await CreateItemAsync();
        var itemId2 = await CreateItemAsync();

        // Get item1 details
        var getResponse = await client.GetAsync(ApiEndpoints.Items.Get.Replace("{idOrSlug}", itemId1.ToString()));
        getResponse.EnsureSuccessStatusCode();
        var item1 = await getResponse.Content.ReadFromJsonAsync<ItemResponse>();

        // Try to update item2 with item1's slug
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = item1!.Slug,
            Name = "Another Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId2.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        error!.Status.ShouldBe(409);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenBrandDoesNotExist()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = 999999,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenCategoryDoesNotExist()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { 1, 999999 }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenMaxStockThresholdLessThanRestockThreshold()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 10,
            MaxStockThreshold = 5,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnForbidden_WhenUserIsTestUser()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var itemId = await CreateItemAsync();
        var updateRequest = new Update.UpdateItemRequest
        {
            Slug = "valid-slug",
            Name = "Valid Name",
            Description = "Desc",
            Price = 10,
            PictureFileName = "pic.jpg",
            CatalogBrandId = _brandId,
            AvailableStock = 1,
            RestockThreshold = 1,
            MaxStockThreshold = 10,
            OnReorder = false,
            CategoryIds = new List<int> { _categoryId }
        };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Items.Update.Replace("{id:int}", itemId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}