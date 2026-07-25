# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Restore project dependencies before copying source files to maximize layer reuse.
COPY tracksByPopularity.csproj ./
COPY Domain/tracksByPopularity.Domain.csproj Domain/
COPY Application/tracksByPopularity.Application.csproj Application/
COPY Infrastructure/tracksByPopularity.Infrastructure.csproj Infrastructure/
COPY Presentation/tracksByPopularity.Presentation.csproj Presentation/
RUN dotnet restore tracksByPopularity.csproj

COPY . .
RUN dotnet publish tracksByPopularity.csproj -c Release -o /app/publish --no-restore

# Stage 2: Production
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .
RUN mkdir -p /app/logs && chown -R "$APP_UID:$APP_UID" /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

USER $APP_UID

ENTRYPOINT ["dotnet", "tracksByPopularity.dll"]
