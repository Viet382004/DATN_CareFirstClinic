# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Vì Root Directory đã trỏ thẳng vào thư mục chứa code, 
# ta chỉ cần copy file .csproj nằm ngay tại đó.
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ code còn lại
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Final
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# Tên file DLL phải khớp với project của bạn
ENTRYPOINT ["dotnet", "CareFirstClinic.API.dll"]