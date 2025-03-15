# HandsOn Volunteer Platform - Client

## 1. Project Overview

HandsOn is a community volunteer platform that connects volunteers with local events and help requests. This React application provides an intuitive interface for discovering, joining, and managing volunteer opportunities.

**Live Demo:** [https://hands-on-client.vercel.app](https://hands-on-client.vercel.app)  
**API Server:** [https://hands-on-server.vercel.app](https://hands-on-server.vercel.app)

## 2. Technologies Used

- **React** - Frontend library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase** - Authentication
- **Axios** - API requests
- **Vercel** - Deployment

## 3. Features

- 🔐 **User Authentication** - Login, registration, and Google OAuth
- 🔍 **Event Discovery** - Browse and search for volunteer opportunities
- 📝 **Event Registration** - Join events and manage registrations
- 📊 **Dashboard** - Track volunteer activity and impact
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 4. Database Schema

The client interacts with the server API, which connects to the following database schema:

```
users (Supabase Auth)
  ├── id (UUID, PK)
  ├── email
  └── created_at

profiles
  ├── id (UUID, PK)
  ├── user_id (UUID, FK)
  ├── full_name
  └── bio

events
  ├── id (UUID, PK)
  ├── creator_id (UUID, FK)
  ├── title
  ├── description
  └── start_date

event_participants
  ├── id (UUID, PK)
  ├── event_id (UUID, FK)
  ├── user_id (UUID, FK)
  └── status
```

## 5. Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory: `cd client/handsOn`
3. Install dependencies: `npm install`
4. Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://hands-on-server.vercel.app/api
   ```

## 6. API Integration

The client communicates with the server through these main endpoints:

### Authentication

- Login: `POST /api/users/login`
- Register: `POST /api/users/register`
- Google Login: `POST /api/users/google-login`
- Get Profile: `GET /api/users/profile`

### Events

- Get Events: `GET /api/events`
- Get Event Details: `GET /api/events/:id`
- Create Event: `POST /api/events`
- Register for Event: `POST /api/events/:id/register`
- Cancel Registration: `POST /api/events/:id/cancel`

## 7. Running the Project

### Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deployment

The client is deployed on Vercel. To deploy your own instance:

1. Fork the repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy

For more information, visit the [project repository](https://github.com/yourusername/handsOn).
