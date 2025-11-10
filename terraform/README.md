# Terraform Configuration for Section L City Gems

This directory contains Terraform infrastructure-as-code for deploying the Section L City Gems application to Vercel.

## Prerequisites

1. **Terraform CLI** (>= 1.0)

   ```bash
   brew install terraform
   ```

2. **Vercel Account** with API token

   - Create token: https://vercel.com/account/tokens
   - Permissions needed: Read and Write

3. **GitHub Repository** connected to Vercel
   - Repository must be accessible by your Vercel account

## Quick Start

### 1. Configure Variables

```bash
# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your actual values
nano terraform.tfvars
```

Required variables:

- `vercel_api_token`: Your Vercel API token
- `github_repo`: Your GitHub repository (format: `owner/repo`)

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads the Vercel provider and initializes the backend.

### 3. Plan Deployment

```bash
terraform plan
```

Review the proposed changes before applying.

### 4. Deploy to Vercel

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

### 5. Verify Deployment

```bash
# View outputs
terraform output

# Access your deployment
open $(terraform output -raw deployment_url)
```

## Configuration

### Environment Variables

The following environment variables are automatically configured:

| Variable                   | Description                  | Target              |
| -------------------------- | ---------------------------- | ------------------- |
| `NODE_ENV`                 | Node environment             | production          |
| `SERVER_API_URL`           | Strapi CMS API URL           | all                 |
| `NEXT_PUBLIC_API_BASE_URL` | Client API base URL          | all                 |
| `STRAPI_API_TOKEN`         | Strapi auth token (optional) | production, preview |

### Customization

Edit `terraform.tfvars` to customize:

```hcl
# Project configuration
project_name = "section-l-city-gems"
environment = "production"  # or "staging", "development"

# Git configuration
production_branch = "main"  # or your production branch

# Optional: Team configuration
vercel_team_id = "team_xxxxx"  # for team accounts
```

## Common Commands

```bash
# View current state
terraform show

# List all resources
terraform state list

# Refresh state
terraform refresh

# Destroy all resources (use with caution!)
terraform destroy

# Format terraform files
terraform fmt

# Validate configuration
terraform validate
```

## Deployment Workflow

### Production Deployment

```bash
# 1. Ensure you're on the main branch
git checkout main

# 2. Plan the deployment
terraform plan -out=tfplan

# 3. Review the plan
terraform show tfplan

# 4. Apply the plan
terraform apply tfplan
```

### Staging Deployment

```bash
# Use workspace or separate tfvars
terraform apply -var="environment=staging" -var="project_name=section-l-city-gems-staging"
```

## Updating Configuration

### Add New Environment Variable

Edit `main.tf` and add to the `environment` list:

```hcl
{
  key    = "NEW_VAR"
  value  = "value"
  target = ["production"]
}
```

Then apply:

```bash
terraform apply
```

### Change Domain

Update the domain in `terraform.tfvars`:

```hcl
custom_domain = "cityy.section-l.co"
```

## Troubleshooting

### Authentication Issues

```bash
# Verify Vercel token
export VERCEL_API_TOKEN="your-token"
terraform plan
```

### State Lock Issues

```bash
# Force unlock (use carefully)
terraform force-unlock <lock-id>
```

### Provider Version Conflicts

```bash
# Upgrade providers
terraform init -upgrade
```

## Security Best Practices

1. **Never commit `terraform.tfvars`** - contains sensitive data
2. **Use environment variables** for secrets in CI/CD:
   ```bash
   export TF_VAR_vercel_api_token="xxx"
   export TF_VAR_strapi_api_token="xxx"
   ```
3. **Enable state locking** for team collaboration
4. **Use remote backend** (S3, Terraform Cloud) for production
5. **Rotate API tokens** regularly

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Terraform Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform

      - name: Terraform Plan
        run: terraform plan
        working-directory: ./terraform
        env:
          TF_VAR_vercel_api_token: ${{ secrets.VERCEL_API_TOKEN }}
          TF_VAR_strapi_api_token: ${{ secrets.STRAPI_API_TOKEN }}

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: ./terraform
        env:
          TF_VAR_vercel_api_token: ${{ secrets.VERCEL_API_TOKEN }}
          TF_VAR_strapi_api_token: ${{ secrets.STRAPI_API_TOKEN }}
```

## Resources

- [Vercel Terraform Provider](https://registry.terraform.io/providers/vercel/vercel/latest/docs)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)

## Support

For issues or questions:

1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review Terraform logs: `terraform show`
3. Contact DevOps team

## License

Private - Section L Internal Use Only
