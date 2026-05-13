using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;
using Modules.Users.Features.Users.Shared.Routes;

namespace Modules.Users.Features.Users.ResetPassword;

public sealed record ResetPasswordRequest(string Email, string Token, string NewPassword);

public class ResetPasswordEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapPost(RouteConsts.ResetPassword, Handle);
    }

    private static async Task<IResult> Handle(
        [FromBody] ResetPasswordRequest request,
        IValidator<ResetPasswordRequest> validator,
        IResetPasswordHandler handler,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var response = await handler.HandleAsync(request, cancellationToken);
        if (response.IsError)
        {
            return response.Errors.ToProblem();
        }

        return Results.Ok();
    }
}
