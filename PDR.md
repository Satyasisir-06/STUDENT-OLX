# 📘 Project Design Report (PDR)

## **CampusSwap — Student Peer-to-Peer Marketplace**

> *A minimal, clean platform where students can exchange pre-owned items with juniors and request academic assistance.*

---

| Field              | Details                                            |
| ------------------ | -------------------------------------------------- |
| **Project Title**  | CampusSwap — Student Exchange Portal               |
| **Version**        | 1.0                                                |
| **Date**           | February 15, 2026                                  |
| **Authors**        | *[Your Name / Team Name]*                          |
| **Platform**       | Web Application + Mobile-Responsive PWA            |
| **Status**         | Proposed                                           |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Scope](#4-scope)
5. [System Architecture](#5-system-architecture)
6. [Module Descriptions](#6-module-descriptions)
7. [Technology Stack](#7-technology-stack)
8. [Database Design](#8-database-design)
9. [UI/UX Design Principles](#9-uiux-design-principles)
10. [User Roles & Permissions](#10-user-roles--permissions)
11. [Functional Requirements](#11-functional-requirements)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [API Design](#13-api-design)
14. [Security Considerations](#14-security-considerations)
15. [Deployment Plan](#15-deployment-plan)
16. [Risk Analysis](#16-risk-analysis)
17. [Timeline & Milestones](#17-timeline--milestones)
18. [Future Enhancements](#18-future-enhancements)
19. [Conclusion](#19-conclusion)

---

## 1. Introduction

**CampusSwap** is a student-focused peer-to-peer marketplace — a platform inspired by OLX but exclusively tailored for the student community. It enables students to:

- **Sell or exchange** pre-owned items (textbooks, lab equipment, electronics, stationery, hostel essentials, etc.) with their juniors at affordable prices.
- **Request or offer academic services** — such as assignments, project guidance, notes sharing, and tutoring — creating a collaborative academic ecosystem.

The platform prioritizes a **clean, minimal UI** with a robust **authentication system**, ensuring a safe and seamless experience for every student.

---

## 2. Problem Statement

Students face several recurring challenges:

| Problem                          | Impact                                                                 |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Waste of reusable items**      | Seniors discard textbooks, lab coats, instruments that juniors need     |
| **No centralized marketplace**   | Students rely on scattered WhatsApp groups with no search or filtering |
| **Lack of academic peer-help**   | No structured way to find help with assignments or projects            |
| **Trust & safety concerns**      | Anonymous transactions lead to fraud and unreliable exchanges          |
| **High cost of learning materials** | Buying everything new is expensive for students on a budget         |

**CampusSwap** directly addresses all of these problems by providing a verified, organized, and beautiful student marketplace.

---

## 3. Objectives

1. **Build a peer-to-peer student marketplace** for buying, selling, and exchanging pre-owned items.
2. **Provide an academic services module** where students can request and offer homework, project, and assignment help.
3. **Implement a secure authentication system** with email/college-ID based login and registration.
4. **Deliver a clean, minimal, and responsive UI** that works seamlessly on desktop and mobile browsers.
5. **Ensure trust and safety** through user verification, ratings, and reporting mechanisms.
6. **Enable powerful search and filtering** so students can quickly find what they need.

---

## 4. Scope

### 4.1 In Scope

| Feature                        | Description                                                    |
| ------------------------------ | -------------------------------------------------------------- |
| User Authentication            | Register, Login, Logout, Password Reset, Session Management    |
| Product Listings               | Create, Read, Update, Delete (CRUD) for items to sell/exchange |
| Academic Services              | Request or offer assignments, notes, tutoring                  |
| Search & Filter                | By category, price range, condition, date, college, keyword    |
| User Profiles                  | View seller/buyer profiles, ratings, active listings           |
| Chat / Messaging               | In-app messaging between buyer and seller                      |
| Wishlist                       | Save items for later                                           |
| Notifications                  | Alerts for new messages, price drops, matching items           |
| Admin Panel                    | User management, content moderation, analytics dashboard       |
| Responsive Design              | Mobile-first, PWA-ready design                                 |

### 4.2 Out of Scope (v1.0)

- Online payment gateway integration (cash / UPI on meet-up preferred)
- Native mobile applications (iOS/Android) — PWA will serve mobile users
- AI-based recommendation engine
- Video calling for tutoring sessions

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web Browser  │  │  Mobile PWA  │  │  Admin Dashboard │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│         └─────────────────┼────────────────────┘             │
│                           │                                  │
│                    ┌──────▼───────┐                          │
│                    │   React.js   │                          │
│                    │  (Frontend)  │                          │
│                    └──────┬───────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │  REST API (HTTPS)
┌───────────────────────────┼──────────────────────────────────┐
│                    SERVER LAYER                               │
│                    ┌──────▼───────┐                          │
│                    │   Node.js    │                          │
│                    │  Express.js  │                          │
│                    └──────┬───────┘                          │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│  ┌──────▼───────┐  ┌──────▼──────┐  ┌───────▼──────┐       │
│  │   MongoDB    │  │  Cloudinary │  │  Socket.io   │       │
│  │  (Database)  │  │  (Images)   │  │  (Real-time) │       │
│  └──────────────┘  └─────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Architecture Pattern: **MVC (Model-View-Controller)**

- **Model** — MongoDB schemas via Mongoose
- **View** — React.js SPA with component-based architecture
- **Controller** — Express.js route handlers and middleware

---

## 6. Module Descriptions

### 6.1 Authentication Module

| Feature         | Details                                                     |
| --------------- | ----------------------------------------------------------- |
| Registration    | Name, Email, College, Year, Phone, Password                 |
| Login           | Email + Password with JWT-based session tokens              |
| Password Reset  | Email-based OTP or reset link                               |
| Session Mgmt.   | JWT stored in HTTP-only cookies, auto-refresh tokens        |
| OAuth (optional)| Google Sign-In for quick onboarding                         |

### 6.2 Product Marketplace Module

- **Create Listing** — Title, Description, Price, Category, Condition (New/Used), Images (up to 5), Negotiable flag
- **Browse Listings** — Grid/List view with lazy loading
- **Search** — Full-text search with keyword matching
- **Filters** — Category, Price range, Condition, College, Date posted
- **Item Detail Page** — Full images gallery, seller info, "Contact Seller" CTA

### 6.3 Academic Services Module

- **Post a Request** — "I need help with X" (assignment, project, notes)
- **Offer a Service** — "I can help with Y" (tutoring, assignments, lab work)
- **Subject Tags** — Tag services by subject, semester, branch
- **Pricing** — Free, Negotiable, or Fixed price
- **Status Tracking** — Open → In Progress → Completed

### 6.4 Messaging Module

- **Real-time Chat** — Socket.io powered 1-to-1 messaging
- **Chat List** — All conversations with unread badge count
- **Message Types** — Text, Images, Location sharing (for meet-up point)

### 6.5 User Profile Module

- **Profile Page** — Avatar, Name, College, Year, Bio, Ratings
- **My Listings** — Active, Sold, Expired
- **My Requests** — Academic services posted
- **Reviews & Ratings** — Star-based rating from past transactions

### 6.6 Admin Module

- **Dashboard** — Total users, listings, reports, active chats statistics
- **User Management** — View, Ban, Verify users
- **Content Moderation** — Flag and remove inappropriate listings
- **Reports** — Handle user-reported content and disputes

### 6.7 Notifications Module

- **In-App** — Bell icon with dropdown notification list
- **Email** — Optional email alerts for important events
- **Push (PWA)** — Service worker-based push notifications

---

## 7. Technology Stack

| Layer         | Technology                      | Justification                                     |
| ------------- | ------------------------------- | ------------------------------------------------- |
| **Frontend**  | React.js 18+                    | Component-based, large ecosystem, fast rendering   |
| **Styling**   | Vanilla CSS + CSS Modules       | Clean, minimal design with full control            |
| **State Mgmt**| Redux Toolkit / Context API     | Predictable state management for complex UI flows  |
| **Backend**   | Node.js + Express.js            | JavaScript full-stack, fast I/O, large community   |
| **Database**  | MongoDB + Mongoose              | Flexible schema for varied listing types           |
| **Auth**      | JWT + bcrypt                    | Industry-standard stateless authentication         |
| **Real-time** | Socket.io                       | Bi-directional messaging with low latency          |
| **File Upload** | Cloudinary / Multer           | Image upload, transformation, CDN delivery         |
| **Hosting**   | Vercel (Frontend) + Render (Backend) | Free tier friendly for student projects      |
| **Version Control** | Git + GitHub              | Collaboration, CI/CD, code review                  |

---

## 8. Database Design

### 8.1 Entity-Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────<│   Listing    │     │   Message    │
│          │     │              │     │              │
│ _id      │     │ _id          │     │ _id          │
│ name     │     │ title        │     │ sender       │
│ email    │     │ description  │     │ receiver     │
│ password │     │ price        │     │ content      │
│ college  │     │ category     │     │ listing_ref  │
│ year     │     │ condition    │     │ timestamp    │
│ phone    │     │ images[]     │     └──────────────┘
│ avatar   │     │ seller (ref) │
│ role     │     │ status       │     ┌──────────────┐
│ rating   │     │ createdAt    │     │   Service    │
│ createdAt│     └──────────────┘     │              │
└──────────┘                          │ _id          │
     │                                │ title        │
     │         ┌──────────────┐       │ description  │
     └────────<│   Review     │       │ subject      │
               │              │       │ type         │
               │ _id          │       │ price        │
               │ reviewer     │       │ poster (ref) │
               │ reviewee     │       │ status       │
               │ rating       │       │ createdAt    │
               │ comment      │       └──────────────┘
               │ createdAt    │
               └──────────────┘
```

### 8.2 Collections (MongoDB)

#### `users`
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (unique, required)",
  "password": "String (hashed, required)",
  "college": "String (required)",
  "year": "Number (1-5)",
  "branch": "String",
  "phone": "String",
  "avatar": "String (URL)",
  "bio": "String (max 200 chars)",
  "role": "String (enum: student, admin)",
  "rating": "Number (1-5, default 0)",
  "totalReviews": "Number",
  "wishlist": ["ObjectId (ref: listings)"],
  "isVerified": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `listings`
```json
{
  "_id": "ObjectId",
  "title": "String (required, max 100)",
  "description": "String (required, max 1000)",
  "price": "Number (required, min 0)",
  "category": "String (enum: books, electronics, stationery, clothing, hostel, lab, other)",
  "condition": "String (enum: new, like-new, good, fair)",
  "images": ["String (URLs, max 5)"],
  "seller": "ObjectId (ref: users)",
  "isNegotiable": "Boolean",
  "status": "String (enum: active, sold, expired)",
  "views": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `services`
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "subject": "String",
  "semester": "Number",
  "type": "String (enum: request, offer)",
  "serviceCategory": "String (enum: assignment, project, notes, tutoring, lab-work, other)",
  "price": "Number (0 = free)",
  "poster": "ObjectId (ref: users)",
  "status": "String (enum: open, in-progress, completed, cancelled)",
  "deadline": "Date",
  "createdAt": "Date"
}
```

#### `messages`
```json
{
  "_id": "ObjectId",
  "conversationId": "String",
  "sender": "ObjectId (ref: users)",
  "receiver": "ObjectId (ref: users)",
  "content": "String",
  "type": "String (enum: text, image, location)",
  "isRead": "Boolean",
  "createdAt": "Date"
}
```

#### `reviews`
```json
{
  "_id": "ObjectId",
  "reviewer": "ObjectId (ref: users)",
  "reviewee": "ObjectId (ref: users)",
  "listing": "ObjectId (ref: listings, optional)",
  "rating": "Number (1-5)",
  "comment": "String (max 500)",
  "createdAt": "Date"
}
```

#### `reports`
```json
{
  "_id": "ObjectId",
  "reporter": "ObjectId (ref: users)",
  "targetType": "String (enum: listing, user, service, message)",
  "targetId": "ObjectId",
  "reason": "String (enum: spam, fraud, inappropriate, other)",
  "description": "String",
  "status": "String (enum: pending, reviewed, resolved)",
  "createdAt": "Date"
}
```

---

## 9. UI/UX Design Principles

### 9.1 Design Philosophy

> **"Minimal, Clean, and Student-Friendly"**

| Principle             | Implementation                                      |
| --------------------- | --------------------------------------------------- |
| **Minimalism**        | White space heavy, limited color palette, no clutter |
| **Consistency**       | Unified spacing, typography, and component library   |
| **Accessibility**     | WCAG 2.1 AA compliance, keyboard navigation         |
| **Mobile-First**      | Responsive breakpoints: 320px → 768px → 1024px → 1440px |
| **Micro-animations**  | Subtle hover effects, smooth transitions (300ms)     |

### 9.2 Color Palette

| Role           | Color     | Hex       | Usage                        |
| -------------- | --------- | --------- | ---------------------------- |
| Primary        | Indigo    | `#4F46E5` | Buttons, links, active states |
| Primary Light  | Soft Blue | `#818CF8` | Hover states, accents         |
| Background     | Snow      | `#FAFAFA` | Main background               |
| Surface        | White     | `#FFFFFF` | Cards, modals                 |
| Text Primary   | Charcoal  | `#1F2937` | Headings, body text           |
| Text Secondary | Gray      | `#6B7280` | Captions, metadata            |
| Success        | Emerald   | `#10B981` | Success messages, available   |
| Warning        | Amber     | `#F59E0B` | Warnings, negotiable badge    |
| Error          | Rose      | `#EF4444` | Errors, delete actions        |
| Border         | Light Gray| `#E5E7EB` | Card borders, dividers        |

### 9.3 Typography

| Element    | Font            | Size   | Weight |
| ---------- | --------------- | ------ | ------ |
| Heading 1  | Inter           | 32px   | 700    |
| Heading 2  | Inter           | 24px   | 600    |
| Heading 3  | Inter           | 20px   | 600    |
| Body       | Inter           | 16px   | 400    |
| Caption    | Inter           | 14px   | 400    |
| Button     | Inter           | 14px   | 500    |

### 9.4 Key Screens

| # | Screen                | Description                                                |
|---|---------------------- |------------------------------------------------------------|
| 1 | **Landing Page**      | Hero section, featured listings, categories, CTA           |
| 2 | **Login / Register**  | Clean form with email/password, Google OAuth option         |
| 3 | **Home / Feed**       | Listing cards in a responsive grid, search bar, filters    |
| 4 | **Listing Detail**    | Full image gallery, seller info, contact button            |
| 5 | **Create Listing**    | Step-by-step form with image upload and preview            |
| 6 | **Academic Services** | Request/Offer cards, subject filters, status badges        |
| 7 | **Chat**              | Split-panel chat UI (sidebar + conversation)               |
| 8 | **Profile**           | User info, my listings, ratings, edit profile              |
| 9 | **Wishlist**          | Saved items grid with remove option                        |
| 10| **Admin Dashboard**   | Statistics cards, user table, moderation queue             |

---

## 10. User Roles & Permissions

| Feature               | Guest | Student | Admin |
| --------------------- | :---: | :-----: | :---: |
| View listings         | ✅    | ✅      | ✅    |
| Search & filter       | ✅    | ✅      | ✅    |
| Register / Login      | ✅    | —       | —     |
| Create listing        | ❌    | ✅      | ✅    |
| Edit/Delete own listing| ❌   | ✅      | ✅    |
| Post/Offer services   | ❌    | ✅      | ✅    |
| Send messages         | ❌    | ✅      | ✅    |
| Write reviews         | ❌    | ✅      | ✅    |
| Add to wishlist       | ❌    | ✅      | ✅    |
| Report content        | ❌    | ✅      | ✅    |
| Ban users             | ❌    | ❌      | ✅    |
| Delete any listing    | ❌    | ❌      | ✅    |
| View analytics        | ❌    | ❌      | ✅    |
| Moderate reports      | ❌    | ❌      | ✅    |

---

## 11. Functional Requirements

### FR-01: User Registration
- The system **shall** allow users to register with Name, Email, College, Year, and Password.
- The system **shall** validate email format and enforce password strength (min 8 chars, 1 uppercase, 1 number).
- The system **shall** send a verification email upon registration.

### FR-02: User Login
- The system **shall** authenticate users via email and password.
- The system **shall** issue a JWT token valid for 7 days upon successful login.
- The system **shall** support "Remember Me" functionality.

### FR-03: Create Listing
- The system **shall** allow authenticated users to create a listing with title, description, price, category, condition, and up to 5 images.
- The system **shall** validate all required fields before submission.
- The system **shall** compress and optimize uploaded images.

### FR-04: Browse & Search
- The system **shall** display listings in a paginated, responsive grid.
- The system **shall** support full-text search across title and description.
- The system **shall** support filtering by category, price range, condition, and college.

### FR-05: Messaging
- The system **shall** allow two authenticated users to exchange messages in real-time.
- The system **shall** display an unread message count badge.
- The system **shall** persist all messages in the database.

### FR-06: Academic Services
- The system **shall** allow users to post service requests or offers.
- The system **shall** support filtering by subject, type, and status.
- The system **shall** track service status (Open → In Progress → Completed).

### FR-07: User Profile & Reviews
- The system **shall** display a public profile with user info, listings, and average rating.
- The system **shall** allow users to rate and review other users after a transaction.

### FR-08: Admin Panel
- The system **shall** provide an admin dashboard with user/listing/report statistics.
- The system **shall** allow admins to ban users and remove inappropriate content.

---

## 12. Non-Functional Requirements

| Requirement        | Target                                                        |
| ------------------ | ------------------------------------------------------------- |
| **Performance**    | Page load < 2 seconds, API response < 500ms                  |
| **Scalability**    | Support up to 5,000 concurrent users                         |
| **Availability**   | 99.5% uptime                                                 |
| **Security**       | HTTPS, hashed passwords, input sanitization, rate limiting    |
| **Responsiveness** | Fully usable on screens 320px and above                      |
| **Accessibility**  | WCAG 2.1 Level AA                                            |
| **Browser Support**| Chrome, Firefox, Safari, Edge (latest 2 versions)            |
| **Data Backup**    | Automated daily backups of MongoDB                           |
| **Code Quality**   | ESLint + Prettier enforced, minimum 70% test coverage        |

---

## 13. API Design

### 13.1 Base URL
```
https://api.campusswap.com/v1
```

### 13.2 Authentication Endpoints

| Method | Endpoint             | Description                | Auth |
| ------ | -------------------- | -------------------------- | ---- |
| POST   | `/auth/register`     | Register a new user        | No   |
| POST   | `/auth/login`        | Login and get JWT token    | No   |
| POST   | `/auth/logout`       | Logout and clear session   | Yes  |
| POST   | `/auth/forgot-password` | Send password reset OTP | No   |
| PUT    | `/auth/reset-password`  | Reset password with OTP  | No   |

### 13.3 Listing Endpoints

| Method | Endpoint               | Description                    | Auth |
| ------ | ---------------------- | ------------------------------ | ---- |
| GET    | `/listings`            | Get all listings (paginated)   | No   |
| GET    | `/listings/:id`        | Get listing by ID              | No   |
| POST   | `/listings`            | Create a new listing           | Yes  |
| PUT    | `/listings/:id`        | Update a listing               | Yes  |
| DELETE | `/listings/:id`        | Delete a listing               | Yes  |
| GET    | `/listings/search?q=`  | Search listings by keyword     | No   |
| GET    | `/listings/category/:cat` | Filter by category          | No   |

### 13.4 Service Endpoints

| Method | Endpoint               | Description                    | Auth |
| ------ | ---------------------- | ------------------------------ | ---- |
| GET    | `/services`            | Get all services (paginated)   | No   |
| GET    | `/services/:id`        | Get service by ID              | No   |
| POST   | `/services`            | Create a service request/offer | Yes  |
| PUT    | `/services/:id`        | Update service status          | Yes  |
| DELETE | `/services/:id`        | Delete a service               | Yes  |

### 13.5 User Endpoints

| Method | Endpoint               | Description                    | Auth |
| ------ | ---------------------- | ------------------------------ | ---- |
| GET    | `/users/me`            | Get current user profile       | Yes  |
| PUT    | `/users/me`            | Update current user profile    | Yes  |
| GET    | `/users/:id`           | Get public user profile        | No   |
| GET    | `/users/:id/listings`  | Get user's listings            | No   |
| GET    | `/users/:id/reviews`   | Get user's reviews             | No   |

### 13.6 Message Endpoints

| Method | Endpoint                    | Description                    | Auth |
| ------ | --------------------------- | ------------------------------ | ---- |
| GET    | `/messages/conversations`   | Get all conversations          | Yes  |
| GET    | `/messages/:conversationId` | Get messages in a conversation | Yes  |
| POST   | `/messages`                 | Send a message                 | Yes  |

### 13.7 Wishlist Endpoints

| Method | Endpoint                   | Description                    | Auth |
| ------ | -------------------------- | ------------------------------ | ---- |
| GET    | `/wishlist`                | Get user's wishlist            | Yes  |
| POST   | `/wishlist/:listingId`     | Add to wishlist                | Yes  |
| DELETE | `/wishlist/:listingId`     | Remove from wishlist           | Yes  |

### 13.8 Admin Endpoints

| Method | Endpoint                   | Description                    | Auth  |
| ------ | -------------------------- | ------------------------------ | ----- |
| GET    | `/admin/stats`             | Get platform statistics        | Admin |
| GET    | `/admin/users`             | Get all users                  | Admin |
| PUT    | `/admin/users/:id/ban`     | Ban/Unban a user               | Admin |
| GET    | `/admin/reports`           | Get all pending reports        | Admin |
| PUT    | `/admin/reports/:id`       | Resolve a report               | Admin |
| DELETE | `/admin/listings/:id`      | Force-delete a listing         | Admin |

---

## 14. Security Considerations

| Area                    | Measure                                                       |
| ----------------------- | ------------------------------------------------------------- |
| **Authentication**      | JWT with HTTP-only cookies, refresh token rotation             |
| **Password Storage**    | bcrypt hashing with salt rounds = 12                          |
| **Input Validation**    | Server-side validation with Joi/Zod, XSS sanitization         |
| **Rate Limiting**       | express-rate-limit — 100 requests/15 min per IP               |
| **CORS**                | Whitelist only allowed origins                                |
| **File Upload**         | Max 5MB per image, allowed types: JPEG, PNG, WebP only        |
| **SQL/NoSQL Injection** | Mongoose parameterized queries, no raw string interpolation    |
| **HTTPS**               | TLS/SSL enforced in production                                |
| **Helmet**              | Security headers via helmet.js middleware                      |
| **Content Moderation**  | Admin review queue + automated profanity filter                |

---

## 15. Deployment Plan

### 15.1 Environments

| Environment  | Purpose              | URL                           |
| ------------ | -------------------- | ----------------------------- |
| Development  | Local development    | `http://localhost:3000`       |
| Staging      | Pre-production testing| `https://staging.campusswap.com` |
| Production   | Live application     | `https://campusswap.com`     |

### 15.2 Deployment Architecture

```
GitHub (Source Code)
    │
    ▼
GitHub Actions (CI/CD)
    │
    ├── Build & Test Frontend ──▶ Vercel (Static + SSR)
    │
    └── Build & Test Backend ───▶ Render / Railway (Node.js)
                                      │
                                      ▼
                                MongoDB Atlas (Database)
                                Cloudinary (Image CDN)
```

### 15.3 CI/CD Pipeline Steps

1. **Push to `main`** → Triggers GitHub Actions
2. **Lint & Format** → ESLint + Prettier checks
3. **Test** → Run unit + integration tests
4. **Build** → React production build + Node.js bundle
5. **Deploy** → Auto-deploy to Vercel (frontend) + Render (backend)
6. **Health Check** → Verify `/api/health` endpoint responds 200

---

## 16. Risk Analysis

| Risk                          | Likelihood | Impact | Mitigation                                               |
| ----------------------------- | :--------: | :----: | -------------------------------------------------------- |
| Low initial user adoption     | High       | High   | College Ambassador program, social media marketing       |
| Spam or fake listings         | Medium     | Medium | Email verification, admin moderation, report system      |
| Academic dishonesty concerns  | Medium     | High   | Clear Terms of Service, focus on "guidance" not "doing"  |
| Server downtime               | Low        | High   | Auto-restart, health checks, monitoring with UptimeRobot |
| Data breach                   | Low        | Critical | HTTPS, hashed passwords, rate limiting, security audit |
| Scope creep                   | High       | Medium | Strict MVP scope, feature freeze after v1.0 lock        |

---

## 17. Timeline & Milestones

| Phase | Duration | Milestone                              | Deliverables                              |
| ----- | -------- | -------------------------------------- | ----------------------------------------- |
| **1** | Week 1-2 | **Project Setup & Auth**               | Project scaffold, DB setup, Auth module   |
| **2** | Week 3-4 | **Listings & Search**                  | CRUD listings, search, filters, UI pages  |
| **3** | Week 5   | **Academic Services Module**           | Service requests/offers, status tracking  |
| **4** | Week 6   | **Messaging & Notifications**          | Real-time chat, in-app notifications      |
| **5** | Week 7   | **Profiles, Reviews & Wishlist**       | User profiles, ratings, wishlist feature  |
| **6** | Week 8   | **Admin Panel**                        | Dashboard, user mgmt, content moderation  |
| **7** | Week 9   | **Testing & Bug Fixes**                | Unit tests, integration tests, QA cycle   |
| **8** | Week 10  | **Deployment & Launch**                | Production deploy, monitoring, soft launch|

```
Week:  1  2  3  4  5  6  7  8  9  10
       ▓▓▓▓▓▓            ← Phase 1: Setup & Auth
             ▓▓▓▓▓▓      ← Phase 2: Listings
                   ▓▓▓   ← Phase 3: Services
                      ▓▓▓ ← Phase 4: Messaging
                         ▓▓▓ ← Phase 5: Profiles
                            ▓▓▓ ← Phase 6: Admin
                               ▓▓▓ ← Phase 7: Testing
                                  ▓▓▓ ← Phase 8: Deploy
```

---

## 18. Future Enhancements

| Version | Feature                          | Description                                        |
| ------- | -------------------------------- | -------------------------------------------------- |
| v1.1    | **UPI Payment Integration**      | In-app payments via Razorpay/Paytm                 |
| v1.2    | **Native Mobile Apps**           | React Native apps for iOS and Android              |
| v1.3    | **AI Recommendations**           | ML-based "You might also like" suggestions         |
| v1.4    | **Auction Mode**                 | Timed bidding for high-demand items                |
| v1.5    | **Video Tutoring**               | WebRTC-based live tutoring sessions                |
| v2.0    | **Multi-College Network**        | Federated marketplace across multiple colleges     |
| v2.1    | **Verified Seller Badges**       | ID verification for trusted seller status          |
| v2.2    | **Donation Mode**                | "Give it away" option for charitable exchanges     |

---

## 19. Conclusion

**CampusSwap** aims to be the go-to platform for students to **buy, sell, exchange** pre-owned items and **collaborate on academic tasks** — all within a **clean, safe, and beautifully designed** student-only ecosystem.

By leveraging modern web technologies (React, Node.js, MongoDB), implementing robust security practices, and prioritizing a minimal yet premium UI, CampusSwap will deliver a production-quality experience from day one.

The phased development approach ensures we can launch a solid MVP within 10 weeks while keeping the door open for exciting future enhancements like AI recommendations, payment integration, and native mobile apps.

---

> **"Built by students, for students."** 🎓

---

*End of Project Design Report*
