FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["RentLanka.Api.csproj", "./"]
RUN dotnet restore "RentLanka.Api.csproj"
COPY . .
RUN dotnet build "RentLanka.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RentLanka.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RentLanka.Api.dll"]
