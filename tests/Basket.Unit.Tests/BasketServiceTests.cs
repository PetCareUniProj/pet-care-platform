using System.Security.Claims;
using Basket.Api.Grpc;
using Basket.Api.Model;
using Basket.Api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Shouldly;
using BasketItem = Basket.Api.Model.BasketItem;

namespace Basket.Unit.Tests;

public sealed class BasketServiceTests
{
    [Fact]
    public async Task GetBasket_ShouldReturnEmpty_WhenNoUser()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        var service = new BasketService(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        serverCallContext.SetUserState("__HttpContext", new DefaultHttpContext());

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetBasket_ShouldReturnItems_WhenUserIdIsValid()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        var items = new List<BasketItem> { new BasketItem { Id = "some-id" } };
        mockRepository.GetBasketAsync("1")
            .Returns(Task.FromResult(new CustomerBasket { BuyerId = "1", Items = items })!);
        var service = new BasketService(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("sub", "1") }));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.Count.ShouldBe(1);
    }

    [Fact]
    public async Task GetBasket_ShouldReturnEmpty_WhenUserIdIsInvalid()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        var items = new List<BasketItem> { new BasketItem { Id = "some-id" } };
        mockRepository.GetBasketAsync("1")
            .Returns(Task.FromResult(new CustomerBasket { BuyerId = "1", Items = items })!);
        var service = new BasketService(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        var httpContext = new DefaultHttpContext();
        serverCallContext.SetUserState("__HttpContext", httpContext);

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.ShouldBeEmpty();
    }
}