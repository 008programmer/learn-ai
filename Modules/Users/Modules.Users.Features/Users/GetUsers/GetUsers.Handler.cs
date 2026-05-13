using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;
using Modules.Users.Features.Users.Shared;
using Modules.Users.Infrastructure.Database;

namespace Modules.Users.Features.Users.GetUsers;

internal interface IGetUsersHandler : IHandler
{
    Task<Result<List<UserResponse>>> HandleAsync(CancellationToken cancellationToken);
}

internal sealed class GetUsersHandler(
    UsersDbContext context,
    ILogger<GetUsersHandler> logger)
    : IGetUsersHandler
{
    public async Task<Result<List<UserResponse>>> HandleAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Getting all users");

        var users = await context.Users
            .AsNoTracking()
            .Select(u => new UserResponse(u.Id, u.Email, u.City))
            .ToListAsync(cancellationToken);

        return users;
    }
}
