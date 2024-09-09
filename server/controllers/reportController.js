const Complaint = require('../models/Complaint');

exports.reportIssue = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  const userId = req.user.id; 

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır.' });
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

    res.status(200).json({ message: 'Geribildiriminiz için teşekkürler, talebiniz oluşturulmuştur.' });
  } catch (error) {
    console.error('Veri işleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
