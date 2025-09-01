# Lab-Turtorial
# Lab Tutorial - Professional Turborepo Monorepo

A professional Turborepo monorepo with type-safe API contract that transforms natural language descriptions into fully functional web applications using AI agents.

## 🏗️ Monorepo Structure

```
/
├── apps/
│   ├── frontend/          # React/Vite application (@lab-tutorial/frontend)
│   └── backend/           # AWS SAM serverless backend (@lab-tutorial/backend)
├── packages/
│   ├── shared-types/      # Type-safe API contract (@lab-tutorial/shared-types)
│   ├── eslint-config-custom/  # Shared ESLint configuration
│   ├── tsconfig/          # Shared TypeScript configurations
│   └── infrastructure/    # AWS CDK infrastructure (@lab-tutorial/infrastructure)
├── docs/                  # Documentation files
├── turbo.json             # Turborepo pipeline configuration
└── package.json           # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- AWS CLI configured (for deployment)
- AWS SAM CLI (for local development)

### 1. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Build All Packages

```bash
# Build all packages in correct dependency order
npm run build
```

### 3. Run Tests

```bash
# Run all test suites
npm run test
```

### 4. Development

```bash
# Start all applications in development mode
npm run dev
```

## 📦 Packages Overview

### Applications (`apps/`)

#### Frontend (`@lab-tutorial/frontend`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + React Query
- **Location**: `apps/frontend/`

#### Backend (`@lab-tutorial/backend`)
- **Technology**: AWS SAM + TypeScript + Node.js 20.x
- **Database**: Amazon DynamoDB
- **API**: AWS API Gateway + OpenAPI 3.0
- **Location**: `apps/backend/`

### Shared Packages (`packages/`)

#### Shared Types (`@lab-tutorial/shared-types`)
Type-safe API contract providing:
- User management types
- Project and task management types  
- Agent system types
- API request/response types
- WebSocket message types
- Authentication types

#### ESLint Config (`@lab-tutorial/eslint-config-custom`)
Shared ESLint configurations for:
- Base TypeScript rules
- React-specific rules
- Node.js-specific rules

#### TypeScript Config (`@lab-tutorial/tsconfig`)
Shared TypeScript configurations for:
- Base configuration
- React applications
- Node.js applications
- Library packages

#### Infrastructure (`@lab-tutorial/infrastructure`)
- **Technology**: AWS CDK + TypeScript
- **Purpose**: Infrastructure as Code definitions
- **Location**: `packages/infrastructure/`

## 🛠️ Development Commands

### Root Level Commands

```bash
# Build all packages
npm run build

# Run all tests
npm run test

# Start all apps in development mode
npm run dev

# Lint all packages
npm run lint

# Type check all packages
npm run type-check

# Clean all build outputs
npm run clean

# Format all code
npm run format
```

### Individual Package Commands

```bash
# Work with specific packages
cd apps/frontend && npm run dev
cd apps/backend && npm run test
cd packages/shared-types && npm run build
```

## 🎯 Key Features

### Type-Safe API Contract
- Single source of truth for all type definitions
- Shared between frontend and backend
- Automatic type checking across packages
- Export formats: CommonJS, ESM, and TypeScript definitions

### Turborepo Pipeline
- Optimized builds with dependency management
- Intelligent caching for faster builds
- Parallel execution where possible
- Clear task dependencies

### Shared Configurations
- Consistent ESLint rules across all packages
- Shared TypeScript configurations
- Standardized build and development scripts

### Independent Applications
- Frontend and backend can be developed separately
- Isolated deployment pipelines
- Clear separation of concerns

## 🧪 Testing Strategy

### Backend Testing (`apps/backend`)
- **Framework**: Jest + ts-jest
- **Coverage**: 22 passing tests
- **Types**: Unit tests and integration tests
- **Location**: `apps/backend/src/__tests__/`

### Frontend Testing (`apps/frontend`)
- **Framework**: Jest + React Testing Library
- **Setup**: Ready for component and integration tests
- **Location**: `apps/frontend/src/__tests__/` (to be added)

### Package Testing
Each package can have its own test suite following the same patterns.

## 🚀 Deployment

### Backend Deployment
```bash
cd apps/backend
npm run build
npm run deploy
```

### Frontend Deployment
```bash
cd apps/frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

### Infrastructure Deployment
```bash
cd packages/infrastructure
npm run cdk:deploy
```

## 📈 Performance Optimizations

### Turborepo Caching
- Builds are cached based on file changes
- Only affected packages are rebuilt
- Significant time savings in CI/CD

### Build Optimization
- TypeScript project references
- Incremental compilation
- Tree shaking enabled
- Code splitting configured

## 🔧 Configuration

### Adding New Packages

1. Create package directory in `packages/` or `apps/`
2. Add `package.json` with proper naming convention
3. Configure TypeScript and ESLint
4. Update root `package.json` workspaces if needed
5. Add to `turbo.json` pipeline if needed

### Workspace Dependencies

Use workspace protocol for internal dependencies:
```json
{
  "dependencies": {
    "@lab-tutorial/shared-types": "workspace:*"
  }
}
```

## 📚 Documentation

- **[API Documentation](docs/README.md)** - Complete API specification
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment instructions
- **[Setup Guide](docs/SETUP.md)** - Development setup
- **[Mock API Guide](docs/MOCK_API_GUIDE.md)** - Testing with mock data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate package
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Submit a pull request

### Development Guidelines

- Use shared types from `@lab-tutorial/shared-types`
- Follow ESLint configuration from `@lab-tutorial/eslint-config-custom`
- Use appropriate TypeScript config from `@lab-tutorial/tsconfig`
- Add tests for new functionality
- Update documentation as needed

## 🏆 Benefits of This Architecture

### Scalability
- Easy to add new applications or packages
- Independent deployment and development
- Clear separation of concerns

### Developer Experience
- Fast builds with intelligent caching
- Consistent tooling across packages
- Type safety across package boundaries

### Maintainability
- Single source of truth for types
- Shared configurations reduce duplication
- Clear dependency management

### Performance
- Turborepo's smart caching
- Only rebuild what's changed
- Parallel task execution

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ using Turborepo**

*Transforming ideas into applications through modern monorepo architecture*
