# API Configuration Setup

This project uses external APIs that require API keys. To protect sensitive information, API keys are stored in configuration files that are not committed to the repository.

## Setup Instructions

1. **Copy the example configuration:**
   ```bash
   cp Assets/config/config.example.ts Assets/config/api-keys.ts
   ```

2. **Edit the configuration file:**
   Open `Assets/config/api-keys.ts` and replace the placeholder values with your actual API keys:
   ```typescript
   export const ENV_CONFIG = {
       GROQ_API_KEY: "your-actual-groq-api-key-here",
       // Add other API keys as needed
   };
   ```

3. **Get your API keys:**
   - **Groq API**: Visit https://console.groq.com/ to get your API key

## Security Notes

- The `Assets/config/api-keys.ts` file is gitignored and will not be committed
- Never commit actual API keys to the repository
- Use the example file as a template for new developers
- Keep your API keys secure and don't share them publicly

## Files

- `Assets/config/config.example.ts` - Template configuration (safe to commit)
- `Assets/config/api-keys.ts` - Your actual API keys (gitignored)
