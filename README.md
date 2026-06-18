# Eden AI — Complete Project Documentation

> **Enterprise-grade, vibe-based hotel & villa finder for the Sri Lankan tourism market.**
> Powered by Google Gemini AI, Spring Boot, React, and PostgreSQL.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Getting Started](#getting-started)
6. [Backend API Reference](#backend-api-reference)
7. [Frontend Component Guide](#frontend-component-guide)
8. [Theme System](#theme-system)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide (Azure)](#deployment-guide-azure)
11. [UX Design Principles](#ux-design-principles)
12. [SOLID Architecture Decisions](#solid-architecture-decisions)
13. [Contributing](#contributing)

---

## Project Overview

Eden AI redefines Sri Lankan travel discovery. Instead of searching with checkboxes and dropdowns, users describe their ideal stay in natural language:

> *"I want a quiet jungle villa near Ella, under $300 a night, perfect for a honeymoon."*

The Gemini AI layer extracts structured parameters (location, vibe, budget) from this sentence and returns semantically matched properties from the database.

### Key Features

| Feature | Description |
|---|---|
| **AI Vibe Search** | Natural language → Gemini structured output → filtered results |
| **Cultural Themes** | Auto-detected or user-selected UI themes (Poya, Avurudu, Eid, etc.) |
| **Responsive UI** | Premium glassmorphism design, skeleton loaders, animated hero |
| **SOLID Backend** | Clean separation: Controllers → Services → Repositories → Entities |
| **Full Testing Suite** | Unit (JUnit5), Integration (MockMvc), E2E (Selenium), AI UAT |
| **Azure Deployment** | App Service (backend) + Static Web Apps (frontend) + PostgreSQL |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│  SearchBar → useVibeSearch → api.ts (Axios) → PropertyGrid     │
│  ThemeProvider (cultural auto-detection + manual selector)      │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP REST
┌─────────────────────▼───────────────────────────────────────────┐
│                   Spring Boot Backend                           │
│                                                                 │
│  AiVibeSearchController  │  PropertyController                  │
│          ↓                         ↓                            │
│      PropertyService  ←────────────┘                           │
│          ↓                ↓                                     │
│   GeminiService    PropertyRepository / VibeRepository          │
│   (Gemini API)          ↓                                       │
│                    PostgreSQL DB                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Class | Responsibility |
|---|---|---|
| Controller | `AiVibeSearchController` | AI search HTTP endpoint only |
| Controller | `PropertyController` | Standard CRUD and geocoding properties endpoints |
| Controller | `UserController` | Multi-step OTP authentication and profile management endpoints |
| Service | `PropertyService` | Business logic, location resolution, orchestration, mapping |
| Service | `GeminiService` | Gemini API communication and dynamic prompt dataset loop |
| Service | `GoogleMapsService` | Google Maps API coordinates geocoding and proximity search |
| Service | `OtpService` | OTP generation, validation, and session tracking |
| Service | `EmailService` | SMTP-based real and simulated mail dispatcher for OTP delivery |
| Repository | `PropertyRepository` | Database queries |
| Repository | `OtpRepository` | Database tracking of active OTP verification sessions |
| Entity | `PropertyVibe` | Junction table with AI confidence score |
| Config | `DataSeeder` | Development seed data |
| Exception | `GlobalExceptionHandler` | Clean JSON error responses |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + TypeScript | 19.x |
| **Build Tool** | Vite | 5.x |
| **Styling** | Vanilla CSS + Lucide Icons | — |
| **HTTP Client** | Axios | 1.x |
| **Backend** | Spring Boot | 3.2.5 |
| **Language** | Java | 17 (LTS) |
| **ORM** | Spring Data JPA / Hibernate | — |
| **Database** | PostgreSQL | 15 |
| **AI** | Google Gemini 1.5 Flash | Structured Outputs |
| **Maps & Geo** | Google Maps API | Geocoding & Proximity Searches |
| **Email/SMTP** | Spring Boot Starter Mail | OTP Delivery |
| **Testing** | JUnit 5 + Mockito + Selenium | — |
| **Containerization** | Docker + Docker Compose | — |
| **Cloud** | Microsoft Azure | App Service + SWA + PostgreSQL |

---

## Repository Structure

```
Eden AI/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/eden/api/
│   │   ├── config/                   # DataSeeder
│   │   ├── controller/               # AiVibeSearchController, PropertyController, UserController
│   │   ├── dto/                      # PropertyResponseDTO, SearchExtractionDTO
│   │   ├── entity/                   # Property, Vibe, PropertyVibe, PropertyVibeId, User, OtpSession
│   │   ├── exception/                # GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── repository/               # PropertyRepository, VibeRepository, PropertyVibeRepository, UserRepository, OtpRepository
│   │   └── service/                  # PropertyService, GeminiService, GoogleMapsService, OtpService, EmailService
│   ├── src/test/java/com/eden/api/
│   │   ├── integration/              # PropertyApiIntegrationTest
│   │   └── service/                  # PropertyServiceTest, GeminiServiceTest
│   ├── Dockerfile
│   └── pom.xml
│
│├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── components/               # SearchBar, PropertyCard, PropertyGrid, FeaturedStaysSidebar, UserSettingsModal, DynamicSkyBackground
│   │   ├── hooks/                    # useVibeSearch
│   │   ├── pages/                    # HomePage
│   │   ├── services/                 # api.ts
│   │   ├── theme/                    # ThemeProvider, themes, useTheme
│   │   ├── App.tsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
│
├── tests/
│   ├── e2e/                          # Selenium browser tests
│   └── uat/                          # AI UAT agent
│
├── test-logs/                        # Auto-generated test output
├── docker-compose.yml
├── deploy-azure.sh
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 20+
- PostgreSQL 15+
- Maven 3.9+
- Python 3.9+ (for Selenium/UAT tests)

### 1. Database Setup

```sql
CREATE DATABASE eden_ai;
```

### 2. Backend

```bash
cd backend

# Configure your credentials in src/main/resources/application.properties
# spring.datasource.username=postgres
# spring.datasource.password=your_password
# gemini.api.key=your_gemini_key

mvn spring-boot:run
# API available at http://localhost:8080
# DataSeeder auto-populates on first run
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### 4. Full Stack (Docker)

```bash
GEMINI_API_KEY=your_key docker-compose up --build
# App available at http://localhost
```

---

## Backend API Reference

### Base URL
`http://localhost:8080`

### Endpoints

#### `GET /api/properties`
Returns all properties.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "The Wild Coast Lodge",
    "description": "A spectacular safari camp in Yala",
    "location": "Yala",
    "pricePerNight": 850.00,
    "imageUrl": "https://...",
    "vibes": ["Jungle Luxury"]
  }
]
```

#### `GET /api/properties/search?location={location}`
Filters properties by geographical location (case-insensitive).

| Parameter | Type | Required | Example |
|---|---|---|---|
| `location` | string | ✅ | `Mirissa` |

#### `GET /api/properties/featured?lat={lat}&lng={lng}`
Fetches top-rated featured properties with proximity-based sort if latitude and longitude are supplied, falling back to general high-rated properties otherwise.

| Parameter | Type | Required | Example |
|---|---|---|---|
| `lat` | number | ❌ | `6.8622` |
| `lng` | number | ❌ | `80.7011` |

#### `GET /api/ai/search?prompt={prompt}`
**AI-powered vibe search.** Sends the prompt to Gemini, extracts structured parameters, and returns filtered results.

| Parameter | Type | Required | Example |
|---|---|---|---|
| `prompt` | string | ✅ | `quiet jungle villa under $300` |

**Example:**
```bash
curl "http://localhost:8080/api/ai/search?prompt=beachfront+surf+chill+villa+in+Mirissa"
```

#### `GET /api/ai/dataset/export`
Exports search query telemetry logged in the database to a standard JSONL document.

#### `POST /api/users/login/initiate`
Initiates a secure 2-step login process, sending a 6-digit OTP verification code to the registered email.

#### `POST /api/users/login/verify`
Completes login authentication using the 6-digit OTP code sent to the user.

#### `POST /api/users/register/initiate`
Initiates new user registration, validating username/email uniqueness and generating a verification OTP.

#### `POST /api/users/register/verify`
Completes account registration by validating the supplied verification OTP.

#### `PUT /api/users/profile/name`
Updates the authenticated user's profile name.

#### `POST /api/users/profile/password/initiate`
Initiates a password reset cycle, sending an email verification code.

#### `POST /api/users/profile/password/verify`
Verifies the profile update code and updates the password details securely.

---

## Frontend Component Guide

### `<SearchBar />`
```tsx
<SearchBar onSearch={(prompt) => search(prompt)} isLoading={isLoading} />
```
- Renders 8 quick-select vibe chips (Hick's Law)
- Auto-focuses on mount (Shneiderman consistency)
- Disables during loading (error prevention)

### `<PropertyCard />`
```tsx
<PropertyCard id name description location pricePerNight imageUrl vibes />
```
- Max 3 vibe tags displayed (Miller's Law)
- Hover scale + glow (Norman visceral)
- Lazy-loads images

### `<PropertyGrid />`
```tsx
<PropertyGrid properties isLoading hasSearched error />
```
Handles 4 states: `loading → skeleton`, `error → message`, `empty → nudge`, `results → grid`

### `useVibeSearch()` hook
```tsx
const { results, isLoading, error, hasSearched, search, reset } = useVibeSearch();
```

---

## Theme System

See [Theme System Documentation](./frontend/src/theme/README.md) for full details.

Eden AI includes a culturally-aware theme engine that auto-detects Sri Lankan cultural calendar dates and adjusts the UI:

| Theme | Trigger | Colors |
|---|---|---|
| `light` | User toggle | White/slate |
| `dark` | Default / User toggle | `#0a0e1a` deep navy |
| `dry-season` | Dec–Apr | Amber, terracotta, warm sand |
| `wet-season` | May–Nov | Emerald, deep blue-green |
| `poya` | Full moon day | Lotus white, saffron gold |
| `avurudu` | Apr 13–14 | Mustard gold, deep red, mango |
| `christmas` | Dec 20–25 | Coastal teal, cardinal red |
| `sinhala-buddhist` | Sinhala property context | Saffron, maroon, gold |
| `tamil-hindu` | Tamil property context | Deep crimson, turmeric, gold |
| `muslim` | Muslim property context | Forest green, gold, white |

---

## Testing Strategy

### Unit Tests (JUnit 5 + Mockito)
```bash
cd backend
mvn test
```
- `PropertyServiceTest` — tests all service methods with mocked repositories
- `GeminiServiceTest` — tests graceful degradation on API failure

### Integration Tests
```bash
mvn test -Dspring.profiles.active=test
```
- `PropertyApiIntegrationTest` — full Spring context, MockMvc HTTP tests

### Selenium E2E Tests
```bash
pip install selenium pytest webdriver-manager
pytest tests/e2e/test_search_flow.py -v
# Logs → test-logs/selenium.log
```

### AI UAT Agent
```bash
python tests/uat/ai_uat_agent.py
# Report → test-logs/uat_report.txt
```
Simulates 3 user personas: Budget Backpacker, Luxury Honeymooner, Surfer Traveler.
Evaluates Norman/Shneiderman/Hick's/Miller's compliance.

---

## Deployment Guide (Azure)

### Prerequisites
```bash
az login
docker --version
```

### Deploy
```bash
export GEMINI_API_KEY=your_key
bash deploy-azure.sh
```

This script provisions:
1. **Azure Resource Group** (`eden-ai-rg`)
2. **Azure Container Registry** — stores Docker images
3. **Azure App Service** — hosts Spring Boot backend
4. **Azure PostgreSQL Flexible Server** — managed database
5. **Azure Static Web Apps** — hosts React frontend (CDN-backed)

### Production URLs
- Backend: `https://eden-ai-backend.azurewebsites.net`
- Frontend: `https://eden-ai-frontend.azurestaticapps.net`

---

## UX Design Principles

| Principle | Implementation |
|---|---|
| **Norman Visceral** | Dark glassmorphism, gradient headline, animated blobs |
| **Norman Behavioral** | Single search box, one-action results |
| **Norman Reflective** | Vibe tags create emotional resonance |
| **Shneiderman Feedback** | Skeleton loaders, spinner on submit |
| **Shneiderman Consistency** | Enter key + button both submit search |
| **Shneiderman Error Prevention** | Button disabled during loading |
| **Hick's Law** | 8 vibe chips maximum |
| **Miller's Law** | Max 3 vibe tags per card |
| **Fitts' Law** | 44px+ touch targets on all interactive elements |
| **ISO 9241-11** | Results in 1 action (effectiveness + efficiency) |

---

## SOLID Architecture Decisions

| Principle | Decision |
|---|---|
| **S** — SRP | `PropertyController` (queries) ≠ `AiVibeSearchController` (AI) |
| **O** — OCP | New search types extend `PropertyService` without modifying it |
| **L** — LSP | All repositories are substitutable `JpaRepository` implementations |
| **I** — ISP | DTOs expose only the fields the client needs (not full entity) |
| **D** — DIP | `PropertyService` depends on `Repository` interfaces, not classes |

---

## Contributing

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Commit with conventional commits
git commit -m "feat(scope): description"

# 4. Push and open a Pull Request
git push origin feat/your-feature-name
```

### Commit Convention
| Prefix | Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `test` | Test additions |
| `build` | Build system |
| `config` | Configuration |
| `chore` | Maintenance |
| `deploy` | Deployment |

---

*Built with passion for Sri Lanka's breathtaking tourism landscape. 🌴*
