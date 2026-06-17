using Microsoft.AspNetCore.Identity;

namespace ELITC_AI_Chatbot.Models.Data;

// Add profile data for application users by adding properties to the ApplicationUser class
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}

