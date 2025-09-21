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

public sealed class CreateItemEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly int _brandId;
    private readonly int _categoryId;
    private readonly Faker<Create.CreateItemRequest> _itemGenerator;

    public CreateItemEndpointTests(CatalogApiFactory factory) : base(factory)
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

    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var request = _itemGenerator.Generate();

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        item.ShouldNotBeNull();
        item!.Name.ShouldBe(request.Name);
        item.Slug.ShouldBe(request.Slug);
        response.Headers.Location!.ToString().ShouldContain($"/items/{item.Id}");
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var request = _itemGenerator.Generate() with { Name = string.Empty };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenSlugIsInvalid()
    {
        // Arrange
        var request = _itemGenerator.Generate() with { Slug = "INVALID SLUG!" };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenPriceIsZeroOrNegative()
    {
        // Arrange
        var requestZero = _itemGenerator.Generate() with { Price = 0 };
        var requestNegative = _itemGenerator.Generate() with { Price = -10 };

        // Act
        var responseZero = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, requestZero);
        var responseNegative = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, requestNegative);

        // Assert
        responseZero.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        responseNegative.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnConflict_WhenSlugAlreadyExists()
    {
        // Arrange
        var request = _itemGenerator.Generate();

        // Act
        var firstResponse = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);

        var secondResponse = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        secondResponse.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var error = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        error!.Status.ShouldBe(409);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenBrandDoesNotExist()
    {
        // Arrange
        var request = _itemGenerator.Generate() with { CatalogBrandId = 999999 };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenCategoryDoesNotExist()
    {
        // Arrange
        var request = _itemGenerator.Generate() with { CategoryIds = new List<int> { 1, 999999 } };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnBadRequest_WhenMaxStockThresholdLessThanRestockThreshold()
    {
        // Arrange
        var request = _itemGenerator.Generate() with { RestockThreshold = 10, MaxStockThreshold = 5 };

        // Act
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}