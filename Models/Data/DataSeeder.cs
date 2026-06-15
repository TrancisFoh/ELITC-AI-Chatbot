using ELITC_AI_Chatbot.Models.Data;
using Microsoft.AspNetCore.Identity;

namespace ELITC_AI_Chatbot.Models.Data;

public static class DataSeeder
{
    public static async Task SeedAdminUserAndRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Seed Roles
        var roles = new[] { "Admin", "Moderator" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed Admin User
        var adminEmail = "admin@elitc.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true, FullName = "System Admin" };
            var result = await userManager.CreateAsync(adminUser, "Admin1234!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed Moderator User
        var modEmail = "fentopian@gmail.com";
        var modUser = await userManager.FindByEmailAsync(modEmail);

        if (modUser == null)
        {
            modUser = new ApplicationUser { UserName = modEmail, Email = modEmail, EmailConfirmed = true, FullName = "Moderator" };
            var result = await userManager.CreateAsync(modUser, "Moderator1234!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(modUser, "Moderator");
            }
        }
        else if (!await userManager.IsInRoleAsync(modUser, "Moderator"))
        {
            // Just in case it already exists but lacks the role
            await userManager.AddToRoleAsync(modUser, "Moderator");
        }
    }
}
