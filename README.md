# 💬 ArielsChat - Real-Time Chat Application

> A modern, scalable real-time chat application built with React, Cloudflare Workers, and WebSockets.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-4.9-E36002)](https://hono.dev/)

## ✨ Overview

ArielsChat is a full-stack real-time chat application that enables instant communication through WebSockets. Built on Cloudflare's edge infrastructure, it offers low-latency messaging with support for both anonymous and authenticated users.

### Key Highlights

- 🚀 **Edge-First Architecture** - Deployed on Cloudflare Workers for global low-latency
- 💬 **Real-Time Messaging** - WebSocket-powered instant communication
- 👥 **Flexible User System** - Support for both anonymous and registered users
- 🔒 **Private & Group Chats** - Create private rooms or direct messages
- 📱 **Modern UI** - Built with React 19 and modern web standards
- 🗄️ **Persistent Storage** - Message history stored in Cloudflare D1

## 🏗️ Architecture

This project is organized as a monorepo with two main components:

```
ArielsChat/
├── onlinechat/          # React frontend application
└── onlinechatworker/    # Cloudflare Workers backend
```

### Frontend (`onlinechat/`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (Rolldown)
- **Features**: 
  - Real-time chat interface
  - User authentication
  - Room management
  - WebSocket client

### Backend (`onlinechatworker/`)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Real-time**: Durable Objects for WebSocket connections
- **Features**:
  - RESTful API
  - WebSocket server
  - User authentication
  - Message persistence

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ArielsChat
   ```

2. **Setup Backend**
   ```bash
   cd onlinechatworker
   npm install
   
   # Create and initialize D1 database
   wrangler d1 create chatOnlineDB
   wrangler d1 execute chatOnlineDB --file=schema.sql
   
   # Update wrangler.toml with your database ID
   ```

3. **Setup Frontend**
   ```bash
   cd ../onlinechat
   npm install
   ```

### Development

Run both frontend and backend in development mode:

**Terminal 1 - Backend:**
```bash
cd onlinechatworker
npm run dev
# Backend runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
cd onlinechat
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Deployment

**Deploy Backend:**
```bash
cd onlinechatworker
npm run deploy
```

**Build Frontend:**
```bash
cd onlinechat
npm run build
```

## 📋 Features

### User Management
- ✅ Anonymous access with auto-generated usernames
- ✅ User registration and authentication
- ✅ Customizable display names and colors
- ✅ User search functionality

### Chat Features
- ✅ Global chat room for all users
- ✅ Private group rooms
- ✅ Direct messaging (DM)
- ✅ Real-time message delivery
- ✅ Online user presence
- ✅ Message history and persistence

### Technical Features
- ✅ WebSocket connections via Durable Objects
- ✅ RESTful API for HTTP operations
- ✅ SQLite database with D1
- ✅ Password hashing and security
- ✅ Edge deployment for low latency

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite (Rolldown)
- WebSocket Client

### Backend
- Cloudflare Workers
- Hono Framework
- Durable Objects
- Cloudflare D1 (SQLite)
- TypeScript

## 📁 Project Structure

```
ArielsChat/
├── onlinechat/                 # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   └── assets/             # Static assets
│   ├── package.json
│   └── vite.config.ts
│
└── onlinechatworker/           # Backend application
    ├── src/
    │   ├── durable/            # Durable Objects
    │   ├── routes/             # API routes
    │   ├── utils/              # Utilities
    │   └── index.ts            # Entry point
    ├── schema.sql              # Database schema
    ├── wrangler.toml           # Cloudflare config
    └── package.json
```

## 🔒 Security

- Password hashing using secure algorithms
- WebSocket authentication and validation
- SQL injection protection via parameterized queries
- Private room access control
- CORS configuration for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Hono](https://hono.dev/)
- UI built with [React](https://react.dev/)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ by Ariel**
