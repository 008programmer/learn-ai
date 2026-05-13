using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;
using Modules.Users.Domain.Errors;
using Modules.Users.Domain.Users;

namespace Modules.Users.Features.Users.ResetPassword;

internal interface IResetPasswordHandler : IHandler
{
    Task<Result<Success>> HandleAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}

internal sealed class ResetPasswordHandler(
    UserManager<User> userManager,
    ILogger<ResetPasswordHandler> logger)
    : IResetPasswordHandler
{
    public async Task<Result<Success>> HandleAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            logger.LogInformation("Reset password attempted for non-existent email: {Email}", request.Email);
            return UserErrors.NotFoundByEmail(request.Email);
        }

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            logger.LogWarning("Failed to reset password for user {Email}: {@Errors}", request.Email, result.Errors);
            return UserErrors.ResetPasswordFailed(result.Errors);
        }

        logger.LogInformation("Password successfully reset for user: {Email}", request.Email);
        return Result.Success;
    }
}
