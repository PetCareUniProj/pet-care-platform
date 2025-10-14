using System.Net;
using System.Net.Http.Json;
using Ordering.Api.Endpoints;
using Ordering.Application.Buyers.GetCardTypes;

namespace Ordering.Api.Tests.Integrational.Orders.CardTypes;

public sealed class GetCardTypesEndpointTests : BaseIntegrationTest, IClassFixture<OrderingApiFactory>
{
    public GetCardTypesEndpointTests(OrderingApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetCardTypesAsync_ShouldReturnOk_WhenCalled()
    {
        // Arrange
        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Orders.GetCardTypes);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var cardTypes = await response.Content.ReadFromJsonAsync<List<CardTypeResponse>>();
        cardTypes.ShouldNotBeNull();
        cardTypes.ShouldNotBeEmpty();
    }

    [Fact]
    public async Task GetCardTypesAsync_ShouldReturnValidCardTypes_WhenCalled()
    {
        // Arrange
        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Orders.GetCardTypes);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var cardTypes = await response.Content.ReadFromJsonAsync<List<CardTypeResponse>>();
        cardTypes.ShouldNotBeNull();

        foreach (var cardType in cardTypes!)
        {
            cardType.Id.ShouldBeGreaterThan(0);
            cardType.Name.ShouldNotBeNullOrWhiteSpace();
        }
    }

    [Fact]
    public async Task GetCardTypesAsync_ShouldReturnConsistentResults_WhenCalledMultipleTimes()
    {
        // Arrange
        var anonClient = CreateClient();

        // Act
        var response1 = await anonClient.GetAsync(ApiEndpoints.Orders.GetCardTypes);
        var response2 = await anonClient.GetAsync(ApiEndpoints.Orders.GetCardTypes);

        // Assert
        response1.StatusCode.ShouldBe(HttpStatusCode.OK);
        response2.StatusCode.ShouldBe(HttpStatusCode.OK);

        var cardTypes1 = await response1.Content.ReadFromJsonAsync<List<CardTypeResponse>>();
        var cardTypes2 = await response2.Content.ReadFromJsonAsync<List<CardTypeResponse>>();

        cardTypes1.ShouldNotBeNull();
        cardTypes2.ShouldNotBeNull();
        cardTypes1!.Count.ShouldBe(cardTypes2!.Count);

        for (var i = 0; i < cardTypes1.Count; i++)
        {
            cardTypes1[i].Id.ShouldBe(cardTypes2[i].Id);
            cardTypes1[i].Name.ShouldBe(cardTypes2[i].Name);
        }
    }

    [Fact]
    public async Task GetCardTypesAsync_ShouldAllowAnonymousAccess_WhenCalled()
    {
        // Arrange
        var anonClient = CreateClient();

        // Act
        var response = await anonClient.GetAsync(ApiEndpoints.Orders.GetCardTypes);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var cardTypes = await response.Content.ReadFromJsonAsync<List<CardTypeResponse>>();
        cardTypes.ShouldNotBeNull();
    }
}