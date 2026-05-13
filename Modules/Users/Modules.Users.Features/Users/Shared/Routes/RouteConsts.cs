namespace Modules.Users.Features.Users.Shared.Routes;

internal static class RouteConsts
{
    private const string BaseRoute = "/api/users";

    internal const string GetAll = BaseRoute;

    internal const string GetById = $"{BaseRoute}/{{userId}}";

    internal const string Login = $"{BaseRoute}/login";

    internal const string Register = $"{BaseRoute}/register";

    internal const string RefreshToken = $"{BaseRoute}/refresh";

    internal const string UpdateUser = $"{BaseRoute}/{{userId}}";

    internal const string DeleteUser = $"{BaseRoute}/{{userId}}";
    
    internal const string UpdateUserRole = $"{BaseRoute}/{{userId}}/role";

    internal const string ForgotPassword = $"{BaseRoute}/forgot-password";

    internal const string ResetPassword = $"{BaseRoute}/reset-password";
}
