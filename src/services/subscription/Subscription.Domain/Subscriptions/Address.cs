namespace Subscription.Domain.Subscriptions;

public class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string Country { get; }
    public string ZipCode { get; }

    protected Address() { }

    private Address(string street, string city, string state, string country, string zipcode)
    {
        Street = street;
        City = city;
        State = state;
        Country = country;
        ZipCode = zipcode;
    }

    public static Result<Address> Create(string? street, string? city, string? state, string? country, string? zipcode)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            return Result.Failure<Address>(SubscriptionErrors.Address.NullStreet);
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            return Result.Failure<Address>(SubscriptionErrors.Address.NullCity);
        }

        if (string.IsNullOrWhiteSpace(state))
        {
            return Result.Failure<Address>(SubscriptionErrors.Address.NullState);
        }

        if (string.IsNullOrWhiteSpace(country))
        {
            return Result.Failure<Address>(SubscriptionErrors.Address.NullCountry);
        }

        if (string.IsNullOrWhiteSpace(zipcode))
        {
            return Result.Failure<Address>(SubscriptionErrors.Address.NullZipCode);
        }

        return Result.Success(new Address(street, city, state, country, zipcode));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return Country;
        yield return ZipCode;
    }
}

