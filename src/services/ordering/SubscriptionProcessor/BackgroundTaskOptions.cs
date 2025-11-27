namespace SubscriptionProcessor;

public sealed class BackgroundTaskOptions
{
    public int GracePeriodTime { get; set; }

    public int CheckUpdateTime { get; set; }
}
