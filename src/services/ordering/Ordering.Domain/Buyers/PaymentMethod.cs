namespace Ordering.Domain.Buyers;

public class PaymentMethod : Entity
{
    public int Id { get; private set; }
    private readonly string _alias;
    private readonly string _cardNumber;
    private readonly string _securityNumber;
    private readonly string _cardHolderName;
    private readonly DateTime _expiration;
    private readonly int _cardTypeId;

    public CardType CardType { get; private set; }

    protected PaymentMethod() { }

    private PaymentMethod(int cardTypeId, string alias, string cardNumber, string securityNumber, string cardHolderName, DateTime expiration)
    {
        _cardNumber = cardNumber;
        _securityNumber = securityNumber;
        _cardHolderName = cardHolderName;
        _alias = alias;
        _expiration = DateTime.SpecifyKind(expiration, DateTimeKind.Utc);
        _cardTypeId = cardTypeId;
    }

    public static Result<PaymentMethod> Create(int cardTypeId, string alias, string cardNumber, string securityNumber, string cardHolderName, DateTime expiration)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
        {
            return Result.Failure<PaymentMethod>(OrderingErrors.PaymentMethod.NullCardNumber);
        }

        if (string.IsNullOrWhiteSpace(securityNumber))
        {
            return Result.Failure<PaymentMethod>(OrderingErrors.PaymentMethod.NullSecurityNumber);
        }

        if (string.IsNullOrWhiteSpace(cardHolderName))
        {
            return Result.Failure<PaymentMethod>(OrderingErrors.PaymentMethod.NullCardHolderName);
        }

        if (expiration < DateTime.UtcNow)
        {
            return Result.Failure<PaymentMethod>(OrderingErrors.PaymentMethod.Expired);
        }

        return Result.Success(new PaymentMethod(cardTypeId, alias, cardNumber, securityNumber, cardHolderName, expiration));
    }

    public bool IsEqualTo(int cardTypeId, string cardNumber, DateTime expiration)
    {
        return _cardTypeId == cardTypeId
            && _cardNumber == cardNumber
            && _expiration == expiration;
    }
}