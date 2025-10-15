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
}