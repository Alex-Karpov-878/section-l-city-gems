# Section L City Gems Kiosk

A sleek, modern kiosk application designed for Section L properties. It provides guests with a curated guide to local points of interest ("City Gems"), enhancing their stay by connecting them with the surrounding neighborhood. The application is built with Next.js, TypeScript, and features a shareable mobile experience via QR code.

## Features

- **Property Selection**: Kiosk boots to a configuration screen for staff to select the property.
- **Gem Discovery**: Browse a feed of city gems, beautifully displayed and grouped by neighborhood.
- **Dynamic Filtering**: Instantly filter gems by category (e.g., Food & Drink, Shopping) and perform full-text searches.
- **Favorites List**: Guests can create a personal list of favorite gems.
- **QR Code Sharing**: Generate a QR code to transfer the favorites list to a mobile device for on-the-go access.
- **Detailed Gem View**: A modal provides in-depth information, images, and a direct link to Google Maps for each gem.
- **Kiosk Mode**:
  - An inactivity timer automatically resets the session for the next guest.
  - A hidden multi-tap gesture on the logo allows staff to refresh data or re-enter the configuration screen.
- **Responsive Design**: Fully responsive for a seamless experience on kiosk tablets, desktops, and mobile devices.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14+ (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React.js](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (with Immer)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Backend CMS**: [Strapi](https://strapi.io/) (consumed via REST API)
- **Unit & Integration Testing**: [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/)
- **End-to-End Testing**: [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Infrastructure as Code**: [Terraform](https://www.terraform.io/)
- **Code Quality**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Husky](https://typicode.github.io/husky/), [lint-staged](https://github.com/okonet/lint-staged)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [pnpm](https://pnpm.io/) (v9.x or later)

### 1. Environment Variables

Create a `.env.local` file in the root of the project by copying the example file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with the necessary values:

- `NEXT_PUBLIC_STRAPI_URL`: The base URL for the Strapi CMS API.
- `STRAPI_API_TOKEN`: (Optional) The Bearer token for authenticating with the Strapi API.

### 2. Installation

Install the project dependencies using pnpm:

```bash
pnpm install
```

### 3. Running the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). The first page you see will be the property configuration screen.

---

## Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production-ready build of the application.
- `pnpm start`: Starts the production server (requires `pnpm build` first).
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm format`: Formats all files using Prettier.
- `pnpm type-check`: Runs the TypeScript compiler to check for type errors.
- `pnpm test`: Runs all unit and integration tests with Vitest.
- `pnpm test:e2e`: Runs the end-to-end tests with Playwright.

---

## Testing

This project uses a comprehensive testing strategy to ensure reliability and code quality.

### Unit & Integration Tests

Unit and integration tests are written with [Vitest](https://vitest.dev/). They are primarily used for testing API routes, utility functions, and hooks.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

### End-to-End Tests

End-to-end tests simulate full user journeys and are written with [Playwright](https://playwright.dev/).

```bash
# First, ensure the development server is running
pnpm dev

# In a new terminal, run the Playwright tests
pnpm test:e2e

# To open the Playwright UI for debugging
pnpm test:e2e --ui
```

---

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/) and managed with [Terraform](https://www.terraform.io/).

### Setup

1.  Navigate to the Terraform directory: `cd terraform`
2.  Copy the example variables file: `cp terraform.tfvars.example terraform.tfvars`
3.  Fill in the required variables in `terraform.tfvars`, including your Vercel API token and GitHub repository details.

### Deployment Commands

```bash
# Initialize Terraform and download providers
terraform init

# Preview the changes that will be applied
terraform plan

# Apply the configuration to deploy the project
terraform apply
```

---

## Code Quality

Code quality and consistency are enforced automatically using:

- **ESLint**: For identifying and fixing problems in JavaScript/TypeScript code.
- **Prettier**: For consistent code formatting.
- **Husky & lint-staged**: To run linting and formatting checks on staged files before each commit.

This ensures that all code pushed to the repository adheres to the project's standards.
