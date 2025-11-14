using System.Text.Json;
using Catalog.Domain.Entities;
using Catalog.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Infrastructure;

internal sealed class ApplicationDbContextSeed(
    IHostEnvironment env,
    ILogger<ApplicationDbContextSeed> logger) : IDbSeeder<ApplicationDbContext>
{
    public async Task SeedAsync(ApplicationDbContext context)
    {
        var contentRootPath = env.ContentRootPath;

        if (!context.Brands.Any())
        {
            await SeedBrandsAsync(context, contentRootPath);
        }

        if (!context.Categories.Any())
        {
            await SeedCategoriesAsync(context, contentRootPath);
        }

        if (!context.Items.Any())
        {
            await SeedItemsAsync(context, contentRootPath);
        }
    }

    private async Task SeedBrandsAsync(ApplicationDbContext context, string contentRootPath)
    {
        var brandsPath = Path.Combine(contentRootPath, "Setup", "brands.json");

        if (!File.Exists(brandsPath))
        {
            logger.LogInformation("Creating default brands as brands.json file not found");
            await CreateDefaultBrandsAsync(context);
            return;
        }

        var brandsJson = await File.ReadAllTextAsync(brandsPath);
        var brandEntries = JsonSerializer.Deserialize<BrandSeedEntry[]>(brandsJson) ?? [];

        var brands = brandEntries
            .Where(entry => !string.IsNullOrWhiteSpace(entry.Name))
            .Select(entry => new Brand { Name = entry.Name! })
            .ToArray();

        await context.Brands.AddRangeAsync(brands);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded catalog with {BrandCount} brands", brands.Length);
    }

    private async Task SeedCategoriesAsync(ApplicationDbContext context, string contentRootPath)
    {
        var categoriesPath = Path.Combine(contentRootPath, "Setup", "categories.json");

        if (!File.Exists(categoriesPath))
        {
            logger.LogInformation("Creating default categories as categories.json file not found");
            await CreateDefaultCategoriesAsync(context);
            return;
        }

        var categoriesJson = await File.ReadAllTextAsync(categoriesPath);
        var categoryEntries = JsonSerializer.Deserialize<CategorySeedEntry[]>(categoriesJson) ?? [];

        var categories = categoryEntries
            .Where(entry => !string.IsNullOrWhiteSpace(entry.Name))
            .Select(entry => new Category { Name = entry.Name! })
            .ToArray();

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded catalog with {CategoryCount} categories", categories.Length);
    }

    private async Task SeedItemsAsync(ApplicationDbContext context, string contentRootPath)
    {
        var itemsPath = Path.Combine(contentRootPath, "Setup", "items.json");

        if (!File.Exists(itemsPath))
        {
            logger.LogInformation("Creating default items as items.json file not found");
            await CreateDefaultItemsAsync(context);
            return;
        }

        var itemsJson = await File.ReadAllTextAsync(itemsPath);
        var itemEntries = JsonSerializer.Deserialize<ItemSeedEntry[]>(itemsJson) ?? [];

        // Create dictionaries for lookups
        var brandsByName = await context.Brands.ToDictionaryAsync(b => b.Name, b => b.Id);
        var categoriesByName = await context.Categories.ToDictionaryAsync(c => c.Name, c => c);

        var items = new List<Item>();

        foreach (var entry in itemEntries.Where(e => !string.IsNullOrWhiteSpace(e.Name) && !string.IsNullOrWhiteSpace(e.Slug)))
        {
            if (!brandsByName.TryGetValue(entry.BrandName ?? string.Empty, out var brandId))
            {
                logger.LogWarning("Brand '{BrandName}' not found for item '{ItemName}'. Skipping item.", entry.BrandName, entry.Name);
                continue;
            }

            var item = new Item
            {
                Slug = entry.Slug!,
                Name = entry.Name!,
                Description = entry.Description,
                Price = entry.Price,
                PictureFileName = entry.PictureFileName,
                CatalogBrandId = brandId,
                AvailableStock = entry.AvailableStock,
                RestockThreshold = entry.RestockThreshold,
                MaxStockThreshold = entry.MaxStockThreshold,
                OnReorder = entry.OnReorder
            };

            // Map categories
            if (entry.CategoryNames is not null && entry.CategoryNames.Length > 0)
            {
                var itemCategories = entry.CategoryNames
                    .Where(categoryName => categoriesByName.ContainsKey(categoryName))
                    .Select(categoryName => categoriesByName[categoryName])
                    .ToList();

                item.Categories = itemCategories;
            }

            items.Add(item);
        }

        await context.Items.AddRangeAsync(items);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded catalog with {ItemCount} items", items.Count);
    }

    private async Task CreateDefaultBrandsAsync(ApplicationDbContext context)
    {
        var defaultBrands = new[]
        {
            new Brand { Name = "Royal Canin" },
            new Brand { Name = "Hill's Pet Nutrition" },
            new Brand { Name = "Purina Pro Plan" },
            new Brand { Name = "Blue Buffalo" },
            new Brand { Name = "Wellness" },
            new Brand { Name = "Orijen" },
            new Brand { Name = "KONG" },
            new Brand { Name = "Nylabone" },
            new Brand { Name = "FURminator" },
            new Brand { Name = "Petmate" }
        };

        await context.Brands.AddRangeAsync(defaultBrands);
        await context.SaveChangesAsync();

        logger.LogInformation("Created {BrandCount} default brands", defaultBrands.Length);
    }

    private async Task CreateDefaultCategoriesAsync(ApplicationDbContext context)
    {
        var defaultCategories = new[]
        {
            new Category { Name = "Dog Food" },
            new Category { Name = "Cat Food" },
            new Category { Name = "Bird Food" },
            new Category { Name = "Fish Food" },
            new Category { Name = "Toys" },
            new Category { Name = "Grooming" },
            new Category { Name = "Health & Wellness" },
            new Category { Name = "Accessories" },
            new Category { Name = "Training" },
            new Category { Name = "Bedding" }
        };

        await context.Categories.AddRangeAsync(defaultCategories);
        await context.SaveChangesAsync();

        logger.LogInformation("Created {CategoryCount} default categories", defaultCategories.Length);
    }

    private async Task CreateDefaultItemsAsync(ApplicationDbContext context)
    {
        // Get the seeded brands and categories
        var brands = await context.Brands.ToDictionaryAsync(b => b.Name, b => b.Id);
        var categories = await context.Categories.ToDictionaryAsync(c => c.Name, c => c);

        var defaultItems = new[]
        {
            new Item
            {
                Slug = "royal-canin-adult-dog-food",
                Name = "Royal Canin Adult Dog Food",
                Description = "Nutritionally balanced dry dog food for adult dogs aged 1-7 years.",
                Price = 29.99m,
                PictureFileName = "royal-canin-adult-dog.jpg",
                CatalogBrandId = brands["Royal Canin"],
                AvailableStock = 50,
                RestockThreshold = 10,
                MaxStockThreshold = 100,
                OnReorder = false,
                Categories = [categories["Dog Food"]]
            },
            new Item
            {
                Slug = "hills-prescription-cat-food",
                Name = "Hill's Prescription Diet Cat Food",
                Description = "Veterinary recommended prescription diet for cats with special dietary needs.",
                Price = 45.50m,
                PictureFileName = "hills-prescription-cat.jpg",
                CatalogBrandId = brands["Hill's Pet Nutrition"],
                AvailableStock = 30,
                RestockThreshold = 5,
                MaxStockThreshold = 80,
                OnReorder = false,
                Categories = [categories["Cat Food"], categories["Health & Wellness"]]
            },
            new Item
            {
                Slug = "kong-classic-dog-toy",
                Name = "KONG Classic Dog Toy",
                Description = "Durable rubber toy that can be stuffed with treats to keep dogs entertained.",
                Price = 12.99m,
                PictureFileName = "kong-classic-toy.jpg",
                CatalogBrandId = brands["KONG"],
                AvailableStock = 75,
                RestockThreshold = 15,
                MaxStockThreshold = 150,
                OnReorder = false,
                Categories = [categories["Toys"]]
            },
            new Item
            {
                Slug = "furminator-deshedding-tool",
                Name = "FURminator deShedding Tool",
                Description = "Professional grooming tool that reduces shedding by up to 90%.",
                Price = 34.95m,
                PictureFileName = "furminator-tool.jpg",
                CatalogBrandId = brands["FURminator"],
                AvailableStock = 40,
                RestockThreshold = 8,
                MaxStockThreshold = 120,
                OnReorder = false,
                Categories = [categories["Grooming"]]
            },
            new Item
            {
                Slug = "blue-buffalo-wilderness-cat",
                Name = "Blue Buffalo Wilderness Cat Food",
                Description = "High-protein, grain-free cat food inspired by the diet of wild cats.",
                Price = 38.99m,
                PictureFileName = "blue-buffalo-wilderness.jpg",
                CatalogBrandId = brands["Blue Buffalo"],
                AvailableStock = 60,
                RestockThreshold = 12,
                MaxStockThreshold = 150,
                OnReorder = false,
                Categories = [categories["Cat Food"]]
            },
            new Item
            {
                Slug = "nylabone-puppy-chew-toy",
                Name = "Nylabone Puppy Chew Toy",
                Description = "Safe and durable chew toy designed specifically for teething puppies.",
                Price = 8.99m,
                PictureFileName = "nylabone-puppy-chew.jpg",
                CatalogBrandId = brands["Nylabone"],
                AvailableStock = 90,
                RestockThreshold = 20,
                MaxStockThreshold = 200,
                OnReorder = false,
                Categories = [categories["Toys"], categories["Training"]]
            },
            new Item
            {
                Slug = "petmate-pet-carrier",
                Name = "Petmate Pet Carrier",
                Description = "Airline-approved pet carrier with secure ventilation and easy-carry handles.",
                Price = 55.00m,
                PictureFileName = "petmate-carrier.jpg",
                CatalogBrandId = brands["Petmate"],
                AvailableStock = 25,
                RestockThreshold = 5,
                MaxStockThreshold = 60,
                OnReorder = false,
                Categories = [categories["Accessories"]]
            },
            new Item
            {
                Slug = "wellness-core-grain-free-dog",
                Name = "Wellness CORE Grain-Free Dog Food",
                Description = "Premium natural grain-free dog food with deboned protein as the first ingredient.",
                Price = 52.99m,
                PictureFileName = "wellness-core-dog.jpg",
                CatalogBrandId = brands["Wellness"],
                AvailableStock = 45,
                RestockThreshold = 10,
                MaxStockThreshold = 100,
                OnReorder = false,
                Categories = [categories["Dog Food"], categories["Health & Wellness"]]
            },
            new Item
            {
                Slug = "orijen-regional-red-cat",
                Name = "Orijen Regional Red Cat Food",
                Description = "Biologically appropriate cat food featuring ranch-raised beef, wild boar, and lamb.",
                Price = 67.99m,
                PictureFileName = "orijen-regional-red.jpg",
                CatalogBrandId = brands["Orijen"],
                AvailableStock = 35,
                RestockThreshold = 8,
                MaxStockThreshold = 80,
                OnReorder = false,
                Categories = [categories["Cat Food"]]
            },
            new Item
            {
                Slug = "comfort-pet-bed-large",
                Name = "Comfort Pet Bed - Large",
                Description = "Orthopedic memory foam pet bed with washable cover, suitable for large dogs.",
                Price = 89.99m,
                PictureFileName = "comfort-pet-bed.jpg",
                CatalogBrandId = brands["Petmate"],
                AvailableStock = 20,
                RestockThreshold = 4,
                MaxStockThreshold = 50,
                OnReorder = false,
                Categories = [categories["Bedding"]]
            }
        };

        await context.Items.AddRangeAsync(defaultItems);
        await context.SaveChangesAsync();

        logger.LogInformation("Created {ItemCount} default items", defaultItems.Length);
    }

    private sealed record BrandSeedEntry(string? Name);

    private sealed record CategorySeedEntry(string? Name);

    private sealed record ItemSeedEntry(
        string? Slug,
        string? Name,
        string? Description,
        decimal Price,
        string? PictureFileName,
        string? BrandName,
        int AvailableStock,
        int RestockThreshold,
        int MaxStockThreshold,
        bool OnReorder,
        string[]? CategoryNames);
}