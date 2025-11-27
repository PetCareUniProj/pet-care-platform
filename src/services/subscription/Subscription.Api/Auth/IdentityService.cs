using Subscription.Application.Abstractions.Authentication;

namespace Subscription.Api.Auth;

public class IdentityService(IHttpContextAccessor context) : IIdentityService
{
    public string? GetEmail()
        => context.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

    public string? GetFirstName()
        => context.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname")?.Value;

    public string? GetLastName()
        => context.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname")?.Value;

    public Guid GetUserIdentity()
        => Guid.Parse(context.HttpContext!.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")!.Value);

    public bool IsAdmin()
    {
        return context.HttpContext?.User.IsInRole(AuthConstants.AdminUserRoleName) ?? false;
    }
}

