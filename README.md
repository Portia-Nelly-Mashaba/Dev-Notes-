# Dev Note Nexus

AI-powered developer notes app for managing code snippets, error solutions, and learning resources with intelligent search and collaboration.

![Dev Note Nexus](src/assets/home.png)

## ✨ Features

- 📝 **Note Management** - Create, edit, and organize developer notes with syntax highlighting
- 🐛 **Error Logging** - Track and document error solutions for future reference
- 🤖 **AI-Powered Assistance** - Get intelligent suggestions and code analysis
- 🔍 **Neural Search** - Semantic search across your notes using AI
- 📊 **Knowledge Graph** - Visualize relationships between your notes
- 👥 **Collaboration** - Share notes with team members
- 🔄 **GitHub Integration** - Sync with your GitHub repositories
- ⭐ **Karma System** - Gamified experience with achievements and levels
- 📝 **Code Review** - AI-powered code review suggestions
- 🎨 **Modern UI** - Beautiful, responsive interface built with shadcn/ui

## 📸 Screenshots

### Home Dashboard
![Home Dashboard](src/assets/home.png)

### Error Logging
![Error Logs](src/assets/error.png)

### Community Blog
![Community Blog](src/assets/community.png)

## 🚀 Getting Started

### Prerequisites

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/Portia-Nelly-Mashaba/Dev-Notes-.git

# Step 2: Navigate to the project directory
cd dev-note-nexus

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm start
# or
npm run dev

# The app will be available at http://localhost:8080
```

### Build for Production

```sh
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technologies Used

This project is built with modern web technologies:

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) 18
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **AI Integration**: [OpenAI](https://openai.com/) API
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Routing**: [React Router](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```
dev-note-nexus/
├── src/
│   ├── assets/          # Images and static assets
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Application entry point
├── public/             # Public assets
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Vite configuration
```

## 🎯 Available Scripts

- `npm start` / `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GITHUB_TOKEN=your_github_token_here
```

## 📖 Usage

### Creating Notes

1. Click the "New Note" button in the header
2. Fill in the note title, content, and tags
3. Select the programming language (for code snippets)
4. Save your note

### Logging Errors

1. Click the "Log Error" button
2. Enter the error message and solution
3. Add relevant tags for easy searching
4. Save for future reference

### AI Features

- Select multiple notes to analyze together
- Use the AI Panel for intelligent suggestions
- Enable neural search for semantic queries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

**Use your preferred IDE**

You can work locally using your own IDE. Clone this repo and push changes.

**Edit a file directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit the changes

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes once you're done

## 📄 License

This project is open source and available for use.

## 👤 Author

**Portia Nelly Mashaba**

- GitHub: [@Portia-Nelly-Mashaba](https://github.com/Portia-Nelly-Mashaba)

---

Made with ❤️ for developers
