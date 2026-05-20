# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Chỉ copy file csproj trước để tối ưu cache restore
COPY VibeApp.csproj ./
RUN dotnet restore "VibeApp.csproj"

# Copy phần còn lại và publish
COPY . .
RUN dotnet publish "VibeApp.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage (nhỏ gọn, chỉ ASP.NET Core runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Lắng nghe trên cổng 8080 bên trong container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VibeApp.dll"]