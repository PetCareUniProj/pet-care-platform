namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class ShipOrderEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
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

    public ShipOrderEndpointTests(OrderingApiFactory factory) : base(factory)
    {
    }

    private async Task<int> CreateFullOrderAsync(HttpClient client)
    {
        // Step 1: Create a draft order
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.EnsureSuccessStatusCode();
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftOrder.ShouldNotBeNull();

        // Step 2: Create an order from the draft
        var createOrderRequest = _orderRequestGenerator.Generate() with { DraftOrderId = draftOrder.Id };
        var orderResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);
        orderResponse.EnsureSuccessStatusCode();
        var order = await orderResponse.Content.ReadFromJsonAsync<OrderResponse>();
        order.ShouldNotBeNull();

        return order.Id;
    }

    [Fact]
    public async Task ShipOrder_ShouldReturnOk_WhenRequestIsValid()
    {
        // Arrange
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var orderId = await CreateFullOrderAsync(adminClient);

        // Act
        var response = await adminClient.PatchAsync(ApiEndpoints.Orders.Ship.Replace("{id:int}", orderId.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ShipOrder_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient(); // Non-authenticated client
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var orderId = await CreateFullOrderAsync(adminClient);

        // Act
        var response = await client.PatchAsync(ApiEndpoints.Orders.Ship.Replace("{id:int}", orderId.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ShipOrder_ShouldReturnForbidden_WhenUserIsNotAdmin()
    {
        // Arrange
        var testClient = await CreateAuthenticatedClientAsync("test");
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var orderId = await CreateFullOrderAsync(adminClient);

        // Act
        var response = await testClient.PatchAsync(ApiEndpoints.Orders.Ship.Replace("{id:int}", orderId.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ShipOrder_ShouldReturnNotFound_WhenOrderDoesNotExist()
    {
        // Arrange
        var adminClient = await CreateAuthenticatedClientAsync("admin");
        var nonExistentOrderId = 99999; // Non-existent order ID

        // Act
        var response = await adminClient.PatchAsync(ApiEndpoints.Orders.Ship.Replace("{id:int}", nonExistentOrderId.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}