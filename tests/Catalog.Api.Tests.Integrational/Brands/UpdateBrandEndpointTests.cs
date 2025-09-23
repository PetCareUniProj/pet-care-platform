using System.Net;
using System.Net.Http.Json;
using Bogus;
using Catalog.Api.Endpoints;
using Catalog.Api.Endpoints.Brands;
using Catalog.Application.Brands;
using Catalog.Domain.Errors;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Tests.Integrational.Brands;

public sealed class UpdateBrandEndpointTests : BaseIntegrationTest, IClassFixture<CatalogApiFactory>
{
    private readonly Faker<Create.CreateBrandRequest> _createBrandGenerator = new Faker<Create.CreateBrandRequest>()
        .RuleFor(x => x.Name, faker => faker.Company.CompanyName());
    private readonly Faker<Update.UpdateBrandRequest> _updateBrandGenerator = new Faker<Update.UpdateBrandRequest>()
        .RuleFor(x => x.NewName, faker => faker.Company.CompanyName());

    public UpdateBrandEndpointTests(CatalogApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnOk_WhenDataIsValid()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _createBrandGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var brand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();

        var updateRequest = _updateBrandGenerator.Generate();

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", brand!.Id.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var updatedBrand = await response.Content.ReadFromJsonAsync<BrandResponse>();
        updatedBrand.ShouldNotBeNull();
        updatedBrand!.Id.ShouldBe(brand.Id);
        updatedBrand.Name.ShouldBe(updateRequest.NewName);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var createRequest = _createBrandGenerator.Generate();
        var createResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, createRequest);
        var brand = await createResponse.Content.ReadFromJsonAsync<BrandResponse>();
        brand.ShouldNotBeNull();

        var updateRequest = new Update.UpdateBrandRequest { NewName = string.Empty };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", brand!.Id.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNotFound_WhenBrandDoesNotExist()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        var nonExistentId = 999999; // Using a large number that's unlikely to exist
        var updateRequest = _updateBrandGenerator.Generate();

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", nonExistentId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnConflict_WhenNameAlreadyExists()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("admin");
        // Create first brand
        var firstBrandRequest = _createBrandGenerator.Generate();
        var firstBrandResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, firstBrandRequest);
        var firstBrand = await firstBrandResponse.Content.ReadFromJsonAsync<BrandResponse>();
        firstBrand.ShouldNotBeNull();

        // Create second brand
        var secondBrandRequest = _createBrandGenerator.Generate();
        var secondBrandResponse = await client.PostAsJsonAsync(ApiEndpoints.Brands.Create, secondBrandRequest);
        var secondBrand = await secondBrandResponse.Content.ReadFromJsonAsync<BrandResponse>();
        secondBrand.ShouldNotBeNull();

        // Try to update second brand with first brand's name
        var updateRequest = new Update.UpdateBrandRequest { NewName = firstBrand!.Name };

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", secondBrand!.Id.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problem.ShouldNotBeNull();
        problem!.Status.ShouldBe(409);
        problem.Title.ShouldBe(BrandErrors.NameAlreadyExists.Code);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var client = CreateClient();
        var nonExistentId = 1;
        var updateRequest = _updateBrandGenerator.Generate();

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", nonExistentId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnForbidden_WhenUserIsNotAdmin()
    {
        // Arrange
        var client = await CreateAuthenticatedClientAsync("test");
        var nonExistentId = 1;
        var updateRequest = _updateBrandGenerator.Generate();

        // Act
        var response = await client.PutAsJsonAsync(ApiEndpoints.Brands.Update.Replace("{id:int}", nonExistentId.ToString()), updateRequest);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}