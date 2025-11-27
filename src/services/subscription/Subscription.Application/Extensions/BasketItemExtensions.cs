using Subscription.Application.Models;
using Subscription.Application.Subscriptions;

namespace Subscription.Application.Extensions;
public static class BasketItemExtensions
{
    public static IEnumerable<SubscriptionItemDTO> ToSubscriptionItemsDTO(this IEnumerable<BasketItem> basketItems)
    {
        foreach (var item in basketItems)
        {
            yield return item.ToSubscriptionItemDTO();
        }
    }

    public static SubscriptionItemDTO ToSubscriptionItemDTO(this BasketItem item)
    {
        return new SubscriptionItemDTO()
        {
            ProductId = item.ProductId,
            ProductName = item.ProductName,
            PictureUrl = item.PictureUrl,
            UnitPrice = item.UnitPrice,
            Units = item.Quantity
        };
    }
}


