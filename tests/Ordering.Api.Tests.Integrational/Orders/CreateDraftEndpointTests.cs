using System.Net;
using System.Net.Http.Json;
using Bogus;
using Ordering.Api.Endpoints;
using Ordering.Api.Endpoints.Orders;
using Ordering.Application.Models;
using Ordering.Application.Orders;

namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class CreateDraftEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly Faker<BasketItem> _basketItemGenerator;
    private readonly Faker<CreateDraft.CreateOrderDraftRequest> _requestGenerator;

    public CreateDraftEndpointTests(OrderingApiFactory factory) : base(factory)
    {
        _basketItemGenerator = new Faker<BasketItem>()
            .RuleFor(x => x.Id, f => f.Random.Guid().ToString())
            .RuleFor(x => x.ProductId, f => f.Random.Int(1, 1000))
            .RuleFor(x => x.ProductName, f => f.Commerce.ProductName())
            .RuleFor(x => x.UnitPrice, f => f.Random.Decimal(1, 1000))
            .RuleFor(x => x.OldUnitPrice, f => f.Random.Decimal(1, 1000))
            .RuleFor(x => x.Quantity, f => f.Random.Int(1, 10))
            .RuleFor(x => x.PictureUrl, f => f.Internet.Url());

        _requestGenerator = new Faker<CreateDraft.CreateOrderDraftRequest>()
            .CustomInstantiator(f => new CreateDraft.CreateOrderDraftRequest(
                _basketItemGenerator.Generate(f.Random.Int(1, 5))
            ));
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = _requestGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var orderDraft = await response.Content.ReadFromJsonAsync<OrderDraftResponse>();
        orderDraft.ShouldNotBeNull();
        orderDraft!.Id.ShouldBeGreaterThan(0);
        orderDraft.OrderItems.ShouldNotBeEmpty();
        orderDraft.Total.ShouldBeGreaterThan(0);
        response.Headers.Location!.ToString().ShouldContain($"/orders/{orderDraft.Id}");
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnBadRequest_WhenItemsIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var request = new CreateDraft.CreateOrderDraftRequest(Array.Empty<BasketItem>());

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnBadRequest_WhenItemQuantityIsZeroOrNegative()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemWithZeroQuantity = _basketItemGenerator.Generate() with { Quantity = 0 };
        var itemWithNegativeQuantity = _basketItemGenerator.Generate() with { Quantity = -1 };

        var requestZero = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithZeroQuantity });
        var requestNegative = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithNegativeQuantity });

        // Act
        var responseZero = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, requestZero);
        var responseNegative = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, requestNegative);

        // Assert
        responseZero.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        responseNegative.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnBadRequest_WhenItemUnitPriceIsZeroOrNegative()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemWithZeroPrice = _basketItemGenerator.Generate() with { UnitPrice = 0 };
        var itemWithNegativePrice = _basketItemGenerator.Generate() with { UnitPrice = -10 };

        var requestZero = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithZeroPrice });
        var requestNegative = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithNegativePrice });

        // Act
        var responseZero = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, requestZero);
        var responseNegative = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, requestNegative);

        // Assert
        responseZero.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        responseNegative.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnBadRequest_WhenItemProductNameIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemWithEmptyName = _basketItemGenerator.Generate() with { ProductName = string.Empty };
        var request = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithEmptyName });

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnBadRequest_WhenItemIdIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var itemWithEmptyId = _basketItemGenerator.Generate() with { Id = string.Empty };
        var request = new CreateDraft.CreateOrderDraftRequest(new[] { itemWithEmptyId });

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldCalculateCorrectTotal_WhenMultipleItems()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var items = new[]
        {
            _basketItemGenerator.Generate() with { UnitPrice = 10.50m, Quantity = 2 }, // 21.00
            _basketItemGenerator.Generate() with { UnitPrice = 5.25m, Quantity = 3 },  // 15.75
            _basketItemGenerator.Generate() with { UnitPrice = 15.00m, Quantity = 1 }  // 15.00
        };
        var expectedTotal = 51.75m; // 21.00 + 15.75 + 15.00
        var request = new CreateDraft.CreateOrderDraftRequest(items);

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var orderDraft = await response.Content.ReadFromJsonAsync<OrderDraftResponse>();
        orderDraft.ShouldNotBeNull();
        orderDraft!.Total.ShouldBe(expectedTotal);
        orderDraft.OrderItems.Count().ShouldBe(3);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var request = _requestGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldReturnCreated_WhenUserIsTestUser()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var request = _requestGenerator.Generate();

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var orderDraft = await response.Content.ReadFromJsonAsync<OrderDraftResponse>();
        orderDraft.ShouldNotBeNull();
    }

    [Fact]
    public async Task CreateDraftAsync_ShouldPreserveItemProperties_WhenCreatingDraft()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var basketItem = _basketItemGenerator.Generate();
        var request = new CreateDraft.CreateOrderDraftRequest(new[] { basketItem });

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var orderDraft = await response.Content.ReadFromJsonAsync<OrderDraftResponse>();
        orderDraft.ShouldNotBeNull();

        var orderItem = orderDraft!.OrderItems.First();
        orderItem.ProductId.ShouldBe(basketItem.ProductId);
        orderItem.ProductName.ShouldBe(basketItem.ProductName);
        orderItem.UnitPrice.ShouldBe(basketItem.UnitPrice);
        orderItem.Units.ShouldBe(basketItem.Quantity);
        orderItem.PictureUrl.ShouldBe(basketItem.PictureUrl);
    }
}