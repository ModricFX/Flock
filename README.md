# Flock - Group Event & Scheduling App

Flock is a mobile application designed to simplify organizing group events such as workouts, trips, and holidays. It helps participants easily collaborate and agree on the best date and time for their activities, making scheduling effortless and convenient.

---

## Features
- **User Authentication**: Register and log in with a secure account (Google login supported).
- **Event & Group Creation**: Organize events and create groups to manage recurring activities.
- **Dynamic Scheduling**: Propose dates and times, and let participants vote on their availability.
- **Friend Invitations**: Invite friends to join events or groups with simple sharing features.
- **Availability Tracking**: Easily track who’s available and who has declined participation.

---

## How It Works
1. **Sign Up/Login**: Register with an email or Google account.
2. **Create or Join an Event**: Set up a new event or join an existing group.
3. **Propose Dates and Times**: Add options for the event’s schedule.
4. **Vote and Track Availability**: Participants vote on their preferred times, and the app determines the best option.
5. **Final Scheduling**: Finalize and confirm the agreed schedule.

---

## Technologies Used
- **Frontend**: React native
- **Backend**: ASP.NET Core (C#)
- **Database**: PostgreSQL
---

## Installation & Running Instructions

### Backend
1. Clone the repository:
   ```sh
   git clone https://github.com/ModricFX/Flock.git
   ```
2. Navigate to the backend folder.
3. Configure the database connection string in appsettings.json.
4. Build and run the backend using Rider or your preferred IDE.
5. Mobile App (Frontend)
   To build the app write in terminal:
   ```sh
   npm install
   npx expo start
   ```
6. Website App (Frontend)
To build the app write in terminal:
   ```sh
   npm install
   npm run dev
   ```

### License
This project is licensed under the MIT License. See the LICENSE file for details.
