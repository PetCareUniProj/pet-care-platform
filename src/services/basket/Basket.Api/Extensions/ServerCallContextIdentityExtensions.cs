namespace Basket.Api.Extensions;

internal static class ServerCallContextIdentityExtensions
{
    public static Guid? GetUserIdentity(this ServerCallContext context)
    {
        var httpContext = context.GetHttpContext();
        if (httpContext is null)
        {
            throw new InvalidOperationException("HTTP context is not available.");
        }

        var claim = httpContext.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

        return Guid.TryParse(claim?.Value, out var userId) ? userId : null;
    }
}