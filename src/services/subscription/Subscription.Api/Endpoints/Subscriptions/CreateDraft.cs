
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Models;
using Subscription.Application.Subscriptions;
using Subscription.Application.Subscriptions.CreateDraft;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class CreateDraft : IEndpoint
{
    public const string Name = "CreateSubscriptionDraft";
    public record CreateSubscriptionDraftRequest
    {
        public required bool IsRecurring { get; init; }
        public TimeSpan? RecurrenceInterval { get; init; }
        public IEnumerable<BasketItem> Items { get; init; } = [];
    }
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Subscriptions.CreateDraft, async (CreateSubscriptionDraftRequest request, IIdentityService identity, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var createSubscriptionCommand = new CreateSubscriptionDraftCommand
            {
                BuyerId = identity.GetUserIdentity(),
                BuyerEmail = identity.GetEmail()!,
                BuyerName = identity.GetFirstName()!,
                Items = request.Items,
                IsRecurring = request.IsRecurring,
                RecurrenceInterval = request.RecurrenceInterval
            };
            var result = await mediator.Send(createSubscriptionCommand, cancellationToken);
            return result.Match(
             Subscription => Results.CreatedAtRoute(GetSubscriptionById.Name, new { id = Subscription.Id }, Subscription),
            CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithDescription("Creates a new Subscription draft.")
        .Produces<SubscriptionDraftResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

    }
}


