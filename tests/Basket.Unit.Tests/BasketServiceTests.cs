using System.Security.Claims;
using Basket.Api.Grpc;
using Basket.Api.Model;
using Basket.Api.Repositories;
using Grpc.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Shouldly;
using BasketItem = Basket.Api.Model.BasketItem;

namespace Basket.Unit.Tests;

public sealed class BasketServiceTests
{
    private const string NameIdentifierClaimType = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    [Fact]
    public async Task GetBasket_ShouldReturnEmpty_WhenNoUser()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        serverCallContext.SetUserState("__HttpContext", new DefaultHttpContext());

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetBasket_ShouldReturnItems_WhenUserIdIsValidGuid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var mockRepository = Substitute.For<IBasketRepository>();
        List<BasketItem> items = [new BasketItem { Id = "some-id" }];
        mockRepository.GetBasketAsync(userId)
            .Returns(Task.FromResult(new CustomerBasket { BuyerId = userId, Items = items })!);
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(NameIdentifierClaimType, userId.ToString())]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.Count.ShouldBe(1);
    }

    [Theory]
    [InlineData("invalid-guid-string")]
    [InlineData("")]
    [InlineData("12345")]
    [InlineData("not-a-guid")]
    public async Task GetBasket_ShouldReturnEmpty_WhenUserIdIsInvalidGuid(string invalidGuid)
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(NameIdentifierClaimType, invalidGuid)]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetBasket_ShouldReturnEmpty_WhenNameIdentifierClaimIsMissing()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("other-claim", "value")]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        // Act
        var response = await service.GetBasket(new GetBasketRequest(), serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task UpdateBasket_ShouldReturnBasketResponse_WhenUserIdIsValidAndBasketExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var mockRepository = Substitute.For<IBasketRepository>();
        CustomerBasket updatedBasket = new() { BuyerId = userId, Items = [new BasketItem { Id = "item-1", ProductId = 1, Quantity = 2 }] };

        mockRepository.UpdateBasketAsync(Arg.Any<CustomerBasket>())
            .Returns(Task.FromResult(updatedBasket)!);
        mockRepository.GetBasketAsync(userId)
            .Returns(Task.FromResult(updatedBasket)!);

        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(NameIdentifierClaimType, userId.ToString())]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        UpdateBasketRequest request = new();
        Api.Grpc.BasketItem basketItem = new() { ProductId = 1, Quantity = 2 };
        request.Items.Add(basketItem);

        // Act
        var response = await service.UpdateBasket(request, serverCallContext);

        // Assert
        response.ShouldBeOfType<CustomerBasketResponse>();
        response.Items.Count.ShouldBe(1);
        response.Items[0].ProductId.ShouldBe(1);
        response.Items[0].Quantity.ShouldBe(2);
    }

    [Fact]
    public async Task UpdateBasket_ShouldThrowUnauthenticated_WhenUserIdIsNull()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        serverCallContext.SetUserState("__HttpContext", new DefaultHttpContext());

        UpdateBasketRequest request = new();

        // Act & Assert
        var exception = await Should.ThrowAsync<RpcException>(
            () => service.UpdateBasket(request, serverCallContext));

        exception.StatusCode.ShouldBe(StatusCode.Unauthenticated);
        exception.Status.Detail.ShouldBe("The caller is not authenticated.");
    }

    [Fact]
    public async Task UpdateBasket_ShouldThrowNotFound_WhenBasketUpdateReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var mockRepository = Substitute.For<IBasketRepository>();

        mockRepository.UpdateBasketAsync(Arg.Any<CustomerBasket>())
            .Returns(Task.FromResult<CustomerBasket?>(null));

        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(NameIdentifierClaimType, userId.ToString())]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        UpdateBasketRequest request = new();

        // Act & Assert
        var exception = await Should.ThrowAsync<RpcException>(
            () => service.UpdateBasket(request, serverCallContext));

        exception.StatusCode.ShouldBe(StatusCode.NotFound);
        exception.Status.Detail.ShouldBe($"Basket with buyer id {userId} does not exist");
    }

    [Fact]
    public async Task DeleteBasket_ShouldCompleteSuccessfully_WhenUserIdIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var mockRepository = Substitute.For<IBasketRepository>();
        mockRepository.DeleteBasketAsync(userId).Returns(Task.FromResult(true));

        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        DefaultHttpContext httpContext = new();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(NameIdentifierClaimType, userId.ToString())]));
        serverCallContext.SetUserState("__HttpContext", httpContext);

        DeleteBasketRequest request = new();

        // Act
        var response = await service.DeleteBasket(request, serverCallContext);

        // Assert
        response.ShouldBeOfType<DeleteBasketResponse>();
        await mockRepository.Received(1).DeleteBasketAsync(userId);
    }

    [Fact]
    public async Task DeleteBasket_ShouldThrowUnauthenticated_WhenUserIdIsNull()
    {
        // Arrange
        var mockRepository = Substitute.For<IBasketRepository>();
        BasketService service = new(mockRepository, NullLogger<BasketService>.Instance);
        var serverCallContext = TestServerCallContext.Create();
        serverCallContext.SetUserState("__HttpContext", new DefaultHttpContext());

        DeleteBasketRequest request = new();

        // Act & Assert
        var exception = await Should.ThrowAsync<RpcException>(
            () => service.DeleteBasket(request, serverCallContext));

        exception.StatusCode.ShouldBe(StatusCode.Unauthenticated);
        exception.Status.Detail.ShouldBe("The caller is not authenticated.");
    }
}