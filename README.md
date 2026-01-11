# DevConnect

A modern web platform for college students to connect, collaborate, and showcase their projects.

## Features

- **User Authentication**: JWT-based login/signup with college email validation
- **Project Showcase**: Upload and showcase projects with tech stacks and collaboration features
- **Discussion Board**: Community forum for tech discussions and collaboration invites
- **Events Management**: Admin-managed hackathons, workshops, and tech events
- **User Profiles**: Detailed profiles with skills, social links, and project portfolios
- **Admin Dashboard**: Complete moderation tools for managing content and users

## Tech Stack

### Frontend
- Next.js 13
- React 18
- Tailwind CSS (CDN)
- Axios for API calls
- JWT decode for token handling

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and setup backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Edit with your values
   npm run dev
   ```

2. **Setup frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local  # Edit with your values
   npm run dev
   ```

3. **Environment Variables:**
   - Update `backend/.env` with MongoDB URI and JWT secret
   - Update `frontend/.env.local` with API URLs

## Project Structure

```
devconnect/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & validation
│   └── server.js        # Main server
├── frontend/
│   ├── pages/           # Next.js pages
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   └── styles/          # Global styles
└── docs/                # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Discussions & Events
- Similar CRUD operations for discussions and events
- Admin endpoints for moderation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository.
