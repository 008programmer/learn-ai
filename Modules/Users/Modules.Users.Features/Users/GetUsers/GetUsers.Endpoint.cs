using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;
using Modules.Users.Domain.Policies;
using Modules.Users.Features.Users.Shared.Routes;

namespace Modules.Users.Features.Users.GetUsers;

public class GetUsersEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapGet(RouteConsts.GetAll, Handle)
            .RequireAuthorization(UserPolicyConsts.ReadPolicy);
    }

    private static async Task<IResult> Handle(
        [FromServices] IGetUsersHandler handler,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(cancellationToken);
        if (response.IsError)
        {
            return response.Errors.ToProblem();
        }

        return Results.Ok(response.Value);
    }
}
