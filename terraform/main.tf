terraform {
  required_version = ">= 1.5.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

# ============================================================================
# Variables
# ============================================================================

variable "vercel_api_token" {
  description = "Vercel API token (stored securely in CI or Terraform Cloud)"
  type        = string
  sensitive   = true
}

variable "vercel_team_slug" {
  description = "Vercel team slug (e.g., 'lyosha85s-projects')"
  type        = string
}

variable "vercel_team_internal_id" {
  description = "Vercel team internal ID (e.g., 'team_ywHhCtXbhU7vEnUsa1phLBVb')"
  type        = string
}

variable "environment" {
  description = "Deployment environment (prod, staging)"
  type        = string
}

variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo' (lowercase)"
  type        = string
}

variable "custom_domain" {
  description = "Optional custom domain (e.g., citygems.example.com)"
  type        = string
  default     = null
}

variable "vercel_domain" {
  description = "Vercel default domain (e.g., section-l-city-gems.vercel.app)"
  type        = string
  default     = null
}

# ============================================================================
# Provider Configuration
# ============================================================================

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_slug # Team slug for scoping
}

# ============================================================================
# Vercel Project
# ============================================================================

resource "vercel_project" "app" {
  name    = var.project_name
  team_id = var.vercel_team_internal_id

  framework = "nextjs"

  # Git repository as object (not block)
  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  build_command    = "npm run build"
  output_directory = ".next"
  install_command  = "npm install"

  # === LIFECYCLE: Ignore only configurable, volatile attributes ===
  lifecycle {
    ignore_changes = [
      # System-managed (configurable)
      automatically_expose_system_environment_variables,
      customer_success_code_visibility,
      directory_listing,
      function_failover,
      git_lfs,
      oidc_token_config,
      prioritise_production_builds,
      serverless_function_region,
      vercel_authentication,

      # Git repository sub-attribute
      git_repository.production_branch,
    ]
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "project_id" {
  description = "Vercel Project ID"
  value       = vercel_project.app.id
}

output "project_name" {
  description = "Vercel Project Name"
  value       = vercel_project.app.name
}

output "deployment_url" {
  description = "Default Deployment URL"
  value       = "https://${var.vercel_domain}"
}

output "git_repository" {
  description = "Connected Git Repository"
  value       = var.github_repo
}
