
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Subscriptions;
using Subscription.Application.Subscriptions.Create;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class Create : IEndpoint
{
    public const string Name = "CreateSubscription";
    public sealed record CreateSubscriptionRequest
    {
        public required int DraftSubscriptionId { get; init; }
        public required string City { get; init; }
        public required string Street { get; init; }
        public required string State { get; init; }
        public required string Country { get; init; }
        public required string ZipCode { get; init; }
        public required string CardNumber { get; init; }
        public required string CardHolderName { get; init; }
        public DateTime CardExpiration { get; init; }
        public required string CardSecurityNumber { get; init; }
        public int CardTypeId { get; init; }
        public int PaymentMethodId { get; init; }
    }
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Subscriptions.Create, async (
            CreateSubscriptionRequest request,
            IIdentityService identity,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var createSubscriptionCommand = new CreateSubscriptionCommand
            {
                BuyerId = identity.GetUserIdentity(),
                DraftSubscriptionId = request.DraftSubscriptionId,
                City = request.City,
                Street = request.Street,
                State = request.State,
                Country = request.Country,
                ZipCode = request.ZipCode,
                CardNumber = request.CardNumber,
                CardHolderName = request.CardHolderName,
                CardExpiration = request.CardExpiration,
                CardSecurityNumber = request.CardSecurityNumber,
                CardTypeId = request.CardTypeId,
                PaymentMethodId = request.PaymentMethodId
            };

            var result = await mediator.Send(createSubscriptionCommand, cancellationToken);
            return result.Match(
                Subscription => Results.CreatedAtRoute(GetSubscriptionById.Name, new { id = request.DraftSubscriptionId }, Subscription),
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithSummary("Create a subscription from a draft")
        .WithDescription("Creates a new subscription from a draft subscription.")
        .Produces<SubscriptionResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}


