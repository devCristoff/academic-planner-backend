# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Academic Planner Backend is a NestJS TypeScript application for managing academic planning. It provides REST APIs for user authentication, managing academic terms, subjects, and assignments with support for Canvas LMS integration.

**Tech Stack**: NestJS 11, TypeScript, MySQL, TypeORM, JWT Auth, Swagger/OpenAPI

## Quick Start

```bash
# Install dependencies
pnpm install

# Development (watch mode)
pnpm run start:dev

# Build for production
pnpm build

# Run tests
pnpm test
pnpm test:watch
pnpm test:cov

# Linting and formatting
pnpm run lint      # Fix ESLint issues
pnpm run format    # Format with Prettier
```

**Database Setup**: MySQL 8.0+, configured via `.env.development` (see `.env.example`). Entities are auto-discovered; use TypeORM migrations when schema changes are needed.

**API Documentation**: Swagger docs available at `http://localhost:3001/docs` when the server is running.

## Project Architecture

### Directory Structure

```
src/
├── main.ts                          # App bootstrap with Swagger, interceptors, filters
├── app.module.ts                    # Root module that imports all feature modules
├── app.controller.ts                # Health check endpoint
├── config/
│   └── database.config.ts           # TypeORM configuration factory
├── common/                          # Shared utilities and infrastructure
│   ├── decorators/                  # Custom decorators (e.g., @GetUser)
│   ├── enums/                       # Shared enumerations
│   ├── exceptions/                  # Custom exceptions
│   ├── filters/                     # Global exception filters (HTTP)
│   ├── guards/                      # Auth guards (JWT)
│   ├── interceptors/                # Global interceptors (logging, response transform, datetime)
│   ├── repositories/                # Base and specialized repositories
│   ├── services/                    # Shared services (MailService, TermContextService)
│   ├── transformers/                # Data transformers/DTOs
│   ├── utils/                       # Utility functions (DateUtils, etc.)
│   └── common.module.ts             # Exports guards, services, repositories
└── modules/                         # Feature modules (each has controller, service, entities, DTOs)
    ├── auth/                        # User authentication (JWT, Canvas OAuth)
    ├── academic-terms/              # Term management
    ├── subjects/                    # Course/subject management
    ├── assignments/                 # Assignment tracking
    ├── calendar/                    # Calendar view of events
    ├── board/                       # Board view of assignments
    └── dashboard/                   # Aggregate dashboard data
```

### Core Patterns

**Entity Naming Convention**:
- `dt_*` (Definition Tables): Master data and core entities (e.g., `DtUser`, `DtAcademicTerm`)
- `ht_*` (History Tables): Entities tracking changes and relationships over time (e.g., `HtSubject`, `HtAssignment`)

**Repository Pattern**:
All repositories extend `BaseRepository<Entity>` from `common/repositories/base.repository.ts`. Provides:
- `findById(id)` - Get entity by primary key
- `createAndSave(data)` - Create and persist entity
- `updateById(id, data)` - Update and retrieve entity
- `deleteById(id)` - Delete by ID
- `existsById(id)` - Check existence
- `createQB(alias)` - Create a TypeORM query builder for complex queries

**Module Structure**:
Each feature module (e.g., `AssignmentsModule`) follows this pattern:
```typescript
@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([...entities])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export service for use in other modules
})
export class FeatureModule {}
```

### Global Infrastructure (Bootstrap)

**Validation Pipe** (main.ts):
- Whitelist: only defined DTO properties pass through
- Transform: auto-convert types (e.g., `"1"` → `1` for number fields)
- Used on all endpoints by default

**Interceptors** (main.ts, in order):
1. `RequestLoggingInterceptor` - Logs incoming requests
2. `DateTimeInterceptor` - Adds/transforms timezone-aware dates
3. `ResponseTransformInterceptor` - Wraps responses in standard envelope

**Filters** (main.ts):
- `HttpExceptionFilter` - Catches and formats HTTP exceptions

**Authentication**:
- JWT via Passport strategy (`auth/strategies/jwt.strategy`)
- Token verified on protected routes using `@UseGuards(JwtAuthGuard)`
- Bearer token format: `Authorization: Bearer <token>`

**Swagger/OpenAPI**:
- Configured at bootstrap with `@nestjs/swagger`
- Controllers should use `@ApiOperation`, `@ApiResponse` decorators for documentation
- Bearer auth scheme registered as `'access-token'`

## Key Services & Utilities

### Common Services

**MailService** (`common/services/mail.service.ts`):
- Sends OTP emails via SMTP
- Uses `nodemailer` with config from environment (`SMTP_*`)

**TermContextService** (`common/services/term-context.service.ts`):
- REQUEST scoped service to track the current academic term per request
- Populated from JWT payload or query params
- Used by multiple modules to filter data by term

### Common Repositories

**AssignmentRepository** - Custom queries for assignments (complex filtering, aggregations)
**SubjectRepository** - Queries for user subjects within a term
**AcademicTermRepository** - Term-related queries
**DashboardQueryRepository** - Aggregated dashboard statistics

## Environment Configuration

All config comes from `.env.*` files (env-specific: `.env.development`, `.env.production`, or `.env`).

**Key Variables**:
- `API_PORT` - Server port (default: 3001)
- `APP_TIMEZONE` - Timezone for datetime operations (e.g., `America/Chicago`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `JWT_SECRET`, `JWT_EXPIRES_IN` - JWT signing and expiration

Accessed via `ConfigService` (injected from `@nestjs/config`).

## Testing

**Unit Tests**: Limited coverage (1 spec file). Add `*.spec.ts` files in module folders.
- Jest runner, ts-jest transformer
- Root dir is `src/`, test files must match `.*\.spec\.ts$`
- Coverage dir: `coverage/`

**E2E Tests**: `test/jest-e2e.json` config
- Run with `pnpm test:e2e`

## Common Development Tasks

### Adding a New Endpoint

1. Create or update `module-name/module-name.controller.ts`
   - Use `@Get`, `@Post`, etc. decorators
   - Inject service via constructor
   - Add Swagger decorators (`@ApiOperation`, `@ApiResponse`)

2. Update `module-name/module-name.service.ts` with business logic

3. Create DTOs in `module-name/dto/` for request/response contracts
   - Use `class-validator` for validation rules

4. Inject `CommonModule` in the feature module if using shared services/repositories

### Querying with Repository

```typescript
// Simple query
const subject = await this.subjectRepository.findById(id);

// Complex query using query builder
const qb = this.createQB('assignment');
qb.where('assignment.dtUserId = :userId', { userId })
  .andWhere('assignment.status = :status', { status: 'active' })
  .orderBy('assignment.dueDate', 'ASC');
const assignments = await qb.getMany();
```

### Working with DTOs

DTOs enforce request/response shapes via `class-validator` decorators:
```typescript
export class CreateAssignmentDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Handling Authentication

- Use `@UseGuards(JwtAuthGuard)` decorator on protected routes
- Extract user from request: `@GetUser() user: DtUser` (custom decorator in `common/decorators`)
- JWT payload contains user ID; use `TermContextService` to get the active term per request

### Error Handling

Throw NestJS HTTP exceptions:
```typescript
throw new BadRequestException('Assignment not found');
throw new UnauthorizedException('Invalid credentials');
throw new InternalServerErrorException('Database error');
```

They are caught by the global `HttpExceptionFilter` and formatted consistently.

## Database Notes

- **Database-First Approach**: The database schema is designed first, entities are manually created to match (not auto-generated). Continue this approach for schema changes.
- **Synchronize**: Set to `false` in `database.config.ts` — schema is managed separately, not auto-synchronized
- **Entity Naming**: Database table names use the `dt_*` and `ht_*` prefixes (e.g., `dt_user`, `ht_assignment`)
- **Relationships**: Entities use `@OneToMany`, `@ManyToOne` decorators to define relations
- **Lazy Loading**: Relations are loaded only when accessed (check TypeORM docs for `eager` loading if needed)
- **Entity Creation**: Manually create entity files to match database schema; do not rely on auto-generation

## Key Imports & Paths

- `@/src/...` - Absolute path alias for source files (configured in `tsconfig.json`)
- Framework: `@nestjs/*`
- Database: `typeorm`, `@nestjs/typeorm`
- Auth: `passport`, `@nestjs/passport`, `jsonwebtoken`
- Validation: `class-validator`, `class-transformer`
