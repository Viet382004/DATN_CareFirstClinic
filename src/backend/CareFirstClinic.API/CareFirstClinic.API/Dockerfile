# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CareFirstClinic.API/CareFirstClinic.API.csproj", "CareFirstClinic.API/"]
RUN dotnet restore "CareFirstClinic.API/CareFirstClinic.API.csproj"
COPY . .
WORKDIR "/src/CareFirstClinic.API"
RUN dotnet build "CareFirstClinic.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "CareFirstClinic.API.csproj" -c Release -o /app/publish

# Stage 3: Final
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render yêu cầu ứng dụng chạy trên cổng 80 hoặc 10000
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "CareFirstClinic.API.dll"]