
using System.Security.Claims;
using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Modules.Carriers.Domain.Policies;
using Modules.Shipments.Domain.Policies;
using Modules.Stocks.Domain.Policies;
using Modules.Users.Domain.Policies;
using Modules.Users.Domain.Users;
using Modules.Users.Infrastructure.Database;

namespace ModularMonolith.Host.Seeding;

public class UserSeedService(
    UsersDbContext usersContext,
    UserManager<User> userManager,
    RoleManager<Role> roleManager,
    ILogger<UserSeedService> logger)
{
    public async Task SeedUsersAsync()
    {
	    Randomizer.Seed = new Random(4503);

        if (await usersContext.Users.AnyAsync())
        {
            logger.LogInformation("Users already exist, skipping user seeding");
            return;
        }

        logger.LogInformation("Starting user seeding...");

        await CreateRolesAsync();
        await CreateUsersAsync();

        await usersContext.SaveChangesAsync();

        logger.LogInformation("User seeding completed");
    }

    private async Task CreateRolesAsync()
    {
        var adminRole = new Role { Name = "Admin" };
        var userRole = new Role { Name = "User" };

        await roleManager.CreateAsync(adminRole);
        await roleManager.CreateAsync(userRole);

        await ConfigureAdminRolePermissions(adminRole);
        await ConfigureUserRolePermissions(userRole);
    }

    private async Task ConfigureAdminRolePermissions(Role adminRole)
    {
        // Users module permissions
        await roleManager.AddClaimAsync(adminRole, new Claim(UserPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(UserPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(UserPolicyConsts.UpdatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(UserPolicyConsts.DeletePolicy, "true"));

        // Shipments module permissions
        await roleManager.AddClaimAsync(adminRole, new Claim(ShipmentPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(ShipmentPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(ShipmentPolicyConsts.UpdatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(ShipmentPolicyConsts.DeletePolicy, "true"));

        // Carriers module permissions
        await roleManager.AddClaimAsync(adminRole, new Claim(CarrierPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(CarrierPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(CarrierPolicyConsts.UpdatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(CarrierPolicyConsts.DeletePolicy, "true"));

        // Stocks module permissions
        await roleManager.AddClaimAsync(adminRole, new Claim(StockPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(StockPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(StockPolicyConsts.UpdatePolicy, "true"));
        await roleManager.AddClaimAsync(adminRole, new Claim(StockPolicyConsts.DeletePolicy, "true"));
    }

    private async Task ConfigureUserRolePermissions(Role userRole)
    {
        // Regular users — read/create/update only; no delete, no user management
        await roleManager.AddClaimAsync(userRole, new Claim(ShipmentPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(ShipmentPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(ShipmentPolicyConsts.UpdatePolicy, "true"));

        await roleManager.AddClaimAsync(userRole, new Claim(CarrierPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(CarrierPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(CarrierPolicyConsts.UpdatePolicy, "true"));

        await roleManager.AddClaimAsync(userRole, new Claim(StockPolicyConsts.ReadPolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(StockPolicyConsts.CreatePolicy, "true"));
        await roleManager.AddClaimAsync(userRole, new Claim(StockPolicyConsts.UpdatePolicy, "true"));
    }

    private async Task CreateUsersAsync()
    {
        var adminUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = "admin@test.com",
            UserName = "admin@test.com"
        };

        await userManager.CreateAsync(adminUser, "Test1234!");
        await userManager.AddToRoleAsync(adminUser, "Admin");

        var sampleUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = "user@test.com",
            UserName = "user@test.com"
        };

        await userManager.CreateAsync(sampleUser, "Test1234!");
        await userManager.AddToRoleAsync(sampleUser, "User");
    }
}
