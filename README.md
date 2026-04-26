 Journal App

Hi! I built a lightweight, responsive journaling app that lets users log their nature sessions and uses Google's Gemini AI to extract emotional insights.

### Engineering Decisions & Tech Stack
To keep the application highly portable and easy to test, I chose:
* **Backend:** Node.js & Express
* **Frontend:** React (Bootstrapped with Create React App for simplicity)
* **Database:** SQLite. *Note: I went with SQLite so reviewers can clone and run this instantly without needing to configure cloud database credentials.*
* **AI:** Google Gemini 2.5 Flash API .

### Bonus Features Implemented 
* **API Rate Limiting:** Added `express-rate-limit` to protect the backend endpoints.
* **LLM Caching:** Built an in-memory caching system so identical journal entries don't trigger duplicate (and costly) LLM calls.

### How to Run This Locally
1. Clone the repo to your machine.
2. In the `backend` directory, run `npm install`.
3. Create a `.env` file in the backend folder and add: `GEMINI_API_KEY=your_key_here`.
4. Run `node server.js` to start the backend. (The SQLite DB will auto-generate).
5. In a second terminal, navigate to the `frontend` directory, run `npm install`, and then `npm start`.
