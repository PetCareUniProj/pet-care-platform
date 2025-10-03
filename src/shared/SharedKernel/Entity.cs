namespace SharedKernel;

public abstract class Entity
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

#pragma warning disable CA1030 // Use events where appropriate
    protected void Raise(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
#pragma warning restore CA1030 // Use events where appropriate
}
