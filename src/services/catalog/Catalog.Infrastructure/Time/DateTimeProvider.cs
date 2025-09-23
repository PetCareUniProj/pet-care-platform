using SharedKernel;

namespace Catalog.Infrastructure.Time;
internal sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
