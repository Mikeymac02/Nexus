Nexus

Nexus is a modular smart display dashboard designed to present information at a glance. Inspired by devices such as the Amazon Echo Show, Nexus provides a flexible framework for displaying real-time information through independently managed modules.

The project is built with React, TypeScript, and a custom shell architecture that manages module registration, scheduling, positioning, and rendering.

Current Features

Modular Architecture

Nexus is built around a module system. Each module:

* Registers itself with the shell
* Updates on its own schedule
* Controls its own data retrieval
* Defines its preferred screen position
* Renders independently of other modules

Smart Update Scheduling

Modules update based on configurable refresh intervals.

Examples:

* Clock updates every second
* Weather updates every five minutes
* Future modules can define their own refresh cadence

This prevents unnecessary updates and provides a foundation for scalable dashboard performance.

Layout System

Nexus currently supports a fixed grid layout consisting of:

Top Row

* Top Left
* Top Middle
* Top Right

Middle Row

* Middle Left
* Middle
* Middle Right

Bottom Row

* Bottom Left
* Bottom Middle
* Bottom Right

Bottom Bar

* Full-width footer area

Only one module may occupy a slot at a time.

Background System

Nexus includes a background management system that separates background rendering from dashboard content.

Current support:

* Gradient backgrounds
* Solid color backgrounds
* Background registry architecture

Planned support:

* Image backgrounds
* Background selection UI
* Background persistence
* Dynamic backgrounds

Current Modules

Time Module

Displays the current time and updates automatically.

Weather Module

Displays weather information and refreshes at a configurable interval.

Calendar Module

Displays upcoming events and serves as the primary date and schedule display area.

Technical Architecture

Nexus Shell

The Nexus Shell is responsible for:
* Module registration
* Update scheduling
* State management
* Slot conflict detection
* Background state management

Module Registry

Modules are registered and managed centrally, allowing new modules to be added without modifying core rendering logic.

Background Registry

Backgrounds are defined through a registry-based system similar to modules.

This architecture enables:

* Easy background switching
* Future settings integration
* Persistent user preferences
* Dynamic background selection

Project Structure

src/
├── backgrounds/
│   └── backgroundRegistry.ts
├── modules/
│   ├── timeModule.ts
│   ├── weatherModule.ts
│   └── calendarModule.ts
├── shell/
│   └── shell.ts
├── widgets/
├── App.tsx
└── main.tsx

Roadmap

Near-Term Goals

* Module sizing and spanning
* Background persistence
* Improved dashboard styling
* Enhanced calendar functionality
* Local network display support

Planned Integrations

* Google Calendar
* Spotify
* Sports scores
* Fantasy football information
* Smart home data

Long-Term Vision

Nexus aims to become a customizable smart display platform capable of presenting personalized information from multiple sources in a clean, glanceable interface.

The architecture is designed to support a growing ecosystem of modules while maintaining a simple and responsive user experience.

Development

Install dependencies:

npm install

Run development server:

npm run dev

Build for production:

npm run build

License

This project is currently under active development.
