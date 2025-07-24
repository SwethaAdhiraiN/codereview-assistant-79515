# CodeReview Assistant Frontend

This project provides a minimal, modern React UI for code review analysis powered by backend LLM/code tools.

## Architectural Overview

- **Sidebar Navigation**: Modern/minimal vertical sidebar with logo, navigation for current results, history, and placeholder for settings.
- **Top Bar**: Clean actions panel for uploading repo directory and toggling light/dark theme.
- **Main Workspace**: Responsive cards for auto-generated Git commit messages, code optimization suggestions, and flagged issues, using clear color accents and warning highlights as per color scheme (#606c80, #333333, #f5f5f7).
- **Upload Directory Modal**: Minimal, clear modal overlay for path entry.
- **Responsive**: Fully responsive – sidebar collapses/vanishes on mobile for a workspace-first experience.

## Features

- Upload repository directory path for analysis
- Displays commit message suggestions, code optimizations, issues
- History of previous analyses
- Theming/light-dark toggle
- Accessible, fast, framework-free CSS (see `src/krStyle.css`)
- Easy future extension (user login, settings, etc.)

## Customization

All layout and styles are handled in `src/krStyle.css`.

---

To learn more about extending this template, see [React documentation](https://reactjs.org/).

