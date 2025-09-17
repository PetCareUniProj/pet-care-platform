## Prerequisites
## 1. Install .Net 9
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)

Verify your installation:
```dotnet --version```
## 2. Install Aspire Workload
```dotnet workload install aspire```
## 3. Trust .NET https certs
```dotnet dev-certs https --trust```
## 4. Run Aspire host
From the root directory of the repository, run:
```dotnet run --project src/aspire/AppHost/AppHost.csproj```