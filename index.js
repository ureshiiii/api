const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Data donors
let donor = [
  { donor: 'Fatur Rawr', amount: 35000, icon: 'fa fa-minus' },
  { donor: 'Jian', amount: 29000, icon: 'fa fa-minus' },
  { donor: 'Wolfyydamya', amount: 15000, icon: 'fa-solid fa-arrow-up' },
  { donor: 'Hilal', amount: 14000, icon: 'fa-solid fa-arrow-down' },
  { donor: 'Lang', amount: 5000, icon: 'fa-solid fa-arrow-up' }
];

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get donors
app.get('/api/donors', (req, res) => {
  res.json(donor);
});

// Function to calculate total amount
const calculateTotalAmount = () => {
  return donor.reduce((total, currentDonor) => total + currentDonor.amount, 0);
};

// Endpoint to get total amount
app.get('/api/total-amount', (req, res) => {
  const totalAmount = calculateTotalAmount();
  res.json({ totalAmount });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
