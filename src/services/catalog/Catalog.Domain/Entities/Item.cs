using SharedKernel;

namespace Catalog.Domain.Entities;

public class Item
{
    public int Id { get; set; }

    public required string Slug { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? PictureFileName { get; set; }

    public int CatalogBrandId { get; set; }

    // Quantity in stock
    public int AvailableStock { get; set; }

    // Available stock at which we should reorder
    public int RestockThreshold { get; set; }

    // Maximum number of units that can be in-stock at any time (due to physicial/logistical constraints in warehouses)
    public int MaxStockThreshold { get; set; }

    /// <summary>
    /// True if item is on reorder
    /// </summary>
    public bool OnReorder { get; set; }

    #region Navigation Properties
    public Brand? CatalogBrand { get; set; }

    public ICollection<Category> Categories { get; set; } = [];
    #endregion

    /// <summary>
    /// Decrements the quantity of a particular item in inventory by the specified amount.
    /// </summary>
    /// <param name="quantityDesired">The quantity to remove from stock. Must be a positive integer.</param>
    /// <returns>
    /// A <see cref="Result{T}"/> containing the actual quantity removed from stock on success,
    /// or a failure result with appropriate error information.
    /// </returns>
    /// <remarks>
    /// <para>
    /// If there is sufficient stock available, the returned quantity will equal <paramref name="quantityDesired"/>.
    /// If insufficient stock is available, the method removes all available stock and returns that quantity.
    /// </para>
    /// <para>
    /// The method validates that:
    /// - The item has stock available (AvailableStock > 0)
    /// - The requested quantity is positive (quantityDesired > 0)
    /// </para>
    /// <para>
    /// It is the caller's responsibility to verify that the returned quantity matches the desired quantity
    /// when determining if the operation was fully successful.
    /// </para>
    /// </remarks>
    /// <exception cref="Result.Failure">
    /// Returns failure when the item is out of stock or when an invalid quantity is specified.
    /// </exception>
    public Result<int> RemoveStock(int quantityDesired)
    {
        if (AvailableStock == 0)
        {
            return Result.Failure<int>(Catalog.Domain.Errors.ItemErrors.OutOfStock(this.Id));
        }

        if (quantityDesired <= 0)
        {
            return Result.Failure<int>(Catalog.Domain.Errors.ItemErrors.InvalidQuantity(this.Id));
        }

        var removed = Math.Min(quantityDesired, this.AvailableStock);

        this.AvailableStock -= removed;

        return removed;
    }

    /// <summary>
    /// Increments the quantity of a particular item in inventory by the specified amount.
    /// </summary>
    /// <param name="quantity">The quantity to add to stock. Should be a positive integer.</param>
    /// <returns>The actual quantity that was added to stock.</returns>
    /// <remarks>
    /// <para>
    /// The method respects the <see cref="MaxStockThreshold"/> constraint. If adding the full quantity
    /// would exceed this threshold, only enough units are added to reach the maximum threshold.
    /// </para>
    /// <para>
    /// When stock is successfully added, the <see cref="OnReorder"/> flag is automatically set to false,
    /// indicating the item is no longer on reorder status.
    /// </para>
    /// <para>
    /// In future versions, excess units that cannot be accommodated due to warehouse constraints
    /// could be tracked separately for overstock management.
    /// </para>
    /// </remarks>
    public int AddStock(int quantity)
    {
        var original = this.AvailableStock;

        // The quantity that the client is trying to add to stock is greater than what can be physically accommodated in the Warehouse
        if ((this.AvailableStock + quantity) > this.MaxStockThreshold)
        {
            // For now, this method only adds new units up maximum stock threshold. In an expanded version of this application, we
            //could include tracking for the remaining units and store information about overstock elsewhere. 
            this.AvailableStock += (this.MaxStockThreshold - this.AvailableStock);
        }
        else
        {
            this.AvailableStock += quantity;
        }

        this.OnReorder = false;

        return this.AvailableStock - original;
    }
}