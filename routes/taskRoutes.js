const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

////////////////////////////////////// สร้างงาน //////////////////////////////////////
router.post("/", async (req, res) => {
  const { title, description, dueDate, status, tags } = req.body;

  try {
    const task = new Task({ title, description, dueDate, status, tags });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// แก้ไขงาน //////////////////////////////////////
router.put("/:id", async (req, res) => {
  const { title, description, dueDate, status, tags } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, status, tags },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// ลบงาน /////////////////////////////////////////
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// เลือก ///////////////////////////////////////////
router.get("/:title", async (req, res) => {
    try {
        const task = await Task.find({
            title: { $regex: req.params.title, $options: "i" }
        });

        if (task.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

////////////////////////////////////// ดูงานทั้งหมด //////////////////////////////////////
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////////////////////////////////////////////

module.exports = router;
