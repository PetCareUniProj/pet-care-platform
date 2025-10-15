using System.Net;
using System.Net.Http.Json;
using Bogus;
using Ordering.Api.Endpoints;
using Ordering.Api.Endpoints.Orders;
using Ordering.Application.Models;
using Ordering.Application.Orders;

namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class CreateOrderEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly Faker<BasketItem> _basketItemGenerator = new Faker<BasketItem>()
        .RuleFor(x => x.ProductId, faker => faker.Random.Int(1, 1000))
        .RuleFor(x => x.ProductName, faker => faker.Commerce.ProductName())
        .RuleFor(x => x.UnitPrice, faker => faker.Random.Decimal(1, 100))
        .RuleFor(x => x.OldUnitPrice, faker => faker.Random.Decimal(0, 100))
        .RuleFor(x => x.Quantity, faker => faker.Random.Int(1, 10))
        .RuleFor(x => x.PictureUrl, faker => faker.Internet.Url());

    private readonly Faker<Create.CreateOrderRequest> _orderRequestGenerator = new Faker<Create.CreateOrderRequest>()
        .RuleFor(x => x.City, faker => faker.Address.City())
        .RuleFor(x => x.Street, faker => faker.Address.StreetAddress())
        .RuleFor(x => x.State, faker => faker.Address.State())
        .RuleFor(x => x.Country, faker => faker.Address.Country())
        .RuleFor(x => x.ZipCode, faker => faker.Address.ZipCode())
        .RuleFor(x => x.CardNumber, faker => faker.Finance.CreditCardNumber())
        .RuleFor(x => x.CardHolderName, faker => faker.Name.FullName())
        .RuleFor(x => x.CardExpiration, faker => faker.Date.Future())
        .RuleFor(x => x.CardSecurityNumber, faker => faker.Random.String2(3, "0123456789"))
        .RuleFor(x => x.CardTypeId, faker => faker.Random.Int(1, 3))
        .RuleFor(x => x.PaymentMethodId, faker => faker.Random.Int(1, 10));

    public CreateOrderEndpointTests(OrderingApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");

        // Step 1: Create a draft order
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftOrder.ShouldNotBeNull();

        // Step 2: Create an order from the draft
        var createOrderRequest = _orderRequestGenerator.Generate() with
        {
            DraftOrderId = draftOrder.Id
        };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var orderResponse = await response.Content.ReadFromJsonAsync<OrderResponse>();
        orderResponse.ShouldNotBeNull();
        orderResponse!.Id.ShouldBe(draftOrder.Id);
        orderResponse.Total.ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient(); // Non-authenticated client
        var createOrderRequest = _orderRequestGenerator.Generate() with { DraftOrderId = 1 };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnBadRequest_WhenDataIsInvalid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");

        // Step 1: Create a draft order
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftOrder.ShouldNotBeNull();

        // Step 2: Create an order with invalid data
        var createOrderRequest = _orderRequestGenerator.Generate() with
        {
            DraftOrderId = draftOrder.Id,
            City = string.Empty // Invalid city
        };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}