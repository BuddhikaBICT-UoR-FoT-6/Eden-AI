#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Eden AI – Azure Deployment Script
# Deploys backend to Azure App Service and frontend to Azure Static Web Apps
#
# Prerequisites:
#   az login
#   docker installed
#   Azure Container Registry (ACR) created
#
# Usage: ./deploy-azure.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ─── Config (update these) ────────────────────────────────────────────────────
RESOURCE_GROUP="eden-ai-rg"
LOCATION="eastus"
ACR_NAME="edenairegistry"
BACKEND_APP_NAME="eden-ai-backend"
FRONTEND_APP_NAME="eden-ai-frontend"
POSTGRES_SERVER="eden-ai-postgres"
POSTGRES_DB="eden_ai"
POSTGRES_ADMIN_USER="edenadmin"
POSTGRES_ADMIN_PASSWORD="YourStrongPassword123!"  # Change before production
GEMINI_API_KEY="${GEMINI_API_KEY}"  # Set via env variable

# ─── Step 1: Create Resource Group ───────────────────────────────────────────
echo "📦 Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# ─── Step 2: Create Azure Container Registry ─────────────────────────────────
echo "🏗️  Creating Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME --sku Basic --admin-enabled true

# Login to ACR
az acr login --name $ACR_NAME

# ─── Step 3: Build and Push Docker Images ────────────────────────────────────
echo "🐳 Building and pushing backend image..."
docker build -t $ACR_NAME.azurecr.io/eden-backend:latest ./backend
docker push $ACR_NAME.azurecr.io/eden-backend:latest

echo "🐳 Building and pushing frontend image..."
docker build -t $ACR_NAME.azurecr.io/eden-frontend:latest ./frontend
docker push $ACR_NAME.azurecr.io/eden-frontend:latest

# ─── Step 4: Create Azure Database for PostgreSQL ────────────────────────────
echo "🗄️  Creating Azure PostgreSQL Flexible Server..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user $POSTGRES_ADMIN_USER \
  --admin-password $POSTGRES_ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --public-access 0.0.0.0

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name $POSTGRES_DB

# ─── Step 5: Deploy Backend to Azure App Service ─────────────────────────────
echo "🚀 Deploying backend to Azure App Service..."
az appservice plan create \
  --name eden-ai-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 --is-linux

az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan eden-ai-plan \
  --name $BACKEND_APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/eden-backend:latest

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --settings \
    SPRING_DATASOURCE_URL="jdbc:postgresql://$POSTGRES_SERVER.postgres.database.azure.com:5432/$POSTGRES_DB" \
    SPRING_DATASOURCE_USERNAME="$POSTGRES_ADMIN_USER" \
    SPRING_DATASOURCE_PASSWORD="$POSTGRES_ADMIN_PASSWORD" \
    GEMINI_API_KEY="$GEMINI_API_KEY"

# ─── Step 6: Deploy Frontend to Azure Static Web Apps ────────────────────────
echo "🌐 Deploying frontend to Azure Static Web Apps..."
az staticwebapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source "https://github.com/BuddhikaBICT-UoR-FoT-6/Eden-AI" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"

echo ""
echo "✅ Deployment Complete!"
echo "Backend:  https://$BACKEND_APP_NAME.azurewebsites.net"
echo "Frontend: https://$FRONTEND_APP_NAME.azurestaticapps.net"
