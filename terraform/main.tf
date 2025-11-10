terraform {
  required_version = ">= 1.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }

  # Recommended: Use remote backend for team collaboration
  # Uncomment and configure for production use
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "section-l-city-gems/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

# ============================================================================
# Variables
# ============================================================================

variable "vercel_api_token" {
  description = "Vercel API Token for authentication"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team ID (optional, for team projects)"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo' (e.g., 'Section-L/section-l-city-gems')"
  type        = string
}

variable "production_branch" {
  description = "Git branch to use for production deployments"
  type        = string
  default     = "main"
}

variable "strapi_api_url" {
  description = "Strapi CMS API URL"
  type        = string
  default     = "https://content.section-l.co/api"
}

variable "strapi_api_token" {
  description = "Strapi API authentication token (optional, for private endpoints)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "project_name" {
  description = "Project name in Vercel"
  type        = string
  default     = "section-l-city-gems"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development"
  }
}

# ============================================================================
# Provider Configuration
# ============================================================================

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

# ============================================================================
# Vercel Project
# ============================================================================

resource "vercel_project" "city_gems" {
  name      = var.project_name
  framework = "nextjs"

  # Git repository configuration
  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  # Build configuration
  build_command = "npm run build"
  output_directory = ".next"
  install_command = "npm install"

  # Serverless function configuration
  serverless_function_region = "iad1" # Washington DC, closest to content origin

  # Environment variables
  # Note: sensitive values should be set via Vercel UI or separate mechanism
  environment = concat(
    [
      {
        key    = "NODE_ENV"
        value  = "production"
        target = ["production"]
      },
      {
        key    = "SERVER_API_URL"
        value  = var.strapi_api_url
        target = ["production", "preview", "development"]
      },
      {
        key    = "NEXT_PUBLIC_API_BASE_URL"
        value  = "/api" # Use Next.js API routes as proxy
        target = ["production", "preview", "development"]
      },
    ],
    # Conditionally add STRAPI_API_TOKEN if provided
    var.strapi_api_token != "" ? [
      {
        key    = "STRAPI_API_TOKEN"
        value  = var.strapi_api_token
        target = ["production", "preview"]
        type   = "secret"
      }
    ] : []
  )

  # Auto-assign production domain
  production_deployment_enabled = true

  # Vercel configuration options
  automatically_expose_system_environment_variables = false
}

# ============================================================================
# Project Settings
# ============================================================================

resource "vercel_project_domain" "city_gems_domain" {
  count      = var.environment == "production" ? 1 : 0
  project_id = vercel_project.city_gems.id
  domain     = "${var.project_name}.vercel.app"

  lifecycle {
    # Prevent accidental domain deletion
    prevent_destroy = false
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "project_id" {
  description = "Vercel Project ID"
  value       = vercel_project.city_gems.id
}

output "project_name" {
  description = "Vercel Project Name"
  value       = vercel_project.city_gems.name
}

output "deployment_url" {
  description = "Latest deployment URL"
  value       = "https://${var.project_name}.vercel.app"
}

output "git_repository" {
  description = "Connected Git repository"
  value       = var.github_repo
}
