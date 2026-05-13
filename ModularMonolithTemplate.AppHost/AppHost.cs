var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("Postgres")
	.WithDataVolume("modular-monolith-postgres-data");

var api = builder.AddProject<Projects.ModularMonolith_Host>("modular-monolith-host")
	.WithReference(postgres);

builder.AddExecutable("client-app", "bun", "../Client.React", "run", "dev")
	.WithReference(api)
	.WithHttpEndpoint(port: 5173, name: "http", isProxied: false)
	.WithEnvironment(context =>
	{
		context.EnvironmentVariables["VITE_API_BASE_URL"] = api.GetEndpoint("http");
	});

builder.AddJavaScriptApp("client-app-angular", "../Client.Angular", "dev")
	.WithBun()
	.WithReference(api)
	.WithHttpEndpoint(port: 4200, name: "http", isProxied: false);

await builder.Build().RunAsync();
