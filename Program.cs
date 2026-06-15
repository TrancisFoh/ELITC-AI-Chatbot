using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using ELITC_AI_Chatbot.Views;
using ELITC_AI_Chatbot.Views.Account;
using ELITC_AI_Chatbot.Models.Data;
using ELITC_AI_Chatbot.Controllers;

DotNetEnv.Env.Load(".env.local");

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
    options.ForwardLimit = null;
});

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddScoped<DbService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<GeminiService>();
builder.Services.AddScoped<RagService>();
builder.Services.AddScoped<CourseScraperService>();

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Stores.SchemaVersion = IdentitySchemaVersions.Version3;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.Configure<ELITC_AI_Chatbot.Models.SmtpSettings>(options =>
{
    var configSection = builder.Configuration.GetSection("SmtpSettings");
    options.Server = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? configSection["Server"] ?? "";
    options.Port = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port) ? port : 
                   int.TryParse(configSection["Port"], out var configPort) ? configPort : 587;
    options.Username = Environment.GetEnvironmentVariable("SMTP_USER") ?? configSection["Username"] ?? "";
    options.Password = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? configSection["Password"] ?? "";
    options.SenderName = Environment.GetEnvironmentVariable("SMTP_SENDER_NAME") ?? configSection["SenderName"] ?? "ELITC Assistant";
    options.SenderEmail = Environment.GetEnvironmentVariable("SMTP_SENDER_EMAIL") ?? configSection["SenderEmail"] ?? "";
});
builder.Services.AddTransient<IEmailSender<ApplicationUser>, SmtpEmailSender>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await ELITC_AI_Chatbot.Models.Data.DataSeeder.SeedAdminUserAndRolesAsync(services);
}

app.UseForwardedHeaders();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Add additional endpoints required by the Identity /Account Razor components.
app.MapAdditionalIdentityEndpoints();

app.Run();
