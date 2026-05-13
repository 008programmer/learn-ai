using Microsoft.Extensions.Logging;
using Modules.Users.Domain.Email;

namespace Modules.Users.Infrastructure.Email;

// TODO: Replace with a real SMTP/SendGrid/etc. implementation.
internal sealed class LogEmailService(ILogger<LogEmailService> logger) : IEmailService
{
    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken)
    {
		logger.LogInformation("Password reset link for {Email}: {ResetLink}", toEmail, resetLink);
		return Task.CompletedTask;
    }
}
