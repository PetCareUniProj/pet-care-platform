using Ordering.Domain.Errors;
using Ordering.Domain.Events;
using SharedKernel;

namespace Ordering.Domain.AggregatesModel.BuyerAggregate;

public class Buyer : Entity, IAggregateRoot
{
    public int Id { get; private set; }
    public string IdentityGuid { get; private set; }
    public string Name { get; private set; }

    private readonly List<PaymentMethod> _paymentMethods = new();
    public IEnumerable<PaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();

    protected Buyer() { }

    private Buyer(string identity, string name)
    {
        IdentityGuid = identity;
        Name = name;
    }

    public static Result<Buyer> Create(string identity, string name)
    {
        if (string.IsNullOrWhiteSpace(identity))
        {
            return Result.Failure<Buyer>(OrderingErrors.Buyer.NullIdentity);
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            return Result.Failure<Buyer>(OrderingErrors.Buyer.NullName);
        }

        return Result.Success(new Buyer(identity, name));
    }

    public Result<PaymentMethod> VerifyOrAddPaymentMethod(
        int cardTypeId, string alias, string cardNumber,
        string securityNumber, string cardHolderName, DateTime expiration, int orderId)
    {
        var existingPayment = _paymentMethods
            .SingleOrDefault(p => p.IsEqualTo(cardTypeId, cardNumber, expiration));

        if (existingPayment != null)
        {
            Raise(new BuyerAndPaymentMethodVerifiedDomainEvent(this, existingPayment, orderId));
            return Result.Success(existingPayment);
        }

        var paymentResult = PaymentMethod.Create(cardTypeId, alias, cardNumber, securityNumber, cardHolderName, expiration);
        if (paymentResult.IsFailure)
        {
            return Result.Failure<PaymentMethod>(paymentResult.Error);
        }

        _paymentMethods.Add(paymentResult.Value);

        Raise(new BuyerAndPaymentMethodVerifiedDomainEvent(this, paymentResult.Value, orderId));
        return Result.Success(paymentResult.Value);
    }
}