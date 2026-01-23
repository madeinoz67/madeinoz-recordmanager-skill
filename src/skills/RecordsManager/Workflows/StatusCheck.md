# Status Check Workflow

**Purpose:** Verify Records Manager installation, test paperless-ngx connection, and confirm all components are working correctly.

---

## Triggers

- "Check status"
- "Test connection"
- "Is records manager working?"
- "Verify paperless connection"
- "System status"

---

## Process

### Step 1: Send Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the StatusCheck workflow from the Records Manager skill"}' \
  > /dev/null 2>&1 &
```

### Step 2: Run Status Command

Execute the built-in status command:

```bash
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts status
```

### Step 3: Interpret Results

The status command performs 4 checks:

**1. Environment Configuration**
- Verifies `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` is set
- Verifies `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` is set
- Shows country and default domain settings

**2. API Connectivity**
- Tests if paperless-ngx API endpoint is reachable
- Reports HTTP status codes

**3. Authentication & Data Access**
- Tests authenticated access to tags endpoint
- Tests authenticated access to document types endpoint
- Tests authenticated access to documents endpoint
- Reports counts of each

**4. Taxonomy Expert**
- Verifies taxonomy data loads for configured country
- Reports document types and tag categories available

### Step 4: Report Results

**If all checks pass:**
```
✅ All checks passed - Records Manager is ready!
```

**If any check fails:**
```
❌ Some checks failed - review errors above
```

The command exits with code 0 on success, 1 on failure.

---

## Expected Output

```
🔍 Records Manager - Connection Test & Status

──────────────────────────────────────────────────

1️⃣  Environment Configuration
   ✅ PAPERLESS_URL: https://paperless.example.com
   ✅ API_TOKEN: Set (40 chars)
   ✅ COUNTRY: Australia
   ✅ DEFAULT_DOMAIN: household

2️⃣  API Connectivity
   ✅ API endpoint reachable

3️⃣  Authentication & Data Access
   ✅ Tags accessible: 25 tags found
   ✅ Document types accessible: 12 types found
   ✅ Documents accessible: 150 total documents

4️⃣  Taxonomy Expert
   ✅ Taxonomy loaded for: Australia
   ✅ Document types: 12 defined
   ✅ Tag categories: 6 categories

──────────────────────────────────────────────────

✅ All checks passed - Records Manager is ready!
```

---

## Troubleshooting

### Environment Not Set

**Error:** `PAPERLESS_URL: NOT SET`

**Solution:**
```bash
# Add to $PAI_DIR/.env
MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-instance.com"
MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-token"

# Reload environment
source $PAI_DIR/.env
```

### API Not Reachable

**Error:** `Cannot reach API: fetch failed`

**Solution:**
1. Verify URL is correct (includes https://)
2. Check network connectivity
3. Verify paperless-ngx is running
4. Check firewall/proxy settings

### Authentication Failed

**Error:** `API reachable but authentication failed (401)`

**Solution:**
1. Regenerate API token in paperless-ngx
2. Update token in `.env` file
3. Ensure token has read/write permissions
4. Source the updated `.env`

### Taxonomy Error

**Error:** `Taxonomy error: Country X not supported`

**Solution:**
1. Set `MADEINOZ_RECORDMANAGER_COUNTRY` to: Australia, UnitedStates, or UnitedKingdom
2. Or contribute your country's taxonomy guidelines

---

## CLI Reference

```bash
# Run status check
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts status

# Exit codes:
# 0 = All checks passed
# 1 = One or more checks failed
```

---

## Integration

This workflow is useful for:
- Post-installation verification
- Debugging connection issues
- Health checks in automated scripts
- Verifying configuration after changes
