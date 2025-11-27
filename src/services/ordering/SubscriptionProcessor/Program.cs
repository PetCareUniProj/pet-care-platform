using SubscriptionProcessor.Extensions;
using ServiceDefaults;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.AddApplicationServices();

var host = builder.Build();
host.Run();
