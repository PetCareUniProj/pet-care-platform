using Basket.Api.Model;

namespace Basket.Api.Repositories;

public interface IBasketRepository
{
    Task<CustomerBasket> GetBasketAsync(Guid customerId);
    Task<CustomerBasket> UpdateBasketAsync(CustomerBasket basket);
    Task<bool> DeleteBasketAsync(Guid id);
}