MovieVault 🎬
Welcome to MovieVault, a personal movie tracking application built to help you manage your watchlist and keep track of your ratings with style.

The Tech Stack
This project is built with a modern, modular architecture:

Frontend: React.js, Material-UI (MUI), and React Router.

Architecture: Component-driven development with isolated styling objects for clean, maintainable code.

Backend: Node.js/Express

Database: PostgreSQL

Key Features
User Authentication: Secure login and registration with Google Auth integration.

Smart Search: Real-time movie suggestions as you type.

Rating System: Custom visual feedback using MUI-based RadioGroupRating and Rating components.

Interactive UI: Clean, responsive design built with a mobile-first approach.

Project Structure
We follow a clean, component-first design pattern:

/src
  /assets        # Images and global styles
  /components    # UI components (Header, MyCard, SearchBar, etc.)
  /pages         # Main route components (WatchedPage, Login, SignUp)
  index.css      # Global reset and base layout styling

Getting Started
Clone the repo:
git clone [your-repo-url]

Install dependencies:
npm install

Run the development server:
npm start

Design Philosophy
This project uses Material-UI (MUI). All component-specific styling is extracted into dedicated styles objects at the bottom of each component file.