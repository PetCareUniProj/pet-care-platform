using Catalog.Infrastructure.Database;
using Microsoft.Extensions.DependencyInjection;

namespace Catalog.Api.Tests.Integrational;
public abstract class BaseIntegrationTest : IClassFixture<CatalogApiFactory>
{
    private readonly IServiceScope _scope;
    protected readonly ApplicationDbContext dbContext;
    protected BaseIntegrationTest(CatalogApiFactory factory)
    {
        _scope = factory.Services.CreateScope();
        dbContext = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }
}
