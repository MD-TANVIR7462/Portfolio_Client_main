# Dynamic Developer Portfolio — Client Application

Modern, high-performance, responsive React + Vite single page application with a comprehensive administrative management dashboard.

## 🚀 Key Features

- **Public Portfolio:**
  - Dynamic Hero section with configurable subtitle and social channels
  - Dynamic section ordering via custom serial numbers from the admin panel
  - Dynamic section titles, subtitles, and badges customizable from the backend
  - Dynamic tab navigation for Skills and Projects with admin-level visibility toggle
  - Interactive Project Showcase with category filtering, live demos, and detailed modal/pages
  - Dark / Light mode with smooth system transition and persistent preference
  - Clean Core Web Vitals optimization, lazy loading, and responsive layouts
- **Admin Control Center:**
  - Secure JWT authentication with refresh token cookies
  - Real-time management for Projects, Technical Competencies, Career History, Education, Courses, Blog Publications, Testimonials, and Contact Inquiries
  - **Full Backend Search, Sorting, and Server-Side Pagination** on all data tables
  - Sticky table headers with fixed height scrollable containers
  - **Admin User Management:** Create new admins, toggle active/deactivate status (blocking mechanism)
  - Global site settings: SEO metadata, brand logos, section ordering, and dynamic section headers

## 🛠️ Tech Stack

- **Framework:** React 18 (Vite)
- **State Management & Data Fetching:** Redux Toolkit & RTK Query
- **Styling:** Tailwind CSS & Tailwind Typography
- **Animation:** Framer Motion
- **Icons:** React Icons (Feather) & Lucide React
- **Forms & Validation:** React Hook Form & Zod
- **SEO & Notifications:** React Helmet Async & React Hot Toast

## ⚙️ Environment Configuration

Create a `.env` file in the `client/` root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
# Portfolio_Client_main
