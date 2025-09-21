using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class GetBrandEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client;
    private readonly Faker<Create.CreateBrandRequest> _brandGenerator = new Faker<Create.CreateBrandRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());

    public GetBrandEndpointTests(CatalogApiFactory factory) : base(factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAsync_ShouldReturnOk_WhenRequestIsValid()
    {
        // Arrange
        for (var i = 0; i < 3; i++)
        {
            var createRequest = _brandGenerator.Generate();
            await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/brand");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var brandsResponse = await response.Content.ReadFromJsonAsync<BrandsResponse>();
        brandsResponse.ShouldNotBeNull();
        brandsResponse!.Items.ShouldNotBeEmpty();
        brandsResponse.Total.ShouldBeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnFilteredResults_WhenNameFilterIsProvided()
    {
        // Arrange
        var uniqueNamePart = $"TestBrand-{Guid.NewGuid()}";
        var createRequest = new Create.CreateBrandRequest { Name = uniqueNamePart };
        await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);

        // Act
        var response = await _client.GetAsync($"api/brand?name={uniqueNamePart}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var brandsResponse = await response.Content.ReadFromJsonAsync<BrandsResponse>();
        brandsResponse.ShouldNotBeNull();
        brandsResponse!.Items.ShouldNotBeEmpty();
        brandsResponse.Items.Count().ShouldBe(1);
        brandsResponse.Items.ToArray()[0].Name.ShouldBe(uniqueNamePart);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnSortedResultsAscending_WhenSortByIsProvided()
    {
        // Arrange
        var brandNames = new[] { "A_Brand", "B_Brand", "C_Brand" };
        foreach (var name in brandNames)
        {
            var createRequest = new Create.CreateBrandRequest { Name = name };
            await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/brand?sortBy=name&name=_Brand");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var brandsResponse = await response.Content.ReadFromJsonAsync<BrandsResponse>();
        brandsResponse.ShouldNotBeNull();
        brandsResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        // Verify ascending order
        for (var i = 0; i < brandNames.Length - 1; i++)
        {
            var matchingItems = brandsResponse.Items
                .Where(b => brandNames.Contains(b.Name))
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
        var brandNames = new[] { "Z_Brand", "Y_Brand", "X_Brand" };
        foreach (var name in brandNames)
        {
            var createRequest = new Create.CreateBrandRequest { Name = name };
            await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        }

        // Act
        var response = await _client.GetAsync("api/brand?sortBy=-name&name=_Brand");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var brandsResponse = await response.Content.ReadFromJsonAsync<BrandsResponse>();
        brandsResponse.ShouldNotBeNull();
        brandsResponse!.Items.Count().ShouldBeGreaterThanOrEqualTo(3);

        // Verify descending order
        var matchingItems = brandsResponse.Items
            .Where(b => brandNames.Contains(b.Name))
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
            var createRequest = new Create.CreateBrandRequest { Name = $"{uniqueNamePart}-{i}" };
            await _client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        }

        // Act - Get first page
        var firstPageResponse = await _client.GetAsync($"api/brand?name={uniqueNamePart}&page=1&pageSize=5");
        var secondPageResponse = await _client.GetAsync($"api/brand?name={uniqueNamePart}&page=2&pageSize=5");

        // Assert
        firstPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        secondPageResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        var firstPage = await firstPageResponse.Content.ReadFromJsonAsync<BrandsResponse>();
        var secondPage = await secondPageResponse.Content.ReadFromJsonAsync<BrandsResponse>();

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
    public async Task GetAsync_ShouldReturnEmptyResults_WhenNoMatchingBrands()
    {
        // Arrange
        var nonExistentName = $"NonExistentBrand-{Guid.NewGuid()}";

        // Act
        var response = await _client.GetAsync($"api/brand?name={nonExistentName}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var brandsResponse = await response.Content.ReadFromJsonAsync<BrandsResponse>();
        brandsResponse.ShouldNotBeNull();
        brandsResponse!.Items.ShouldBeEmpty();
        brandsResponse.Total.ShouldBe(0);
    }
}