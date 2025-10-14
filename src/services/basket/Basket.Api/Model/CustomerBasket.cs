namespace Basket.Api.Model;

public class CustomerBasket
{
    public Guid BuyerId { get; set; }

    public List<BasketItem> Items { get; set; } = [];

    public CustomerBasket() { }

    public CustomerBasket(Guid customerId)
    {
        BuyerId = customerId;
    }
}