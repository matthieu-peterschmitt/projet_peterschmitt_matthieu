# TP4 Web Frontend

Angular frontend application for the TP4 project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18 or [Bun](https://bun.sh) >= 1.0
- [Angular CLI](https://angular.dev/tools/cli) >= 20.3.3

### Installation

```bash
cd web
npm install  # or bun install
```

If you don't have Angular CLI installed globally:

```bash
npm install -g @angular/cli
```

## Development Server

To start a local development server:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`):

```bash
ng generate --help
```

## Building

To build the project for production:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running Unit Tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner:

```bash
ng test
```

## Running End-to-End Tests

For end-to-end (e2e) testing:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Available Scripts

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng lint` - Lint the code
- `ng generate` - Generate new components, services, etc.

## Project Structure

```
web/
├── src/
│   ├── app/              # Application components and logic
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── index.html        # Main HTML file
│   ├── main.ts           # Application entry point
│   └── styles.css        # Global styles
├── public/               # Public static files
├── angular.json          # Angular CLI configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Connecting to API

The API backend runs on `http://localhost:3000` by default. Configure API calls in your services:

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getData() {
    return this.http.get(`${this.apiUrl}/hello`);
  }
}
```

For production, use environment configuration files to set the correct API URL.

## Docker Deployment

### Building the Docker Image

```bash
docker build -t tp4-web .
```

### Running the Container

```bash
docker run -p 80:80 tp4-web
```

The application will be available at `http://localhost:80`.

### Docker Image Details

- **Base Image:** nginx:alpine
- **Build Tool:** Bun (for building Angular app)
- **Port:** 80
- **Size:** Optimized for production with multi-stage build

The Dockerfile uses a multi-stage build:

1. **Install stage:** Installs dependencies
2. **Build stage:** Builds the Angular application
3. **Release stage:** Serves static files with Nginx

## Technologies

- **Framework:** Angular 20.3.3
- **Language:** TypeScript
- **Build Tool:** Angular CLI
- **Runtime:** Node.js / Bun

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Style Guide](https://angular.dev/style-guide)
