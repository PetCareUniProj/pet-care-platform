namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class CancelOrderEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly Faker<BasketItem> _basketItemGenerator = new Faker<BasketItem>()
        .RuleFor(x => x.ProductId, faker => faker.Random.Int(1, 1000))
        .RuleFor(x => x.ProductName, faker => faker.Commerce.ProductName())
        .RuleFor(x => x.UnitPrice, faker => faker.Random.Decimal(1, 100))
        .RuleFor(x => x.OldUnitPrice, faker => faker.Random.Decimal(0, 100))
        .RuleFor(x => x.Quantity, faker => faker.Random.Int(1, 10))
        .RuleFor(x => x.PictureUrl, faker => faker.Internet.Url());

    public CancelOrderEndpointTests(OrderingApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CancelOrder_ShouldReturnNoContent_WhenRequestIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");

        // Step 1: Create a draft order
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftOrder.ShouldNotBeNull();

        // Step 2: Cancel the order using the draft order ID
        var response = await client.PostAsync(ApiEndpoints.Orders.Cancel.Replace("{id:int}", draftOrder.Id.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task CancelOrder_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var client = CreateClient(); // Non-authenticated client

        // Step 1: Create a draft order
        var authenticatedClient = await CreateAuthenticatedClientAsync("test");
        var draftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = _basketItemGenerator.Generate(3)
        };
        var draftResponse = await authenticatedClient.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, draftRequest);
        draftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var draftOrder = await draftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftOrder.ShouldNotBeNull();

        // Step 2: Attempt to cancel the order without authentication
        var response = await client.PostAsync(ApiEndpoints.Orders.Cancel.Replace("{id:int}", draftOrder.Id.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CancelOrder_ShouldReturnBadRequest_WhenOrderIdIsInvalid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var invalidOrderId = -1; // Invalid order ID

        // Act
        var response = await client.PostAsync(ApiEndpoints.Orders.Cancel.Replace("{id:int}", invalidOrderId.ToString()), null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}