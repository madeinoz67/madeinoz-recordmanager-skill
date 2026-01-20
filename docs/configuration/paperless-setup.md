# paperless-ngx Setup Guide

This guide covers configuring paperless-ngx to work with the Records Manager Skill, including API token generation and best practices.

## What is paperless-ngx?

[paperless-ngx](https://docs.paperless-ngx.com/) is an open-source document management system that provides:
- OCR (Optical Character Recognition) for searchable documents
- Tagging and categorization
- Document type management
- REST API for automation

The Records Manager Skill uses paperless-ngx as its storage engine, providing intelligent organization on top of paperless-ngx's robust foundation.

## Installation

If you don't have paperless-ngx installed, follow the [official installation guide](https://docs.paperless-ngx.com/installation/).

**Recommended deployment methods:**
- **Docker Compose** - Easiest for self-hosting
- **Kubernetes** - For production environments
- **Cloud hosting** - Various providers offer pre-configured paperless-ngx

## PAI User Security Best Practices

!!! tip
    **Security First: Create a Dedicated PAI User**

    For enhanced security, create a dedicated user in paperless-ngx for the Records Manager Skill with limited permissions. This provides isolation and auditability.

### Step 1: Create a Dedicated PAI User

**Why create a dedicated user?**
- **Isolation**: Separates automated operations from human activities
- **Auditability**: Clear tracking of AI-assisted document management
- **Safety**: Can restrict permissions to prevent accidental bulk deletions
- **Compliance**: Easier to demonstrate proper access controls

**Steps to create the PAI user:**

1. **Log in to paperless-ngx as administrator**

2. **Navigate to Settings → Users**

3. **Create new user:**
   - **Username**: `pai-records-manager` (or descriptive name)
   - **Email**: `pai@yourdomain.com` (or monitoring email)
   - **Password**: Generate strong random password
   - **Groups**: Assign to appropriate groups (see below)

4. **Set user permissions:**
   - **Can add documents**: ✅ Enable
   - **Can change document tags**: ✅ Enable
   - **Can view documents**: ✅ Enable
   - **Can delete documents**: ❌ **DISABLE** (critical safety feature)

5. **Create API token** for this user:
   - Log in as the PAI user
   - Navigate to Settings → Tokens
   - Create token with Read/Write permissions
   - Copy token for Records Manager configuration

### Step 2: Configure Group-Based Entity Access

For multi-entity deployments (household + corporate + trusts), use groups to isolate document access:

**Create groups:**
1. Navigate to **Settings → Groups**
2. Create groups for each entity:
   - `household-access`
   - `corporate-access`
   - `trust-access`

**Assign PAI user to groups:**
- Assign the PAI user to all groups it needs to manage
- Each group can have different permissions per entity

**Configure entity-level access:**

```yaml
# Example group permissions in paperless-ngx
household-access:
  - Can view: household documents
  - Can tag: household documents
  - Cannot delete: any documents

corporate-access:
  - Can view: corporate documents
  - Can tag: corporate documents
  - Cannot delete: any documents
```

### Step 3: Verify Security Configuration

**Test the PAI user setup:**

1. **Test read access:**
   ```bash
   bun run src/skills/RecordsManager/Tools/RecordManager.ts search \
     --query "*" \
     --domain household
   ```

2. **Test write access:**
   ```bash
   bun run src/skills/RecordsManager/Tools/RecordManager.ts upload \
     --file test.pdf \
     --domain household
   ```

3. **Verify deletion is blocked:**
   ```bash
   # This should require Deletion Auditor approval
   bun run src/skills/RecordsManager/Tools/RecordManager.ts delete \
     --id <test-document-id>
   ```

**Expected outcome:**
- ✅ Read operations work
- ✅ Upload and tagging work
- ❌ Direct deletion is blocked (requires Deletion Auditor workflow)

### Step 4: Monitor PAI User Activity

**Regular monitoring tasks:**

1. **Review access logs** in paperless-ngx:
   - Settings → Logs → User Activity
   - Filter by PAI user
   - Check for unusual activity

2. **Audit document changes**:
   - Review tags added by PAI user
   - Verify document uploads are expected
   - Check for failed deletion attempts

3. **Set up alerts** (if available):
   - Alert on bulk operations (e.g., >10 documents in 5 minutes)
   - Alert on deletion attempts
   - Alert on failed authentication

### Security Checklist

- [ ] Created dedicated PAI user in paperless-ngx
- [ ] Disabled direct deletion permissions for PAI user
- [ ] Assigned PAI user to appropriate groups
- [ ] Created API token for PAI user (not admin token)
- [ ] Verified PAI user can upload and tag documents
- [ ] Verified PAI user cannot directly delete documents
- [ ] Set up monitoring for PAI user activity
- [ ] Documented PAI user credentials in secure location
- [ ] Scheduled periodic permission reviews (quarterly)

!!! warning
    **IMPORTANT**: The PAI user should NOT have delete permissions in paperless-ngx. All deletions must go through the Deletion Auditor workflow, which provides explicit confirmation and audit logging.

---

## Configuration for Records Manager

### 1. Generate API Token

The Records Manager Skill requires an API token with Read/Write permissions.

**Steps:**

1. Log in to your paperless-ngx instance
2. Navigate to **Settings** → **Tokens**
3. Click **+ New Token**
4. Configure the token:
   - **Name**: `Records Manager` (or descriptive name)
   - **Permissions**: Enable both **Read** and **Write**
   - **Expiry**: Optional (recommended: no expiry for automated use)
5. Click **Create**
6. **Copy the token immediately** - it won't be shown again

![Token creation screenshot placeholder]

### 2. Configure Environment Variables

Add the paperless-ngx configuration to your `$PAI_DIR/.env` file:

```bash
MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"
MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-copied-token-here"
```

**Important security notes:**
- Use `https://` for remote instances (required for secure token transmission)
- Keep the API token secret - treat it like a password
- Never commit `.env` files to version control

### 3. Verify Connection

Test the connection using the status command:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

**Success output:**
```
Records Manager Status
======================

Paperless-ngx: Connected (https://paperless.example.com)
API Version: v1
Country: Australia
Default Domain: household
```

**Error output:** Check the troubleshooting section below.

## Recommended paperless-ngx Settings

### Document Types

Create document types that align with your domain. For households:

| Document Type | Description |
|---------------|-------------|
| Tax Return | Annual tax returns and assessments |
| Medical Receipt | Healthcare expenses |
| Insurance Policy | Insurance documents |
| Warranty Document | Product warranties |
| Bank Statement | Monthly statements |
| Receipt | General receipts |

### Tags Structure

Establish a consistent tag hierarchy:

```
financial/
  ├── tax
  ├── income
  └── expense
medical/
  ├── doctor
  ├── hospital
  └── pharmacy
insurance/
  ├── home
  ├── contents
  └── vehicle
```

The Records Manager Skill will suggest tags automatically based on your country and domain configuration.

### OCR Configuration

Ensure OCR is enabled for optimal search:

1. Go to **Settings** → **OCR**
2. Enable **Automatic OCR** for new documents
3. Set **OCR Language** to your primary language
4. Configure **OCR Mode** (recommended: `redo` for re-processing existing documents)

### Storage Path

Organize documents in paperless-ngx with a consistent storage path:

```
/documents/
  ├── financial/
  ├── medical/
  ├── insurance/
  ├── legal/
  └── household/
```

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED` or `Connection refused`

**Solutions:**
1. Verify the URL in `.env` is correct and accessible
2. Check if paperless-ngx is running: `docker ps` (if using Docker)
3. Test the URL in a browser
4. Check firewall settings

### Unauthorized (401)

**Error:** `401 Unauthorized` or `Invalid API token`

**Solutions:**
1. Verify the API token is copied correctly (no extra spaces)
2. Confirm the token hasn't expired
3. Check that Read/Write permissions are enabled
4. Generate a new token if necessary

### SSL Certificate Errors

**Error:** `certificate has expired` or `self-signed certificate`

**Solutions:**
1. For development: Use `http://` instead of `https://`
2. For production: Renew your SSL certificate
3. For self-signed certs: Add the certificate to your system's trust store

### CORS Errors

**Error:** CORS policy blocking requests

**Solutions:**
1. Configure paperless-ngx `CORS_ALLOWED_ORIGINS` setting
2. Add your PAI instance domain to allowed origins
3. See [paperless-ngx CORS documentation](https://docs.paperless-ngx.com/configuration/#cors_allowed_origins)

## Best Practices

### Security

1. **Use HTTPS** for all remote connections
2. **Rotate API tokens** periodically (every 6-12 months)
3. **Limit token permissions** to only what's needed
4. **Monitor access logs** for suspicious activity
5. **Back up regularly** - paperless-ngx data should be backed up

### Performance

1. **Enable OCR** for all documents (improves search)
2. **Use consistent tagging** (the Records Manager Skill helps with this)
3. **Archive old documents** to improve performance
4. **Monitor storage** - set up alerts for disk space

### Maintenance

1. **Update paperless-ngx** regularly for security patches
2. **Review retention periods** annually
3. **Clean up tags** - merge duplicates and remove unused
4. **Test backups** - ensure you can restore if needed

## Advanced Configuration

### Custom Storage Path

If using a custom storage path in paperless-ngx, ensure the Records Manager Skill can access it:

```bash
# In paperless-ngx .env
PAPERLESS_DATA_DIR=/mnt/paperless/documents
```

### Multiple Instances

For multiple paperless-ngx instances (e.g., personal vs business), use separate configurations:

```bash
# Personal records
MADEINOZ_RECORDMANAGER_PERSONAL_PAPERLESS_URL="https://personal.example.com"
MADEINOZ_RECORDMANAGER_PERSONAL_PAPERLESS_API_TOKEN="..."

# Business records
MADEINOZ_RECORDMANAGER_BUSINESS_PAPERLESS_URL="https://business.example.com"
MADEINOZ_RECORDMANAGER_BUSINESS_PAPERLESS_API_TOKEN="..."
```

### Webhook Configuration

Configure webhooks in paperless-ngx to trigger Records Manager actions:

1. Go to **Settings** → **Webhooks**
2. Create a new webhook
3. Set the trigger (e.g., `document_consumed`)
4. Point to your Records Manager endpoint

## Next Steps

- Configure [environment variables](environment.md)
- Choose your [country](country-selection.md) for compliance rules
- Set up [retention policies](../usage/retention.md)

---

!!! warning
    **DELETION DISCLAIMER**

    While the Records Manager Skill provides safety checks, retention guidance, and the Deletion Auditor workflow, **you are ultimately responsible for verifying deletions and understanding retention requirements before deleting documents**.

    The system provides recommendations based on general taxonomies and common retention periods, but these may not apply to your specific situation. You should:

    - **Verify retention periods** apply to your jurisdiction and use case
    - **Consult with legal or tax professionals** for compliance-critical documents
    - **Understand that deletion is permanent** - once deleted, documents cannot be recovered
    - **Consider maintaining backups** of important documents, even after retention expires
    - **Review audit trails** regularly to track deletion decisions

    The Records Manager Skill provides tools to assist with document management, but **compliance is your responsibility**.
