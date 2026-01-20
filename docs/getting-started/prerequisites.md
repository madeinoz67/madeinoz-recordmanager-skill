# Prerequisites

System requirements and dependencies for installing and running the Records Manager Skill.

---

## Overview

The Records Manager Skill requires several components to function correctly. This guide covers all prerequisites and how to set them up.

---

## Core Requirements

### 1. PAI (Personal AI Infrastructure)

**Required Version**: v2.0 or higher

**What is PAI?**
PAI is a personalized agentic system that helps you accomplish your goals through AI assistant integration. The Records Manager Skill is a PAI pack that extends PAI's capabilities.

**Verification**:
```bash
# Check PAI installation
ls -la ~/.claude/

# Check PAI version
cat ~/.claude/VERSION 2>/dev/null || echo "Version file not found"
```

**Installation**:
If you don't have PAI installed, follow the [PAI Installation Guide](https://github.com/danielmiessler/PAI#installation).

**Key PAI Components Used**:
- Skill system for loading the Records Manager
- Agent system for specialized document management agents
- Configuration system for environment variables
- Hook system for session capture

---

### 2. paperless-ngx

**Required Version**: v1.13.0 or higher

**What is paperless-ngx?**
paperless-ngx is a document management system that transforms physical documents into searchable online archives. It provides OCR, tagging, and storage for the Records Manager Skill.

**Verification**:
```bash
# Check paperless-ngx is accessible
curl -I $MADEINOZ_RECORDMANAGER_PAPERLESS_URL 2>/dev/null | head -1

# Expected output: HTTP/1.1 200 OK
```

**Installation**:
If you don't have paperless-ngx installed:

**Docker (Recommended)**:
```bash
# Clone paperless-ngx
git clone https://github.com/paperless-ngx/paperless-ngx.git
cd paperless-ngx

# Copy and edit configuration
cp docker-compose.env.example docker-compose.env
# Edit docker-compose.env with your settings

# Start services
docker compose up -d
```

**See the [paperless-ngx documentation](https://docs.paperless-ngx.com/) for detailed installation instructions.**

**Required Permissions**:
The API token must have:
- **Read permissions** - For searching and retrieving documents
- **Write permissions** - For uploading and tagging documents
- **Tag management** - For creating and modifying tags
- **Document type management** - For creating document types

---

### 3. Bun Runtime

**Required Version**: v1.0.0 or higher

**What is Bun?**
Bun is a fast TypeScript runtime used to execute the Records Manager CLI tools.

**Verification**:
```bash
bun --version
```

**Installation**:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (if not automatic)
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

**Why Bun?**
- Fast startup and execution
- Native TypeScript support
- Compatible with Node.js ecosystems
- Low memory footprint

---

### 4. Git

**Required Version**: Any

**What is Git?**
Version control system used to clone the Records Manager repository.

**Verification**:
```bash
git --version
```

**Installation**:
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
# Download from https://git-scm.com/downloads
```

---

## Optional Requirements

### ElevenLabs API (Optional)

For voice-enabled agent responses, you can configure ElevenLabs text-to-speech.

**Setup**:
```bash
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"
```

**Without this**: Agents will respond with text only.

---

## Platform-Specific Notes

### macOS

**Requirements**:
- macOS 11 (Big Sur) or later
- Xcode Command Line Tools

**Setup**:
```bash
# Install Command Line Tools
xcode-select --install

# Install Homebrew (if not present)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Linux (Ubuntu/Debian)

**Requirements**:
- Ubuntu 20.04 or later / Debian 11 or later
- Standard build tools

**Setup**:
```bash
# Update packages
sudo apt-get update

# Install dependencies
sudo apt-get install -y git curl build-essential
```

### Windows

**Requirements**:
- Windows 10 or later
- WSL (Windows Subsystem for Linux) recommended

**Setup**:
```bash
# Install WSL
wsl --install

# Within WSL, follow Linux instructions
```

**Note**: Native Windows support is experimental. WSL is recommended.

---

## Network Requirements

### Outbound Access

The Records Manager Skill requires:

| Destination | Purpose | Required |
|-------------|---------|----------|
| paperless-ngx URL | Document storage and retrieval | Yes |
| GitHub (raw.githubusercontent.com) | Optional: Remote resources | No |

### Firewall Configuration

Ensure your firewall allows:
- HTTPS (443) outbound to your paperless-ngx instance
- Local network access if paperless-ngx is self-hosted

---

## Resource Requirements

### Minimum Resources

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 512 MB | 1 GB |
| **Disk** | 100 MB | 200 MB |
| **Network** | 1 Mbps | 10 Mbps |

### paperless-ngx Resources

The paperless-ngx server requirements are separate:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 2 GB | 4 GB |
| **Disk** | 10 GB | 50 GB+ |
| **CPU** | 2 cores | 4+ cores |

---

## Verification Checklist

Before installing the Records Manager Skill, verify:

- [ ] PAI v2.0+ is installed
- [ ] paperless-ngx v1.13+ is running and accessible
- [ ] Bun v1.0+ is installed
- [ ] Git is installed
- [ ] You have a paperless-ngx API token with read/write permissions
- [ ] You know your paperless-ngx URL
- [ ] Network connectivity to paperless-ngx is working

---

## Testing Prerequisites

Run this test script to verify all prerequisites:

```bash
#!/bin/bash
echo "Checking Records Manager Skill prerequisites..."

# Check PAI
if [ -d "$HOME/.claude" ]; then
  echo "✓ PAI installed"
else
  echo "✗ PAI not found at ~/.claude/"
fi

# Check Bun
if command -v bun &> /dev/null; then
  echo "✓ Bun installed: $(bun --version)"
else
  echo "✗ Bun not installed"
fi

# Check Git
if command -v git &> /dev/null; then
  echo "✓ Git installed: $(git --version)"
else
  echo "✗ Git not installed"
fi

# Check paperless-ngx (if configured)
if [ -n "$MADEINOZ_RECORDMANAGER_PAPERLESS_URL" ]; then
  if curl -sfI "$MADEINOZ_RECORDMANAGER_PAPERLESS_URL" > /dev/null; then
    echo "✓ paperless-ngx accessible at $MADEINOZ_RECORDMANAGER_PAPERLESS_URL"
  else
    echo "✗ Cannot connect to paperless-ngx"
  fi
else
  echo "⚠ paperless-ngx URL not configured (set during installation)"
fi

echo ""
echo "If all checks pass, proceed to [Installation](installation.md)"
```

Save as `check-prerequisites.sh`, make executable, and run:

```bash
chmod +x check-prerequisites.sh
./check-prerequisites.sh
```

---

## Next Steps

Once all prerequisites are verified:

1. **Proceed to Installation** - Complete the setup process
2. **Configure Environment** - Set up paperless-ngx connection
3. **Run Quickstart** - Upload your first document

---

## Getting Help

If you're having trouble with prerequisites:

- **PAI Installation**: See [PAI Documentation](https://github.com/danielmiessler/PAI)
- **paperless-ngx Setup**: See [paperless-ngx Documentation](https://docs.paperless-ngx.com/)
- **Bun Installation**: See [Bun Documentation](https://bun.sh/docs/installation)
- **Community Support**: [GitHub Discussions](https://github.com/madeinoz/madeinoz-recordmanager-skill/discussions)

---

**Version**: 1.2.0
**Last Updated**: 2026-01-20
