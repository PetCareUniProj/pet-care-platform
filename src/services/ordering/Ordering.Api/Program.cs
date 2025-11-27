using Ordering.Api.Endpoints;
using Ordering.Api.Extensions;
using ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddApplicationServices();

var app = builder.Build();

// CORS must be before other middleware
app.MapDefaultEndpoints();

app.CreateApiVersionSet();
app.MapEndpoints();
app.MapOpenApi();

if (app.Environment.IsDevelopment())
{
    //app.ApplyMigrations();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

await app.RunAsync();

public partial class Program { }
