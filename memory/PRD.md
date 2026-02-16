# tryHimandsee Ministries Website - Product Requirements Document

## Project Overview
**Project Name:** tryHimandsee Ministries Website  
**Date Created:** December 16, 2025  
**Status:** Frontend MVP Complete (Mock Data)

## Original Problem Statement
Build a website for tryHimandsee ministries nonprofit that:
1. Encourages people to follow Christ and seek encounters with Him
2. Serves as an outreach initiative catering to poor and underserved communities in Richmond and Henrico
3. Showcases services: food distribution, clothing assistance, and hygiene kits
4. Features a separate Encounter series section for spiritual worship events

## User Personas
1. **Community Members in Need** - Seeking food, clothing, hygiene assistance
2. **Spiritual Seekers** - Looking for encounters with God, worship experiences
3. **Volunteers** - Want to serve and give back to the community
4. **Donors** - Seeking to support the ministry financially
5. **Prayer Warriors** - Interested in prayer ministry and intercession

## Core Requirements

### Design Specifications
- **Color Scheme:** Gold accents (#f59e0b, #d97706) with dark slate backgrounds (#020617, #0f172a, #1e293b)
- **Typography:** Inter font family for modern, clean readability
- **Style:** Elegant, professional, warm, and welcoming
- **Components:** Shadcn UI library from `/app/frontend/src/components/ui/`

### Pages & Features Implemented ✅

#### 1. Home Page
- Hero section with ministry logo and mission statement
- "Freely Received, Freely Give" - Matthew 10:8 theme
- Mission overview with compelling imagery
- Services showcase (4 cards)
- Encounter series highlight
- Testimonials section
- Call-to-action buttons

#### 2. About Page
- Ministry story and history
- Mission and vision statements
- Core values (Compassion, Community, Purpose, Excellence)
- Leadership section placeholder
- Call-to-action

#### 3. Ministries Page
- Detailed service descriptions with imagery:
  - Food Distribution (Saturdays 9 AM-12 PM)
  - Clothing Assistance (Wed & Sat 9 AM-1 PM)
  - Hygiene Kits
  - Prayer & Spiritual Support
- Impact statistics
- Call-to-action for donations and volunteering

#### 4. Encounters Page (Separate Section)
- Encounter logo integration
- "Encounter is Waiting" hero section
- What to Expect section (Worship, Prayer, Teaching)
- Encounter Series details:
  - Weekly Encounter Nights (Fridays 7 PM)
  - Prayer Gatherings (Tuesdays 6 AM)
  - Annual Encounter Conference
- Testimonials
- Practical information (when, where, what to bring)

#### 5. Get Involved Page
- Ways to serve overview
- Volunteer opportunities:
  - Food Distribution Team
  - Clothing Sorter
  - Event Support
  - Prayer Team
- Volunteer sign-up form (mock submission)
- Benefits of volunteering

#### 6. Contact Page
- Contact information (email, phone, address)
- Contact form with subject selection
- Office hours
- Map placeholder
- Quick links to prayer requests, volunteer, donate

#### 7. Donate Page
- Donation impact showcase ($25, $50, $100)
- Donation type selection (one-time/monthly)
- Preset amount buttons ($25-$500) + custom
- Donor information form
- **Note:** Payment processing placeholder - Stripe integration pending
- Other ways to give (checks, in-kind donations, event sponsorship)
- Tax deductibility information

#### 8. Prayer Requests Page
- Prayer request submission form
- Anonymous submission option
- Community prayer wall
- Prayer team information
- Scripture encouragement

### Shared Components
- **Header:** Fixed navigation with logo, menu links, Donate button
- **Footer:** Multi-column layout with quick links, contact info, social proof

## What's Been Implemented (December 16, 2025)

### Frontend (React + Tailwind + Shadcn UI)
- ✅ All 8 pages created with fully functional UI
- ✅ Mock data stored in `/app/frontend/src/data/mock.js`
- ✅ Responsive design for mobile, tablet, desktop
- ✅ Custom animations and transitions
- ✅ Both ministry and encounter logos integrated
- ✅ Gold accent color scheme throughout
- ✅ Toast notifications for form submissions (using Sonner)
- ✅ Form validation and interactive elements
- ✅ Professional imagery from Unsplash

### Mock Data Includes
- Ministry information and contact details
- 4 service offerings
- 3 encounter series events
- 3 testimonials
- 4 volunteer opportunities
- Sample prayer requests
- Upcoming events

## Prioritized Backlog

### P0 Features (Essential for Launch)
1. **Backend Development**
   - MongoDB models for services, volunteers, donations, prayer requests, contacts
   - FastAPI endpoints for form submissions
   - Email notification system
   
2. **Stripe Payment Integration**
   - Stripe API setup for donations
   - One-time and recurring payment processing
   - Donation receipt generation

3. **Database Integration**
   - Replace all mock data with real database queries
   - Contact form submission storage
   - Volunteer application storage
   - Prayer request storage and management

### P1 Features (High Priority)
1. **Admin Dashboard**
   - View submitted forms
   - Manage prayer requests
   - Track donations
   - Manage volunteer applications

2. **Email Notifications**
   - Contact form submissions
   - Volunteer applications
   - Donation receipts
   - Prayer request confirmations

3. **Google Maps Integration**
   - Real location map on Contact page

### P2 Features (Nice to Have)
1. **Blog/News Section**
   - Ministry updates and stories
   
2. **Photo Gallery**
   - Event photos and community impact

3. **Newsletter Signup**
   - Email list management

4. **Social Media Integration**
   - Share buttons
   - Social media feed

## Technical Architecture

### Frontend Stack
- React 19.0.0
- React Router DOM 7.5.1
- Tailwind CSS 3.4.17
- Shadcn UI Components
- Sonner for toasts
- Lucide React for icons
- Axios for API calls

### Backend Stack (To Be Implemented)
- FastAPI
- MongoDB with Motor (async driver)
- Pydantic models
- Python 3.x

### Environment Variables
- **Frontend:** `REACT_APP_BACKEND_URL` (already configured)
- **Backend:** `MONGO_URL` (already configured)

## Next Tasks
1. Begin backend development (MongoDB models + FastAPI endpoints)
2. Integrate Stripe for donation processing
3. Connect frontend forms to backend APIs
4. Test end-to-end functionality
5. Deploy to production

## API Contracts (To Be Implemented)

### POST /api/contact
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string"
}
```

### POST /api/volunteers
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "opportunity": "string",
  "message": "string"
}
```

### POST /api/prayer-requests
```json
{
  "name": "string",
  "email": "string",
  "request": "string",
  "isAnonymous": "boolean"
}
```

### POST /api/donations (with Stripe)
```json
{
  "amount": "number",
  "donationType": "string",
  "name": "string",
  "email": "string",
  "message": "string",
  "stripeToken": "string"
}
```

## Success Metrics
- User engagement with Encounter events
- Number of volunteer sign-ups
- Donation conversion rate
- Prayer request submissions
- Contact form responses

---

**Last Updated:** December 16, 2025  
**Next Review:** After backend implementation
