require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
connectDB();

cron.schedule('0 0 * * *', async () => {
  const tasks = await Task.find({ dueDate: { $lte: new Date() } });
  
  tasks.forEach(async (task) => {
    if (task.status !== "Completed") {
      sendEmailNotification(task);
    }
  });
});

app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));