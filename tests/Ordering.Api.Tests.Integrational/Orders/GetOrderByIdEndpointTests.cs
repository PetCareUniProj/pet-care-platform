namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class GetOrderByIdEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly HttpClient _adminClient;
    private readonly HttpClient _testClient;

    public GetOrderByIdEndpointTests(OrderingApiFactory factory) : base(factory)
    {
        _adminClient = CreateAuthenticatedClientAsync("admin").GetAwaiter().GetResult();
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
    public async Task GetOrderById_ShouldReturnOk_WhenAdminRequests()
    {
        // Arrange
        var orderId = await CreateOrderAsync(_testClient);

        // Act
        var response = await _adminClient.GetAsync(ApiEndpoints.Orders.GetById.Replace("{id:int}", orderId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var orderResponse = await response.Content.ReadFromJsonAsync<OrderResponse>();
        orderResponse.ShouldNotBeNull();
        orderResponse!.Id.ShouldBe(orderId);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnNotFound_WhenUserRequestsOtherUserOrder()
    {
        // Arrange
        var orderId = await CreateOrderAsync(_adminClient);

        // Act
        var response = await _testClient.GetAsync(ApiEndpoints.Orders.GetById.Replace("{id:int}", orderId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var orderId = 1;

        // Act
        var response = await client.GetAsync(ApiEndpoints.Orders.GetById.Replace("{id:int}", orderId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnNotFound_WhenOrderDoesNotExist()
    {
        // Arrange
        var nonExistentOrderId = 9999;

        // Act
        var response = await _adminClient.GetAsync(ApiEndpoints.Orders.GetById.Replace("{id:int}", nonExistentOrderId.ToString()));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}