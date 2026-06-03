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
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        // Seed Admin User
        var adminEmail = "admin@elitc.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            
            var result = await userManager.CreateAsync(adminUser, "Admin1234!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
