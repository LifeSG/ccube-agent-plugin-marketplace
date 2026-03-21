# Example: OneGov Chatbot Web Application

This example shows how to create a new frontend project for the OneGov Chatbot application.

## Project Details

- **Project Name**: `onegov-chatbot-web`
- **Target Directory**: `/Volumes/SharedData/sgw/poc`
- **Purpose**: Citizen-facing chatbot interface using Flagship Design System
- **Key Features**: Chat interface, message history, typing indicators

## Creation Command

```bash
bash scripts/init-vite-react-project.sh onegov-chatbot-web /Volumes/SharedData/sgw/poc
```

## Expected Output

```
🚀 Creating Vite + React + TypeScript project: onegov-chatbot-web
📁 Target location: /Volumes/SharedData/sgw/poc/onegov-chatbot-web
📦 Creating Vite project...
📥 Installing dependencies...
🎨 Installing Flagship Design System...
📂 Creating project structure...
⚙️  Setting up theme provider...
🔧 Updating main entry point...
📝 Creating initial App component...
📄 Creating README...

✅ Project created successfully!

📁 Location: /Volumes/SharedData/sgw/poc/onegov-chatbot-web

🚀 Next steps:
   1. cd /Volumes/SharedData/sgw/poc/onegov-chatbot-web
   2. npm run dev
   3. Open browser to http://localhost:5173
```

## Post-Creation Workflow

After project creation, the typical next steps are:

1. **Fetch Figma Design** (if available)
   ```
   @agent: Fetch the Figma design from [URL]
   ```

2. **Map Components to FDS**
   ```
   @agent: Analyze the Figma design and map components to Flagship Design System
   ```

3. **Implement UI Components**
   - Create page components in `src/pages/`
   - Build reusable components in `src/components/`
   - Follow FDS component patterns

4. **Add Routing** (if needed)
   ```bash
   npm install react-router-dom
   ```

5. **Add State Management** (if needed)
   ```bash
   npm install zustand  # or preferred state library
   ```

## Figma Design Reference

For OneGov Chatbot specifically:
- **Figma URL**: https://www.figma.com/design/7yLApSCl3jCzDqDzROVDIK/-APP--OneGov-Chatbot
- **Node ID**: 554-5526

Use the cc-figma skill to fetch and analyze this design after project creation.
