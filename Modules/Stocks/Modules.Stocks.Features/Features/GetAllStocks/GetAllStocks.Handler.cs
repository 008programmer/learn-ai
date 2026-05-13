using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;
using Modules.Stocks.Infrastructure.Database;

namespace Modules.Stocks.Features.Features.GetAllStocks;

internal interface IGetAllStocksHandler : IHandler
{
    Task<Result<IReadOnlyList<AllStocksResponse>>> HandleAsync(CancellationToken cancellationToken);
}

internal sealed class GetAllStocksHandler(
    StocksDbContext context,
    ILogger<GetAllStocksHandler> logger)
    : IGetAllStocksHandler
{
    public async Task<Result<IReadOnlyList<AllStocksResponse>>> HandleAsync(CancellationToken cancellationToken)
    {
        var stocks = await context.ProductStocks
            .OrderBy(x => x.ProductName)
            .Select(x => new AllStocksResponse(x.ProductName, x.AvailableQuantity))
            .ToListAsync(cancellationToken);

        logger.LogInformation("Retrieved {Count} stocks", stocks.Count);

        return stocks;
    }
}
