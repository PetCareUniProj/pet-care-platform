namespace Subscription.Application.Abstractions.Authentication;
public interface IIdentityService
{
    Guid GetUserIdentity();
    bool IsAdmin();
    string? GetFirstName();
    string? GetLastName();
    string? GetEmail();
}
