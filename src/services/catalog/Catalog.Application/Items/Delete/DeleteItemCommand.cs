namespace Catalog.Application.Items.Delete;
public sealed record DeleteItemCommand : ICommand<Result>
{
    public int Id { get; init; }
}
