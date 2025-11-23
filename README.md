<p float="left">
  <img src="./client/src/assets/screenshots/library-ss-1.png" alt="Image 1" width="320" />
  <img src="./client/src/assets/screenshots/library-ss-2.png" alt="Image 2" width="320" />
  <img src="./client/src/assets/screenshots/library-ss-3.png" alt="Image 3" width="320" />
  <img src="./client/src/assets/screenshots/library-ss-4.png" alt="Image 4" width="320" />
</p>

# Library Web Application

This project is a **Library Management Web Application** built with the MERN stack (MongoDB, Express, React, Node.js).
Users can manage books, add quotes and notes, and export their data.

---

## Features

* 📚 Personal library management
* 🔍 Add books from **Google Books** and perform search and filtering
* 🏷️ Edit library: add or remove books
* 🏷️ Add **tags** to books and search by tags
* 📝 Add **quotes and page notes**; use **OCR technology** to extract text from images
* 📤 Export quotes and notes as **PDF** or **Word** files
* 🖼️ Screenshots included in `/screenshots` folder

---

## Technologies Used

* **MongoDB** – Database
* **Express.js** – Backend API
* **React.js** – Frontend
* **Node.js** – Server
* **Axios** – API requests
* **Mongoose** – MongoDB ORM

---

## Project Structure

```
/client        # React frontend code  
/server        # Node.js backend code  
README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd project-folder
```

### 2. Server Setup

```bash
cd server
npm install
node server
```

### 3. Client Setup

```bash
cd client
npm install
npm run start
```

---

## Notes

* Make sure the backend server is running before testing client features that require API calls.
* Update environment variables (e.g., `.env` file) for database connections as needed.

---

## Contact

For any questions or inquiries, please contact:

* **Email:** [esmanursolmaz@outlook.com](mailto:esmanursolmaz@outlook.com)
