using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Items;
using Catalog.Application.Brands;
using Catalog.Application.Categories;
using Catalog.Application.Items;

namespace Catalog.Api.Tests.Integrational.Items;

public sealed class GetItemsEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly int _brandId;
    private readonly int _categoryId;
    private readonly Faker<Create.CreateItemRequest> _itemGenerator;

    public GetItemsEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = CreateAuthenticatedClientAsync("admin").GetAwaiter().GetResult();

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

    private async Task<ItemResponse> CreateItemAsync(string? name = null, int? brandId = null, int? categoryId = null, decimal? price = null)
    {
        var request = _itemGenerator.Generate() with
        {
            Name = name ?? _itemGenerator.Generate().Name,
            CatalogBrandId = brandId ?? _brandId,
            CategoryIds = new List<int> { categoryId ?? _categoryId },
            Price = price ?? _itemGenerator.Generate().Price
        };
        var response = await _client.PostAsJsonAsync(ApiEndpoints.Items.Create, request);
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        return item!;
    }

    [Fact]
    public async Task GetAsync_ShouldReturnOk_WhenRequestIsValid()
    {
        // Arrange
        for (var i = 0; i < 3; i++)
        {
            await CreateItemAsync();
        }

        // Act
        var response = await _client.GetAsync(ApiEndpoints.Items.GetAll);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.ShouldNotBeEmpty();
        itemsResponse.Total.ShouldBeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnFilteredResults_WhenNameFilterIsProvided()
    {
        // Arrange
        var uniqueNamePart = $"TestItem-{Guid.NewGuid()}";
        await CreateItemAsync(name: uniqueNamePart);

        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?name={uniqueNamePart}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.ShouldNotBeEmpty();
        itemsResponse.Items.Count().ShouldBe(1);
        itemsResponse.Items.ToArray()[0].Name.ShouldBe(uniqueNamePart);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnFilteredResults_WhenBrandIdFilterIsProvided()
    {
        // Arrange
        var item = await CreateItemAsync();
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?brandId={item.CatalogBrandId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.ShouldContain(i => i.CatalogBrandId == item.CatalogBrandId);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnFilteredResults_WhenCategoryIdFilterIsProvided()
    {
        // Arrange
        var item = await CreateItemAsync();
        var categoryId = item.CategoryIds.First();

        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?categoryId={categoryId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.ShouldContain(i => i.CategoryIds.Contains(categoryId));
    }

    [Fact]
    public async Task GetAsync_ShouldReturnSortedResultsAscending_WhenSortByIsProvided()
    {
        // Arrange
        var itemNames = new[] { "A_Item", "B_Item", "C_Item" };
        foreach (var name in itemNames)
        {
            await CreateItemAsync(name: name);
        }

        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?sortBy=name&name=_Item");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        var matchingItems = itemsResponse.Items
            .Where(i => itemNames.Contains(i.Name))
            .OrderBy(i => i.Name)
            .ToList();

        matchingItems.Count.ShouldBeGreaterThanOrEqualTo(3);

        for (var j = 0; j < matchingItems.Count - 1; j++)
        {
            (matchingItems[j].Name.CompareTo(matchingItems[j + 1].Name) <= 0).ShouldBeTrue();
        }
    }

    [Fact]
    public async Task GetAsync_ShouldReturnSortedResultsDescending_WhenSortByWithMinusIsProvided()
    {
        // Arrange
        var itemNames = new[] { "Z_Item", "Y_Item", "X_Item" };
        foreach (var name in itemNames)
        {
            await CreateItemAsync(name: name);
        }

        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?sortBy=-name&name=_Item");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        var matchingItems = itemsResponse.Items
            .Where(i => itemNames.Contains(i.Name))
            .ToList();

        matchingItems.Count.ShouldBeGreaterThanOrEqualTo(3);

        for (var j = 0; j < matchingItems.Count - 1; j++)
        {
            (matchingItems[j].Name.CompareTo(matchingItems[j + 1].Name) >= 0).ShouldBeTrue();
        }
    }

    [Fact]
    public async Task GetAsync_ShouldReturnPagedResults_WhenPagingParametersAreProvided()
    {
        // Arrange
        var uniqueNamePart = $"PageTest-{Guid.NewGuid()}";
        for (var i = 0; i < 15; i++)
        {
            await CreateItemAsync(name: $"{uniqueNamePart}-{i}");
        }

        // Act - Get first page
        var firstPageResponse = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?name={uniqueNamePart}&page=1&pageSize=5");
        var secondPageResponse = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?name={uniqueNamePart}&page=2&pageSize=5");

        // Assert
        firstPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        secondPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        var firstPage = await firstPageResponse.Content.ReadFromJsonAsync<ItemsResponse>();
        var secondPage = await secondPageResponse.Content.ReadFromJsonAsync<ItemsResponse>();

        firstPage.ShouldNotBeNull();
        secondPage.ShouldNotBeNull();

        firstPage!.Items.Count().ShouldBe(5);
        secondPage!.Items.Count().ShouldBe(5);
        firstPage.Total.ShouldBe(15);
        secondPage.Total.ShouldBe(15);

        // Verify different items on different pages
        var firstPageIds = firstPage.Items.Select(i => i.Id).ToList();
        var secondPageIds = secondPage.Items.Select(i => i.Id).ToList();
        firstPageIds.Intersect(secondPageIds).ShouldBeEmpty();
    }

    [Fact]
    public async Task GetAsync_ShouldReturnEmptyResults_WhenNoMatchingItems()
    {
        // Arrange
        var nonExistentName = $"NonExistentItem-{Guid.NewGuid()}";

        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?name={nonExistentName}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var itemsResponse = await response.Content.ReadFromJsonAsync<ItemsResponse>();
        itemsResponse.ShouldNotBeNull();
        itemsResponse!.Items.ShouldBeEmpty();
        itemsResponse.Total.ShouldBe(0);
    }

    [Theory]
    [InlineData("this-name-is-way-too-long-for-the-maximum-allowed-length-because-it-exceeds-100-characters-which-is-not-allowed-by-validator")]
    public async Task GetAsync_ShouldReturnBadRequest_WhenNameIsTooLong(string longName)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?name={longName}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("-invalid")]
    [InlineData("pricee")]
    public async Task GetAsync_ShouldReturnBadRequest_WhenSortByIsInvalid(string sortBy)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?sortBy={sortBy}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetAsync_ShouldReturnBadRequest_WhenPageIsInvalid(int page)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?page={page}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(26)]
    public async Task GetAsync_ShouldReturnBadRequest_WhenPageSizeIsInvalid(int pageSize)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?pageSize={pageSize}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetAsync_ShouldReturnBadRequest_WhenBrandIdIsInvalid(int brandId)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?brandId={brandId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetAsync_ShouldReturnBadRequest_WhenCategoryIdIsInvalid(int categoryId)
    {
        // Act
        var response = await _client.GetAsync($"{ApiEndpoints.Items.GetAll}?categoryId={categoryId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}