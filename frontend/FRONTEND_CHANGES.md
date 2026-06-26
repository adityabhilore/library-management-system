# Frontend Changes Documentation

## Overview
This document outlines all the changes and features implemented in the Library Management System frontend built with React, Vite, and React Router.

---

## Technology Stack

### Core Dependencies
- **React**: v19.2.0 - UI library
- **React DOM**: v19.2.0 - React rendering
- **React Router DOM**: v7.9.6 - Client-side routing and navigation
- **Axios**: v1.13.2 - HTTP client for API calls
- **React Icons**: v5.5.0 - Icon library (Font Awesome, Feather, etc.)
- **Recharts**: v3.4.1 - Data visualization and charts

### Build & Development Tools
- **Vite**: v7.2.2 - Fast build tool and dev server
- **ESLint**: v9.39.1 - Code quality and linting
- **Babel Plugin React Compiler**: v1.0.0 - React compiler for optimization

---

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── api/
│   │   └── config.js      # API configuration and base URL
│   ├── assets/            # Image and static resources
│   ├── components/        # Reusable React components
│   │   ├── AdminLayout.jsx
│   │   └── ManualEntryModal.jsx
│   ├── pages/             # Page components (routed pages)
│   │   ├── AdminLogin.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MembersPage.jsx
│   │   ├── TimetablePage.jsx
│   │   ├── AcademicCalendarPage.jsx
│   │   ├── LogsPage.jsx
│   │   ├── ScanPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── Logout.jsx
│   ├── styles/            # CSS stylesheets
│   │   ├── theme.css
│   │   ├── login-new.css
│   │   ├── Dashboard.css
│   │   ├── adminLayout.css
│   │   ├── members.css
│   │   ├── timetable.css
│   │   ├── academicCalendar.css
│   │   ├── logs.css
│   │   ├── scan.css
│   │   └── settings.css
│   ├── App.jsx            # Main app component with routing
│   ├── App.css
│   ├── main.jsx           # Application entry point
│   └── index.css
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## Key Features & Pages

### 1. **Authentication**
- **Page**: `AdminLogin.jsx`
- **Features**:
  - Admin login form with username and password
  - Password visibility toggle (show/hide)
  - Password limit to 72 characters (bcrypt limit)
  - Error and success message handling
  - Local storage for admin credentials after successful login
  - Auto-redirect to dashboard on successful login
  - Animated background with decorative shapes

### 2. **Dashboard**
- **Page**: `Dashboard.jsx`
- **Features**:
  - Overview statistics and summaries
  - Multiple interactive charts using Recharts:
    - **Pie Chart**: Member distribution by type
    - **Department Bar Chart**: Members per department
    - **Attendance Timeline**: Attendance over time visualization
  - Dynamic filters for:
    - Member Type
    - Department
    - Year
    - Division
  - Real-time data loading from backend API
  - Icons for quick visual reference (FaUserGraduate, FaChalkboardTeacher, FaSignInAlt, FaSignOutAlt)
  - Responsive layout using AdminLayout component
  - Error handling and loading states

### 3. **Members Management**
- **Page**: `MembersPage.jsx`
- **Features**:
  - View all members (students and faculty)
  - Pagination support
  - Advanced filtering:
    - Department
    - Year
    - Division
    - Batch
  - Add new member form modal
  - Edit existing member details
  - Delete members
  - Bulk CSV upload functionality
  - Dynamic filter options loaded from database
  - Theme toggle support (light/dark mode)
  - Search and sort capabilities

### 4. **Timetable Management**
- **Page**: `TimetablePage.jsx`
- **Features**:
  - Display timetable by day (Monday-Saturday)
  - Add new timetable entries
  - Edit existing entries
  - Delete entries
  - Filters:
    - Department
    - Year
    - Division
    - Batch
  - Pagination for entries
  - CSV upload for bulk timetable import
  - Entry types: Lecture, Lab, Practical
  - Dark/Light theme support
  - Class timing configuration

### 5. **Academic Calendar**
- **Page**: `AcademicCalendarPage.jsx`
- **Features**:
  - Manage academic events and holidays
  - Add events with date and event type
  - Edit and delete events
  - Event types: Holiday, Exam, Semester Break, etc.
  - Search and filter functionality:
    - Filter by date
    - Filter by event type
    - Filter by description
  - Pagination (10 items per page)
  - CSV upload for bulk event import
  - Dark/Light theme toggle
  - Event descriptions and details

### 6. **Library Scan System**
- **Page**: `ScanPage.jsx`
- **Features**:
  - Real-time RFID/ID card scanning
  - Entry and exit tracking
  - Input field keeps focus for continuous scanning
  - Success/error message feedback (auto-clear after 3 seconds)
  - Back button to return to dashboard
  - Clean, minimalist UI with icon
  - Keyboard input handling (Enter key submission)
  - Real-time API communication

### 7. **Logs Page**
- **Page**: `LogsPage.jsx`
- **Features**:
  - View system logs and activities
  - Integrated with AdminLayout
  - Theme support

### 8. **Settings Page**
- **Page**: `SettingsPage.jsx`
- **Features**:
  - System configuration options
  - User preferences
  - Theme management

### 9. **Logout**
- **Page**: `Logout.jsx`
- **Features**:
  - Clear local storage
  - Redirect to login page
  - Session termination

---

## Components

### AdminLayout
- **File**: `components/AdminLayout.jsx`
- **Purpose**: Main layout wrapper for admin pages
- **Features**:
  - Sidebar navigation
  - Header with theme toggle
  - useTheme hook for dark/light mode state management
  - Consistent styling across all admin pages

### ManualEntryModal
- **File**: `components/ManualEntryModal.jsx`
- **Purpose**: Modal dialog for manually entering data
- **Features**:
  - Reusable modal component
  - Form validation
  - Submit and cancel actions

---

## Routing Configuration

The application uses React Router with the following routes:

```javascript
/ → AdminLogin (default)
/admin/login → AdminLogin page
/admin/dashboard → Main dashboard
/admin/members → Members management
/admin/timetable → Timetable management
/admin/academic-calendar → Academic calendar
/admin/logs → System logs
/scan → Library scan system
/settings → Settings page
/logout → Logout action
```

---

## Styling & Theme

### CSS Files
- **theme.css**: Global theme variables and base styles
- **login-new.css**: Login page styling with animated background
- **Dashboard.css**: Dashboard layout and chart styling
- **adminLayout.css**: Admin layout structure
- **members.css**: Members page styling
- **timetable.css**: Timetable page styling
- **academicCalendar.css**: Academic calendar styling
- **logs.css**: Logs page styling
- **scan.css**: Scan page styling
- **settings.css**: Settings page styling
- **App.css**: Global app styles

### Features
- Dark/Light theme toggle
- Responsive design
- Animated backgrounds on login
- Icon-based UI elements using React Icons

---

## API Integration

### Configuration
- **File**: `src/api/config.js`
- Base URL: Configured for backend API communication
- HTTP Client: Axios

### API Endpoints Used
- `POST /admin/login` - User authentication
- `GET /admin/charts/members` - Member distribution data
- `GET /admin/charts/department-wise` - Department-wise member count
- `GET /admin/charts/attendance-timeline` - Attendance timeline data
- `GET /members` - List all members
- `POST /members` - Add new member
- `PUT /members/{id}` - Update member
- `DELETE /members/{id}` - Delete member
- `POST /members/bulk-upload` - CSV upload
- `GET /timetable` - Get timetable
- `POST /timetable` - Add timetable entry
- `PUT /timetable/{id}` - Update timetable
- `DELETE /timetable/{id}` - Delete timetable
- `POST /timetable/bulk-upload` - CSV upload
- `GET /academic-calendar` - Get events
- `POST /academic-calendar` - Add event
- `PUT /academic-calendar/{id}` - Update event
- `DELETE /academic-calendar/{id}` - Delete event
- `POST /academic-calendar/bulk-upload` - CSV upload
- `POST /scan` - Record scan entry/exit
- `GET /logs` - System logs

---

## State Management

### Local State (useState)
Each page component manages its own state for:
- Form data (add/edit forms)
- API responses (members, events, timetable entries)
- UI states (modals, loading, errors)
- Filters and pagination
- Theme preferences

### Persistent Storage
- Admin credentials stored in localStorage after login
- Theme preference managed through context (AdminLayout)

---

## Form Handling

### Common Features
- Form validation before submission
- Error message display
- Success feedback
- Loading states during API calls
- Clear form after successful submission
- CSV file upload support

### Modal Forms
- Add new entries
- Edit existing entries
- Delete confirmation dialogs
- Field validation

---

## User Experience Enhancements

1. **Auto-focus**: Input fields auto-focus when modals open
2. **Error Handling**: Graceful error messages and recovery
3. **Loading States**: Visual feedback during data fetching
4. **Success Messages**: Confirmation of successful actions
5. **Keyboard Navigation**: Support for keyboard interactions
6. **Responsive Design**: Works on different screen sizes
7. **Dark/Light Theme**: User preference for comfortable viewing
8. **Auto-clearing Messages**: Messages disappear after 3 seconds
9. **Pagination**: Navigate large datasets efficiently
10. **Filter Options**: Dynamic filtering based on database data

---

## Security Measures

1. **Password Limit**: 72-character limit enforced (bcrypt compatibility)
2. **Local Storage**: Admin credentials stored securely
3. **API Communication**: Axios for secure HTTP requests
4. **Error Messages**: Generic error messages to prevent information leakage

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## Browser Compatibility
- Modern browsers with ES6+ support
- React 19.2.0 requires modern JavaScript features
- Responsive design for desktop and tablet use

---

## Performance Optimizations
- Code splitting with Vite
- Recharts for efficient data visualization
- React component re-render optimization with Babel compiler
- Lazy loading of routes with React Router

---

## Future Enhancements
- Mobile app development
- Real-time notifications
- Advanced analytics and reporting
- Export functionality (PDF, Excel)
- User role-based access control (RBAC)
- Session timeout management
- Multi-language support (i18n)

---

## Notes
- All API calls are made using Axios with error handling
- Form state is managed locally in each component
- Icons are sourced from React Icons library
- Styling uses CSS modules and global CSS files
- The application follows React best practices and hooks patterns

