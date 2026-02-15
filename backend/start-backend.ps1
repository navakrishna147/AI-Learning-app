#!/usr/bin/env pwsh

<#
============================================================================
START BACKEND SERVER - PowerShell Script
============================================================================

This PowerShell script starts the backend development server with
proper monitoring and error handling.

Usage:
  1. From PowerShell: .\start-backend.ps1
  2. Or: pwsh .\start-backend.ps1

Prerequisites:
  - PowerShell 5.0+ (comes with Windows 10+)
  - Node.js installed and in PATH
  - MongoDB running locally or Atlas connection configured

============================================================================
#>

# Set error action preference
$ErrorActionPreference = "Stop"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 STARTING AI LEARNING ASSISTANT - BACKEND SERVER" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location $scriptDir

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js found" -ForegroundColor Green
node --version

# Check npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ ERROR: npm is not installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ npm found" -ForegroundColor Green
npm --version
Write-Host ""

# Check .env file
if (-not (Test-Path ".env" -PathType Leaf)) {
    Write-Host "⚠️  WARNING: .env file not found" -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path ".env.example" -PathType Leaf) {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env created from .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Edit .env with your configuration:" -ForegroundColor Yellow
        Write-Host "   - MONGODB_URI: Your MongoDB connection string" -ForegroundColor Gray
        Write-Host "   - JWT_SECRET: A strong random secret (32+ chars)" -ForegroundColor Gray
        Write-Host "   - GROQ_API_KEY: Your Groq API key (optional)" -ForegroundColor Gray
        Write-Host ""
        Read-Host "Press Enter to continue"
    } else {
        Write-Host "❌ ERROR: .env.example not found" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Configuration (.env) found" -ForegroundColor Green
Write-Host ""

# Check node_modules
if (-not (Test-Path "node_modules" -PathType Container)) {
    Write-Host "Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: npm install failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Display server information
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Starting backend server..." -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server Details:" -ForegroundColor Yellow
Write-Host "  - Main URL: http://localhost:5000" -ForegroundColor Gray
Write-Host "  - Health Check: http://localhost:5000/health" -ForegroundColor Gray
Write-Host "  - API Health: http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host "  - Detailed Health: http://localhost:5000/api/health/detailed" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend Connection:" -ForegroundColor Yellow
Write-Host "  - Frontend should be running on: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "To Stop the Server:" -ForegroundColor Yellow
Write-Host "  - Press Ctrl+C in this window" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start the backend server
Write-Host "Starting server with nodemon (auto-restart on file changes)..." -ForegroundColor Cyan
npm run dev

# If we reach here, the server stopped
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Backend server stopped" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
