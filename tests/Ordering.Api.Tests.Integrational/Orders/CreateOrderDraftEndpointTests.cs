using System.Net;
using System.Net.Http.Json;
using Bogus;
using Ordering.Api.Endpoints;
using Ordering.Api.Endpoints.Orders;
using Ordering.Application.Models;
using Ordering.Application.Orders;

namespace Ordering.Api.Tests.Integrational.Orders;

public sealed class CreateOrderDraftEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    private readonly Faker<BasketItem> _basketItemGenerator = new Faker<BasketItem>()
        .RuleFor(x => x.ProductId, faker => faker.Random.Int(1, 1000))
        .RuleFor(x => x.ProductName, faker => faker.Commerce.ProductName())
        .RuleFor(x => x.UnitPrice, faker => faker.Random.Decimal(1, 100))
        .RuleFor(x => x.OldUnitPrice, faker => faker.Random.Decimal(0, 100))
        .RuleFor(x => x.Quantity, faker => faker.Random.Int(1, 10))
        .RuleFor(x => x.PictureUrl, faker => faker.Internet.Url());

    public CreateOrderDraftEndpointTests(OrderingApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateDraft_ShouldReturnCreated_WhenDataIsValid()
    {
        // Arrange
        var request = new CreateDraft.CreateOrderDraftRequest
        {
            Items = _basketItemGenerator.Generate(3)
        };
        var client = await CreateAuthenticatedClientAsync("test");

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var draftResponse = await response.Content.ReadFromJsonAsync<OrderDraftResponse>();
        draftResponse.ShouldNotBeNull();
        draftResponse!.OrderItems.Count().ShouldBe(3);
        draftResponse.Total.ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task CreateDraft_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var request = new CreateDraft.CreateOrderDraftRequest
        {
            Items = _basketItemGenerator.Generate(3)
        };
        var client = CreateClient(); // Non-authenticated client

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateDraft_ShouldReturnBadRequest_WhenItemsAreEmpty()
    {
        // Arrange
        var request = new CreateDraft.CreateOrderDraftRequest
        {
            Items = Enumerable.Empty<BasketItem>()
        };
        var client = await CreateAuthenticatedClientAsync("test");

        // Act
        var response = await client.PostAsJsonAsync(ApiEndpoints.Orders.CreateDraft, request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}