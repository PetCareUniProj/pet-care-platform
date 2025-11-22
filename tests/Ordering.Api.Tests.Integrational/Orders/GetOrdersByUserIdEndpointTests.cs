namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class GetOrdersByUserIdEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly HttpClient _adminClient;
    private readonly HttpClient _testClient;
    private readonly Faker<BasketItem> _basketItemGenerator;
    private readonly Faker<Create.CreateOrderRequest> _orderRequestGenerator;

    public GetOrdersByUserIdEndpointTests(OrderingApiFactory factory) : base(factory)
    {
        _adminClient = CreateAuthenticatedClientAsync("admin").GetAwaiter().GetResult();
        _testClient = CreateAuthenticatedClientAsync("test").GetAwaiter().GetResult();

        _basketItemGenerator = new Faker<BasketItem>()
            .RuleFor(x => x.ProductId, faker => faker.Random.Int(1, 1000))
            .RuleFor(x => x.ProductName, faker => faker.Commerce.ProductName())
            .RuleFor(x => x.UnitPrice, faker => faker.Random.Decimal(1, 100))
            .RuleFor(x => x.OldUnitPrice, faker => faker.Random.Decimal(0, 100))
            .RuleFor(x => x.Quantity, faker => faker.Random.Int(1, 10))
            .RuleFor(x => x.PictureUrl, faker => faker.Internet.Url());

        _orderRequestGenerator = new Faker<Create.CreateOrderRequest>()
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
    }

    private async Task<int> CreateDraftOrderAsync(HttpClient client)
    {
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.EnsureSuccessStatusCode();
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        return draftOrder!.Id;
    }

    private async Task<int> CreateOrderAsync(HttpClient client, int draftOrderId)
    {
        var createOrderRequest = _orderRequestGenerator.Generate() with { DraftOrderId = draftOrderId };
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);
        response.EnsureSuccessStatusCode();
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        return order!.Id;
    }

    [Fact]
    public async Task GetOrdersByUserId_ShouldReturnOk_WhenAdminRequests()
    {
        // Arrange
        var draftOrderId = await CreateDraftOrderAsync(_testClient);
        var orderId = await CreateOrderAsync(_testClient, draftOrderId);
        var userId = "785ca28e-df64-4bc9-9ed9-be0868494d47";//test user id

        // Act
        var response = await _adminClient.GetAsync(ApiEndpoints.Orders.GetByUserId.Replace("{userId:guid}", userId));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var ordersResponse = await response.Content.ReadFromJsonAsync<OrdersResponse>();
        ordersResponse.ShouldNotBeNull();
        ordersResponse!.Items.ShouldContain(o => o.Id == orderId);
    }

    [Fact]
    public async Task GetOrdersByUserId_ShouldReturnForbidden_WhenUserRequestsOtherUserOrders()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await _testClient.GetAsync(ApiEndpoints.Orders.GetByUserId.Replace("{userId:guid}", userId));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetOrdersByUserId_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await client.GetAsync(ApiEndpoints.Orders.GetByUserId.Replace("{userId:guid}", userId));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetOrdersByUserId_ShouldReturnNotFound_WhenUserHasNoOrders()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        // Act
        var response = await _adminClient.GetAsync(ApiEndpoints.Orders.GetByUserId.Replace("{userId:guid}", userId));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}