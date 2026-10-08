# Smart Meeting Room Booking

MERN stack Application for booking meeting rooms without time conflicts.

## Project Structure
- `cleint/`: Frontend React, Tailwind CSS, and React Hook Form.
- `server/`: Backend Node.js/Express, MongoDB, Mongoose, and Moment Timezone.

## Prerequisites
- Node.js
- MongoDB: (Ensure replica set is enabled for transactions)

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd smart_meeting_room_booking
```

### 2. Backend Setup
```bash
cd server
npm install
```

```bash
cp env.example .env
```

```bash
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd cleint
npm install
npm run dev
```