using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;
using Modules.Users.Domain.Email;
using Modules.Users.Domain.Users;

namespace Modules.Users.Features.Users.ForgotPassword;

internal interface IForgotPasswordHandler : IHandler
{
    Task<Result<Success>> HandleAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
}

internal sealed class ForgotPasswordHandler(
    UserManager<User> userManager,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<ForgotPasswordHandler> logger)
    : IForgotPasswordHandler
{
    public async Task<Result<Success>> HandleAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            logger.LogInformation("Forgot password requested for non-existent email: {Email}", request.Email);
            return Result.Success;
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(request.Email);

        var clientBaseUrl = configuration.GetValue<string>("ClientBaseUrl") ?? "http://localhost:5173";
        var resetLink = $"{clientBaseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

        await emailService.SendPasswordResetEmailAsync(request.Email, resetLink, cancellationToken);

        logger.LogInformation("Password reset link generated for user: {Email}", request.Email);
        return Result.Success;
    }
}
