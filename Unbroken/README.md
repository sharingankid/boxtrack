# Unbroken

iOS recipe app in Swift / SwiftUI, powered by the [Spoonacular API](https://spoonacular.com/food-api). Team: Dimitri, Orel, Abdellah, Panaki, Kevin. Tracked on the team's Notion Kanban.

## Setup

Requires a Mac with Xcode 15+ and [XcodeGen](https://github.com/yonaskolb/XcodeGen) (the `.xcodeproj` is generated, not committed, to avoid merge conflicts on `project.pbxproj` between 5 people).

```bash
brew install xcodegen

cd Unbroken
cp Config/Secrets.xcconfig.example Config/Secrets.xcconfig
# edit Config/Secrets.xcconfig and set SPOONACULAR_API_KEY to your key
# (get one at https://spoonacular.com/food-api/console#Dashboard)

xcodegen generate
open Unbroken.xcodeproj
```

Then drop the Montserrat font files provided by the team into `Unbroken/Resources/Fonts/` (see the README there) before building — the app will still build without them, but titles will fall back to the system font.

Whenever `project.yml` changes (new file group, new target, new build setting), re-run `xcodegen generate`.

## Project structure

```
Unbroken/
  project.yml              XcodeGen spec — source of truth for the Xcode project
  Config/
    Secrets.xcconfig.example   committed template
    Secrets.xcconfig           gitignored, holds your real API key
  Unbroken/                  app target
    UnbrokenApp.swift
    Info.plist
    Models/                  Recipe, Categorie, Spoonacular DTOs + mapping
    Services/                RecipeServiceProtocol, RecipeService, APIError
    ViewModels/
    Views/
    DesignSystem/            Color/Font extensions, spacing, reusable components
    Resources/
      Assets.xcassets
      Fonts/
  UnbrokenTests/
```

## Git conventions

This app lives inside the shared `boxtrack` repo (alongside an unrelated DWWM project in `docs/`). To keep history readable, all commits touching this app are scoped:

- **Branches**: `feature/<short-description>` (e.g. `feature/recipe-list-search`), `fix/<short-description>` for bug fixes.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), scoped with `(unbroken)`:
  - `feat(unbroken): add recipe list search`
  - `fix(unbroken): handle empty Spoonacular response`
  - `docs(unbroken): document API setup`
  - `test(unbroken): cover Recipe decoding`
  - `chore(unbroken): update project.yml target settings`
- Keep the subject line under ~72 chars, imperative mood, one logical change per commit.
