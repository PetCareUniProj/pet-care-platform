using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Ordering.Application.Abstractions.Data;

public interface IApplicationDbContext
{
    DbSet<Order> Orders { get; }
    DbSet<Buyer> Buyers { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<CardType> CardTypes { get; }
    DbSet<PaymentMethod> Payments { get; }

    bool HasActiveTransaction { get; }
    DatabaseFacade Database { get; }
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(IDbContextTransaction transaction, CancellationToken cancellationToken = default);
    IDbContextTransaction GetCurrentTransaction();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}