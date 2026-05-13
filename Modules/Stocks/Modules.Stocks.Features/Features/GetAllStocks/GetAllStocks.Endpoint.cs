using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;
using Modules.Stocks.Domain.Policies;
using Modules.Stocks.Features.Features.Shared.Routes;

namespace Modules.Stocks.Features.Features.GetAllStocks;

public sealed record AllStocksResponse(string ProductName, int Quantity);

public class GetAllStocksApiEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapGet(RouteConsts.GetAll, Handle)
            .RequireAuthorization(StockPolicyConsts.ReadPolicy);
    }

    private static async Task<IResult> Handle(
        IGetAllStocksHandler handler,
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
