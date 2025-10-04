# Azure Infrastructure Deployment Script
# This script deploys the Azure resources needed for the Daily Mess Feedback System

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location,
    
    [Parameter(Mandatory=$true)]
    [string]$SqlAdminPassword
)

# Set Azure subscription
Write-Host "Setting Azure subscription..." -ForegroundColor Green
az account set --subscription $SubscriptionId

# Create resource group
Write-Host "Creating resource group: $ResourceGroupName" -ForegroundColor Green
az group create --name $ResourceGroupName --location $Location

# Deploy ARM template
Write-Host "Deploying Azure resources..." -ForegroundColor Green
az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file ".azure/arm-templates/main.json" `
    --parameters ".azure/arm-templates/parameters.json" `
    --parameters sqlAdminPassword=$SqlAdminPassword

Write-Host "Deployment completed!" -ForegroundColor Green

# Get deployment outputs
Write-Host "Getting deployment outputs..." -ForegroundColor Green
$outputs = az deployment group show --resource-group $ResourceGroupName --name main --query properties.outputs

Write-Host "Deployment Outputs:" -ForegroundColor Yellow
Write-Host $outputs
