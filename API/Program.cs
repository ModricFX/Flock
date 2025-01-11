using System.Text;
using flock.Data.DbContext;
using flock.Data.Repositories;
using flock.Data.Repositories.Interfaces;
using flock.Helpers;
using flock.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? throw new Exception("Missing JWT configuration");
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Set to true in production
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddCors(options =>
{
    /*options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:30002")  // Spremeniš na port na kerem hostas web
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });*/
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()   // <-- Allows requests from any origin
            .AllowAnyMethod()   // <-- Allows any HTTP method (GET, POST, etc.)
            .AllowAnyHeader();  // <-- Allows any HTTP headers
    });
    
});

builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();

builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "My Api", Version = "v1" });

    opt.EnableAnnotations();

    // Add Security Definition for Bearer authentication
    opt.AddSecurityDefinition("bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Scheme = "bearer",
        Description = "Enter your JWT token in the format 'Bearer {token}'"
    });

    // Attach Security Requirements globally
    opt.OperationFilter<AuthenticationRequirementsOperationFilter>();
});
builder.Services.AddHostedService<EventStateService>();




var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin");

// Debug Middleware: Move BEFORE UseAuthentication
app.Use(async (context, next) =>
{
    var authHeader = context.Request.Headers["Authorization"].ToString();
    Console.WriteLine($"Authorization Header: {authHeader}");
    await next();
});

app.UseAuthentication();
app.UseAuthorization();



app.MapControllers();

app.Run();