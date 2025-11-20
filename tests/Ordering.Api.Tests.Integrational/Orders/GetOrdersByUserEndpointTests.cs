namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class GetOrdersByUserEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly HttpClient _testClient;

    public GetOrdersByUserEndpointTests(OrderingApiFactory factory) : base(factory)
    {
        _testClient = CreateAuthenticatedClientAsync("test").GetAwaiter().GetResult();
    }

    private async Task<int> CreateOrderAsync(HttpClient client)
    {
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = new Faker<BasketItem>()
                .RuleFor(x => x.ProductId, faker => faker.Random.Int(1, 1000))
                .RuleFor(x => x.ProductName, faker => faker.Commerce.ProductName())
                .RuleFor(x => x.UnitPrice, faker => faker.Random.Decimal(1, 100))
                .RuleFor(x => x.OldUnitPrice, faker => faker.Random.Decimal(0, 100))
                .RuleFor(x => x.Quantity, faker => faker.Random.Int(1, 10))
                .RuleFor(x => x.PictureUrl, faker => faker.Internet.Url())
                .Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.EnsureSuccessStatusCode();
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();

        var createOrderRequest = new Faker<Create.CreateOrderRequest>()
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
            .RuleFor(x => x.PaymentMethodId, faker => faker.Random.Int(1, 10))
            .Generate() with
        { DraftOrderId = draftOrder!.Id };

        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);
        response.EnsureSuccessStatusCode();
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        return order!.Id;
    }

    [Fact]
    public async Task GetOrdersByUser_ShouldReturnOk_WhenUserRequestsOwnOrders()
    {
        // Arrange
        var orderId = await CreateOrderAsync(_testClient);

        // Act
        var response = await _testClient.GetAsync(ApiEndpoints.Orders.GetByUser);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var ordersResponse = await response.Content.ReadFromJsonAsync<OrdersResponse>();
        ordersResponse.ShouldNotBeNull();
        ordersResponse!.Items.ShouldContain(o => o.Id == orderId);
    }

    [Fact]
    public async Task GetOrdersByUser_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Orders.GetByUser);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetOrdersByUser_ShouldReturnNotFound_WhenUserHasNoOrders()
    {
        // Act
        var response = await _testClient.GetAsync(ApiEndpoints.Orders.GetByUser);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}