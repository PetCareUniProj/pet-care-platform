namespace Subscription.Domain.Buyers;

public class Buyer : Entity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }

    private readonly List<PaymentMethod> _paymentMethods = new();
    public IEnumerable<PaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();

    protected Buyer() { }

    private Buyer(Guid id, string name, string email)
    {
        Id = id;
        Name = name;
        Email = email;
    }

    public static Result<Buyer> Create(Guid id, string name, string email)
    {
        if (id == Guid.Empty)
        {
            return Result.Failure<Buyer>(SubscriptionErrors.Buyer.NullIdentity);
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            return Result.Failure<Buyer>(SubscriptionErrors.Buyer.NullName);
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Result.Failure<Buyer>(SubscriptionErrors.Buyer.NullEmail);
        }

        return Result.Success(new Buyer(id, name, email));
    }

    public Result<PaymentMethod> VerifyOrAddPaymentMethod(
        int cardTypeId, string alias, string cardNumber,
        string securityNumber, string cardHolderName, DateTime expiration, int SubscriptionId)
    {
        var existingPayment = _paymentMethods
            .SingleOrDefault(p => p.IsEqualTo(cardTypeId, cardNumber, expiration));

        if (existingPayment is not null)
        {
            Raise(new BuyerAndPaymentMethodVerifiedDomainEvent(this, existingPayment, SubscriptionId));
            return Result.Success(existingPayment);
        }

        var paymentResult = PaymentMethod.Create(cardTypeId, alias, cardNumber, securityNumber, cardHolderName, expiration);
        if (paymentResult.IsFailure)
        {
            return Result.Failure<PaymentMethod>(paymentResult.Error);
        }

        _paymentMethods.Add(paymentResult.Value);

        Raise(new BuyerAndPaymentMethodVerifiedDomainEvent(this, paymentResult.Value, SubscriptionId));
        return Result.Success(paymentResult.Value);
    }
}

