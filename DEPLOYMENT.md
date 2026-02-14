# CampusSwap - Deployment Guide 🚀

This guide provides instructions for deploying the CampusSwap application to production.

## 1. Prerequisites
- **Firebase Project**: A Firebase project with Firestore enabled.
- **Google Cloud Console**: Project for Google OAuth integration.
- **Hosting**:
  - **Frontend**: Vercel (Recommended)
  - **Backend**: Render, Railway, or DigitalOcean.
- **Storage**: Cloudinary for image uploads (if not using local disk).

---

## 2. Backend Deployment (Render/Railway)

### Steps:
1. **Set Environment Variables**: Use `server/.env.example` as a template.
2. **Setup Firebase Admin**:
   - Go to Project Settings > Service Accounts in Firebase.
   - Generate a new private key and paste the details into your environment variables.
3. **CORS & Redirects**:
   - Set `CLIENT_URL` to your production frontend domain (e.g., `https://campusswap.vercel.app`).
4. **Deploy**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

---

## 3. Frontend Deployment (Vercel)

### Steps:
1. **Import Project**: Connect Vercel to your GitHub repository.
2. **Framework Preset**: Vite.
3. **Set Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-api.com/api/v1`
   - `VITE_SOCKET_URL`: `https://your-backend-api.com`
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy**: Click Deploy.

---

## 4. Post-Launch Verification Checklist
- [ ] **Auth**: Can users sign up/login/logout?
- [ ] **Images**: Are listing images uploading and displaying?
- [ ] **Real-time**: Does chat work without refreshing?
- [ ] **PWA**: Is the site installable ("Add to Home Screen")?
- [ ] **Security**: Are API errors descriptive but not leaking stack traces?

---

## 5. Troubleshooting
- **CORS Errors**: Ensure the frontend URL is correctly set in the backend's `CLIENT_URL` env variable.
- **Firebase Errors**: Verify the `FIREBASE_PRIVATE_KEY` formatting (often requires `\n` replacement).
- **Socket.io**: If messages aren't real-time, ensure the `VITE_SOCKET_URL` is correct.
