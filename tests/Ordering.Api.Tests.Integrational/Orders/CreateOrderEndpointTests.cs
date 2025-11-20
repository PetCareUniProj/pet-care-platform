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

        // Step 1: Create a non-recurring draft order
        var nonRecurringDraftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = false,
            Items = _basketItemGenerator.Generate(3)
        };
        var nonRecurringDraftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, nonRecurringDraftRequest);
        nonRecurringDraftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var nonRecurringDraftOrder = await nonRecurringDraftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        nonRecurringDraftOrder.ShouldNotBeNull();

        // Step 2: Create an order from the non-recurring draft
        var createOrderRequest = _orderRequestGenerator.Generate() with
        {
            DraftOrderId = nonRecurringDraftOrder.Id
        };
        var nonRecurringResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert for non-recurring order
        nonRecurringResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var nonRecurringOrderResponse = await nonRecurringResponse.Content.ReadFromJsonAsync<OrderResponse>();
        nonRecurringOrderResponse.ShouldNotBeNull();
        nonRecurringOrderResponse!.Id.ShouldBe(nonRecurringDraftOrder.Id);
        nonRecurringOrderResponse.IsRecurring.ShouldBeFalse();

        // Step 3: Create a recurring draft order
        var recurringDraftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = true,
            RecurrenceInterval = TimeSpan.FromDays(7),
            Items = _basketItemGenerator.Generate(3)
        };
        var recurringDraftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, recurringDraftRequest);
        recurringDraftResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var recurringDraftOrder = await recurringDraftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        recurringDraftOrder.ShouldNotBeNull();

        // Step 4: Create an order from the recurring draft
        createOrderRequest = _orderRequestGenerator.Generate() with
        {
            DraftOrderId = recurringDraftOrder.Id
        };
        var recurringResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert for recurring order
        recurringResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        var recurringOrderResponse = await recurringResponse.Content.ReadFromJsonAsync<OrderResponse>();
        recurringOrderResponse.ShouldNotBeNull();
        recurringOrderResponse!.Id.ShouldBe(recurringDraftOrder.Id);
        recurringOrderResponse.IsRecurring.ShouldBeTrue();
        recurringOrderResponse.RecurrenceInterval.ShouldBe(TimeSpan.FromDays(7));
        recurringOrderResponse.NextRecurrenceDate.ShouldNotBeNull();
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnBadRequest_WhenDataIsInvalid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");

        // Step 1: Create a draft order with invalid recurrence interval
        var invalidDraftRequest = new CreateDraft.CreateOrderDraftRequest
        {
            IsRecurring = true,
            RecurrenceInterval = TimeSpan.Zero, // Invalid interval
            Items = _basketItemGenerator.Generate(3)
        };
        var invalidDraftResponse = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, invalidDraftRequest);
        invalidDraftResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var invalidDraftOrder = await invalidDraftResponse.Content.ReadFromJsonAsync<OrderDraftResponse>();
        invalidDraftOrder.ShouldNotBeNull();

        // Step 2: Attempt to create an order from the invalid draft
        var createOrderRequest = _orderRequestGenerator.Generate() with
        {
            DraftOrderId = invalidDraftOrder.Id
        };

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.Create, createOrderRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
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
}