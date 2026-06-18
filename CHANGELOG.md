# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-20
### Added
- Initial project scaffolding for frontend (React + Vite) and backend (Spring Boot).
- PostgreSQL schema design.
- Base configurations for Maven and Tailwind CSS.

## [0.2.0] - 2026-06-15
### Added
- Created `OtpSession` entity and repository for authentication transaction tracking.
- Added email and name fields to `User` entity for schema migration.
- Replaced basic credentials signup/login with 2-step OTP verification endpoints in `UserController`.

## [0.3.0] - 2026-06-16
### Added
- Integrated Google Maps API service (`GoogleMapsService`) to resolve real-time geolocation context and queries.
- Added `/api/properties/featured` endpoint to list nearby properties using geocoding fallback logic.
- Implemented frontend API service client methods for OTP operations, profile updates, and featured properties.
- Added `lucide-react` dependency to the frontend package configuration.

## [0.4.0] - 2026-06-17
### Added
- Designed and implemented `<FeaturedStaysSidebar />` and `<UserSettingsModal />` React components.
- Added user control buttons to the header navigation and linked profile settings and sign-out actions.
- Introduced `DynamicSkyBackground` changing aesthetic layouts based on detected time-of-day and vibe themes.
- Added `models.json` config mapping search parameters and properties.
### Fixed
- Fixed layout grids in navigation bar, aligning action buttons and centering search sections.
- Corrected sun/moon size coordinates and ambient sky rendering across twilight transitions.

## [0.5.0] - 2026-06-18
### Added
- Enabled persistent search telemetry storage via PostgreSQL database dataset loop.
- Added query logging and dynamic few-shot prompt injection fallback to Google Gemini.
- Created `/api/ai/dataset/export` endpoint returning search histories in JSONL formats.
- Wired real email delivery capabilities through Google SMTP and `spring-boot-starter-mail`.
### Fixed
- Replaced per-controller `@CrossOrigin` annotations with a global web CORS configuration.
- Fixed UI bugs ensuring the sidebar close button remains visible and removed redundant navbar headers.
- Adjusted schema constraints to support nullable emails during initial stage migration.
