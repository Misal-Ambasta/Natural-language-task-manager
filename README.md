# 🧠 Natural Language Task Manager

An enterprise-grade, AI-powered to-do list web app that parses natural language inputs to intelligently manage tasks. Built using the **MERN stack with TypeScript**, the app offers a seamless task management experience enhanced by OpenAI's GPT-3.5 Turbo.

## ✨ Features

- 🔍 **AI-Powered Task Parsing**
  - Input natural language commands like:
    - `"Finish landing page Aman by 11pm 20th June"`
    - `"Call client Rajeev tomorrow 5pm"`
  - Or full meeting transcripts like:
    - `"Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday. Shreya please review the marketing deck tonight."`
  - The AI parses the text and extracts:
    - Task Description
    - Assignee
    - Deadline
    - Default priority (P3 unless specified)

- 🧾 **Task Board UI**
  - List view with task details
  - Priority badges (`P1`, `P2`, `P3`, `P4`)
  - Color-coded status indicators: `Pending`, `Overdue`, etc.
  - Remaining time or overdue labels
  - Actions: Edit, Delete, Change Status
  - **Search functionality** to quickly locate tasks
  - **Filter by Assignee or Priority**

- 🧑‍💻 **User Interactions**
  - Edit task details in-place
  - Delete individual tasks
  - Mark tasks as completed
  - Bulk action support

- 💅 **Beautiful & Responsive UI**
  - Built with **Tailwind CSS** for sleek, modern design
  - Fully responsive for desktop and mobile views
  - Clean, intuitive interface with subtle animations

## 🛠 Tech Stack

### Frontend
- **React (with TypeScript)**
- **Tailwind CSS**
- **Zustand** for state management
- **Axios** for API communication

### Backend
- **Node.js + Express (with TypeScript)**
- **MongoDB** with Mongoose
- **OpenAI API (GPT-3.5 Turbo)** for parsing logic

### Others
- **REST API** structure
- **Environment Configs** via `.env`

## 📸 Screenshot

![image](https://github.com/user-attachments/assets/de0223e5-da0e-47d1-8cff-7c7c0f197258)
![image](https://github.com/user-attachments/assets/99ed46d6-0a52-4d70-b0e5-63fd1cdd8dfc)



## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- OpenAI API Key

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Misal-Ambasta/Natural-language-task-manager
   cd natural-language-task-manager

2. Install dependencies
    - Backend:
        ```bash
        cd backend
        npm install
    - Frontend:
        ```bash
        cd frontend
        npm install

3. Set up environment variables
   - Backend:
        - Create a `.env` file in the root directory
        - Add the following variables:
            ```
            PORT=5000
            OPENAI_API_KEY=your_openai_api_key
            MONGODB_URI=your_mongodb_uri
4. Run the app 
    - Backend:
        ```bash
        cd backend
        npm start
    - Frontend:
        ```bash
        cd frontend
        npm run dev

5. Visit http://localhost:5173 in your browser.

## 🧠 AI Prompting Strategy
The app leverages GPT-3.5 to parse text using a system prompt that extracts:

    - Task descriptions

    - Assignee names

    - Due dates (converted to proper timestamps)

    - Priority when mentioned

Parsed output is then stored in MongoDB and displayed in the task board UI.
## 📁 Folder Structure
The project is structured as follows:
``` bash
natural-language-task-manager/
├── frontend/                 # Frontend (React + Tailwind + Zustand)
├── backend/                  # Backend (Express + Mongoose + OpenAI)                  
├── README.md                 # Project overview
```

Built with ❤️ using MERN, Tailwind, Zustand, and OpenAI.
