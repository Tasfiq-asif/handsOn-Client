# HandsOn Volunteer Platform - Client

## Project Overview

HandsOn is a community volunteer platform that connects volunteers with local events and community help opportunities. This is the client-side React application that provides the user interface for the platform.

## Technologies Used

- **React** - Frontend library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Supabase JS Client** - Database and authentication client

## Features

- **User Authentication** - Login, registration, and profile management
- **Event Discovery** - Browse and search for volunteer opportunities
- **Event Registration** - Join events and manage registrations
- **Dashboard** - Track volunteer hours and impact
- **Responsive Design** - Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory: `cd client/handsOn`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

- Development mode: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Project Structure

- `src/components` - Reusable UI components
- `src/pages` - Page components
- `src/context` - React context providers
- `src/lib` - Utility functions and API clients
- `src/assets` - Static assets like images and icons

## Git Workflow

This project follows a feature branch workflow with pull requests for code review and integration.

### Current Branches

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/event-listing` - Event listing functionality
- `feature/help-request` - Help request functionality
- `landing-page` - Landing page implementation

### Merging Feature Branches via Pull Requests

1. **Ensure your feature branch is up to date with develop**:

   ```bash
   git checkout feature/your-branch
   git pull origin develop
   # Resolve any conflicts if they occur
   ```

2. **Push your changes to the remote repository**:

   ```bash
   git push origin feature/your-branch
   ```

3. **Create a Pull Request (PR)**:

   - Go to your GitHub repository
   - Click on "Pull requests" tab
   - Click "New pull request"
   - Set "base" branch to `develop`
   - Set "compare" branch to your feature branch
   - Click "Create pull request"
   - Add a descriptive title and description
   - Request reviewers if needed

4. **Code Review Process**:

   - Reviewers will examine your code and provide feedback
   - Address any comments or requested changes
   - Push additional commits to your feature branch as needed

5. **Merge the Pull Request**:

   - Once approved, click "Merge pull request"
   - Choose the appropriate merge strategy:
     - Merge commit: Preserves all commits history
     - Squash and merge: Combines all commits into one
     - Rebase and merge: Applies changes without a merge commit
   - Click "Confirm merge"

6. **Merge to Main**:

   - After features are integrated and tested in `develop`
   - Create a new PR from `develop` to `main`
   - Follow the same review process
   - Merge to deploy to production

7. **Delete the Feature Branch (Optional)**:
   - After successful merge, you can delete the feature branch
   - This keeps the repository clean

### Branch Protection Rules (Recommended)

Consider setting up branch protection rules for the `main` and `develop` branches:

- Require pull request reviews before merging
- Require status checks to pass before merging
- Restrict who can push to the branch
