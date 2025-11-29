using System.Data;
using Npgsql;

namespace OrderProcessor;

public class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly NpgsqlDataSource _dataSource;

    public NpgsqlConnectionFactory(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public IDbConnection CreateConnection()
    {
        return _dataSource.CreateConnection();
    }

    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default)
    {
        var connection = _dataSource.CreateConnection();
        await connection.OpenAsync(token);
        return connection;
    }
}
public interface IDbConnectionFactory
{
    Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default);
    IDbConnection CreateConnection();
}
