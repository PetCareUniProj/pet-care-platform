
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Errors;

namespace Ordering.Application.Buyers.Create;
internal sealed class CreateBuyerCommandHandler(IApplicationDbContext applicationDbContext) : ICommandHandler<CreateBuyerCommand, Result>
{
    public async ValueTask<Result> Handle(CreateBuyerCommand command, CancellationToken cancellationToken)
    {
        //REVIEW: Should rewrite with query?
        var exstingBuyer = await applicationDbContext.Buyers
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == command.Id, cancellationToken: cancellationToken);

        if (exstingBuyer is not null)
        {
            return Result.Failure(OrderingErrors.Buyer.AllreadyExists);
        }

        var buyerResult = Buyer.Create(command.Id, command.Name, command.Email);
        if (buyerResult.IsFailure)
        {
            return Result.Failure(buyerResult.Error);
        }

        await applicationDbContext.Buyers.AddAsync(buyerResult.Value, cancellationToken);
        await applicationDbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
