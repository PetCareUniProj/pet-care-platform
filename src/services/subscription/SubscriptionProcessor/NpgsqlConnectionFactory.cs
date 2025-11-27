using System.Data;
using Npgsql;

namespace SubscriptionProcessor;

public sealed class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly NpgsqlDataSource dataSource;

    public NpgsqlConnectionFactory(NpgsqlDataSource dataSource)
    {
        this.dataSource = dataSource;
    }

    public IDbConnection CreateConnection()
    {
        return dataSource.CreateConnection();
    }

    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default)
    {
        var connection = dataSource.CreateConnection();
        await connection.OpenAsync(token);
        return connection;
    }
}

public interface IDbConnectionFactory
{
    Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default);

    IDbConnection CreateConnection();
}
