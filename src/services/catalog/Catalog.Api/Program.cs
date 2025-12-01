using Catalog.Api.Endpoints;
using Catalog.Api.Extensions;
using ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddApplicationServices();

var app = builder.Build();

app.CreateApiVersionSet();
app.MapDefaultEndpoints();
app.MapEndpoints();
app.MapOpenApi();

if (app.Environment.IsDevelopment())
{
    app.ApplyMigrations();
}

app.UseHttpsRedirection();
app.UseCors(ServiceDefaults.Extensions.DefaultCorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

await app.RunAsync();

public partial class Program { }
