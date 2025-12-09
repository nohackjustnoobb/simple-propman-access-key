# PropMan Access Key Generator

A simple web app that generates dynamic QR codes for propman access control.

**🔗 Live Demo**: [https://nohackjustnoobb.github.io/simple-propman-access-key](https://nohackjustnoobb.github.io/simple-propman-access-key)

## What It Does

- Generates time-based QR codes
- Stores configuration in browser (persists between sessions)
- Supports URL parameters for easy sharing

## Quick Start

### Using the Hosted Version

Simply visit the live demo link above and configure via URL parameters:

```
https://nohackjustnoobb.github.io/simple-propman-access-key?key=yourkey&checol=value&offset=value
```

### Running Locally

```bash
# Install dependencies
yarn

# Run development server
yarn dev

# Build for production
yarn build
```

## Configuration

The app accepts three parameters:

- **key** - Your access key
- **checol** - Check column value
- **offset** - Time offset value

### Ways to Configure

1. **Via URL**: `?key=yourkey&checol=value&offset=value`
2. **Via UI**: Click "Configuration" to expand the settings panel
3. **Stored automatically**: Settings persist in browser localStorage
