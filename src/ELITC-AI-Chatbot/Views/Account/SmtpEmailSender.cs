using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using ELITC_AI_Chatbot.Models.Data;
using ELITC_AI_Chatbot.Models;

namespace ELITC_AI_Chatbot.Views.Account;

internal sealed class SmtpEmailSender : IEmailSender<ApplicationUser>, Microsoft.AspNetCore.Identity.UI.Services.IEmailSender
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpSettings> smtpSettings, ILogger<SmtpEmailSender> logger)
    {
        _smtpSettings = smtpSettings.Value;
        _logger = logger;
    }

    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) =>
        SendEmailAsync(email, "Confirm your email", $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.");

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) =>
        SendEmailAsync(email, "Reset your password", $"Please reset your password by <a href='{resetLink}'>clicking here</a>.");

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode) =>
        SendEmailAsync(email, "Reset your password", $"Please reset your password using the following code: {resetCode}");

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        if (string.IsNullOrWhiteSpace(_smtpSettings.SenderEmail) || string.IsNullOrWhiteSpace(_smtpSettings.Server))
        {
            _logger.LogError("Email sending failed because SMTP settings are empty. Please configure .env.local.");
            throw new InvalidOperationException("SMTP Configuration is missing. Please populate the SMTP variables in your .env.local file.");
        }

        try
        {
            var email = new MimeMessage();
            email.Sender = MailboxAddress.Parse(_smtpSettings.SenderEmail);
            if (!string.IsNullOrEmpty(_smtpSettings.SenderName))
            {
                email.Sender.Name = _smtpSettings.SenderName;
            }
            
            email.From.Add(email.Sender);
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlMessage };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            // Start connection
            await smtp.ConnectAsync(_smtpSettings.Server, _smtpSettings.Port, SecureSocketOptions.Auto);
            
            // Authenticate if required
            if (!string.IsNullOrEmpty(_smtpSettings.Username))
            {
                await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            }

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            
            _logger.LogInformation("Email sent successfully to {Email} with subject {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while sending email to {Email}", toEmail);
            // In a production scenario, you might want to throw or handle this gracefully
            // For now, we log the error and swallow to not crash the app, but Identity might need it to throw to show an error to the user.
            // But usually IEmailSender is a fire-and-forget in some Identity UI flows. 
            // We'll throw so the caller knows it failed.
            throw;
        }
    }
}
