const Complaint = require('../models/Complaint');

exports.reportIssue = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  const userId = req.user.id; 

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'All fields must be filled.' });
  }

  try {
    const newComplaint = new Complaint({
      userId,
      firstName,
      lastName,
      email,
      message
    });

    await newComplaint.save();

    res.status(200).json({ message: 'Thank you for your feedback, your request has been submitted.' });
  } catch (error) {
    console.error('Data processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
