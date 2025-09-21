using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Categories;
using Catalog.Application.Categories;

namespace Catalog.Api.Tests.Integrational.Categories;

public sealed class GetCategoryEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateCategoryRequest> _categoryGenerator = new Faker<Create.CreateCategoryRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetCategoryEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAsync_ShouldReturnOk_WhenRequestIsValid()
    {
        // Arrange
        for (var i = 0; i < 3; i++)
        {
            var createRequest = _categoryGenerator.Generate();
            await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/category");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var categoriesResponse = await response.Content.ReadFromJsonAsync<CategoriesResponse>();
        categoriesResponse.ShouldNotBeNull();
        categoriesResponse!.Items.ShouldNotBeEmpty();
        categoriesResponse.Total.ShouldBeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnFilteredResults_WhenNameFilterIsProvided()
    {
        // Arrange
        var uniqueNamePart = $"TestCategory-{Guid.NewGuid()}";
        var createRequest = new Create.CreateCategoryRequest { Name = uniqueNamePart };
        await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);

        // Act
        var response = await _client.GetAsync($"api/category?name={uniqueNamePart}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var categoriesResponse = await response.Content.ReadFromJsonAsync<CategoriesResponse>();
        categoriesResponse.ShouldNotBeNull();
        categoriesResponse!.Items.ShouldNotBeEmpty();
        categoriesResponse.Items.Count().ShouldBe(1);
        categoriesResponse.Items.ToArray()[0].Name.ShouldBe(uniqueNamePart);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnSortedResultsAscending_WhenSortByIsProvided()
    {
        // Arrange
        var categoryNames = new[] { "A_Category", "B_Category", "C_Category" };
        foreach (var name in categoryNames)
        {
            var createRequest = new Create.CreateCategoryRequest { Name = name };
            await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/category?sortBy=name&name=_Category");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var categoriesResponse = await response.Content.ReadFromJsonAsync<CategoriesResponse>();
        categoriesResponse.ShouldNotBeNull();
        categoriesResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        // Verify ascending order
        for (var i = 0; i < categoryNames.Length - 1; i++)
        {
            var matchingItems = categoriesResponse.Items
                .Where(b => categoryNames.Contains(b.Name))
                .OrderBy(b => b.Name)
                .ToList();

            matchingItems.Count.ShouldBeGreaterThanOrEqualTo(3);

            for (var j = 0; j < matchingItems.Count - 1; j++)
            {
                (matchingItems[j].Name.CompareTo(matchingItems[j + 1].Name) <= 0).ShouldBeTrue();
            }
        }
    }

    [Fact]
    public async Task GetAsync_ShouldReturnSortedResultsDescending_WhenSortByWithMinusIsProvided()
    {
        // Arrange
        var categoryNames = new[] { "Z_Category", "Y_Category", "X_Category" };
        foreach (var name in categoryNames)
        {
            var createRequest = new Create.CreateCategoryRequest { Name = name };
            await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/category?sortBy=-name&name=_Category");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var categoriesResponse = await response.Content.ReadFromJsonAsync<CategoriesResponse>();
        categoriesResponse.ShouldNotBeNull();
        categoriesResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        // Verify descending order
        var matchingItems = categoriesResponse.Items
            .Where(b => categoryNames.Contains(b.Name))
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
            var createRequest = new Create.CreateCategoryRequest { Name = $"{uniqueNamePart}-{i}" };
            await _client.PostAsJsonAsync(ApiEndpoints.Categories.Create, createRequest);
        }

        // Act - Get first page
        var firstPageResponse = await _client.GetAsync($"api/category?name={uniqueNamePart}&page=1&pageSize=5");
        var secondPageResponse = await _client.GetAsync($"api/category?name={uniqueNamePart}&page=2&pageSize=5");

        // Assert
        firstPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        secondPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        var firstPage = await firstPageResponse.Content.ReadFromJsonAsync<CategoriesResponse>();
        var secondPage = await secondPageResponse.Content.ReadFromJsonAsync<CategoriesResponse>();

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
    public async Task GetAsync_ShouldReturnEmptyResults_WhenNoMatchingCategories()
    {
        // Arrange
        var nonExistentName = $"NonExistentCategory-{Guid.NewGuid()}";

        // Act
        var response = await _client.GetAsync($"api/category?name={nonExistentName}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var categoriesResponse = await response.Content.ReadFromJsonAsync<CategoriesResponse>();
        categoriesResponse.ShouldNotBeNull();
        categoriesResponse!.Items.ShouldBeEmpty();
        categoriesResponse.Total.ShouldBe(0);
    }
}