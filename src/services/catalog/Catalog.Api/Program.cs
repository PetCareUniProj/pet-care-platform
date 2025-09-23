using System.Reflection;
using Asp.Versioning;
using Catalog.Api;
using Catalog.Api.Auth;
using Catalog.Api.Endpoints;
using Catalog.Api.Extensions;
using Catalog.Application;
using Catalog.Infrastructure;
using ServiceDefaults;
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddDefaultAuthentication();

builder.Services.AddAuthorization(x =>
{
    x.AddPolicy(AuthConstants.AdminUserPolicyName, p => p.RequireRole(AuthConstants.AdminUserRoleName));
});

builder.Services.AddApiVersioning(x =>
{
    x.DefaultApiVersion = new ApiVersion(1.0);
    x.AssumeDefaultVersionWhenUnspecified = true;
    x.ReportApiVersions = true;
    x.ApiVersionReader = new MediaTypeApiVersionReader("api-version");
}).AddApiExplorer();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGenWithAuth(builder.Configuration);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddPresentation();

builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());

var app = builder.Build();
app.CreateApiVersionSet();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(x =>
    {
        foreach (var description in app.DescribeApiVersions())
        {
            x.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json",
                description.GroupName);
            x.OAuthUseBasicAuthenticationWithAccessCodeGrant();
            x.OAuthUsePkce();
        }
    });
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

    app.ApplyMigrations();
}

app.MapDefaultEndpoints();
app.MapEndpoints();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

await app.RunAsync();
