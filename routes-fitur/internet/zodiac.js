import express from 'express';

const router = express.Router();

const zodiacs = [
  ["Capricorn", new Date(1970, 0, 1)],
  ["Aquarius", new Date(1970, 0, 20)],
  ["Pisces", new Date(1970, 1, 19)],
  ["Aries", new Date(1970, 2, 21)],
  ["Taurus", new Date(1970, 3, 21)],
  ["Gemini", new Date(1970, 4, 21)],
  ["Cancer", new Date(1970, 5, 22)],
  ["Leo", new Date(1970, 6, 23)],
  ["Virgo", new Date(1970, 7, 23)],
  ["Libra", new Date(1970, 8, 23)],
  ["Scorpio", new Date(1970, 9, 23)],
  ["Sagittarius", new Date(1970, 10, 22)],
  ["Capricorn", new Date(1970, 11, 22)]
].reverse();

function getZodiac(month, day) {
  let date = new Date(1970, month - 1, day);
  return zodiacs.find(([_, startDate]) => date >= startDate)[0];
}

router.get('/', (req, res) => {
  const { tahun, bulan, tanggal } = req.query;

  if (!tahun || !bulan || !tanggal) {
    return res.status(400).json({
      error: 'Parameter `tahun`, `bulan`, dan `tanggal` harus diisi!'
    });
  }

  const birthDate = new Date(tahun, bulan - 1, tanggal);
  if (isNaN(birthDate)) {
    return res.status(400).json({
      error: 'Tanggal yang dimasukkan tidak valid.'
    });
  }

  const currentDate = new Date();
  const [currentYear, currentMonth, currentDay] = [
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  ];
  const [birthYear, birthMonth, birthDay] = [
    parseInt(tahun),
    parseInt(bulan),
    parseInt(tanggal)
  ];

  const zodiac = getZodiac(birthMonth, birthDay);

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  const nextBirthdayYear = currentMonth > birthMonth || (currentMonth === birthMonth && currentDay > birthDay)
    ? currentYear + 1
    : currentYear;
  const nextBirthday = `${nextBirthdayYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

  const birthdayMessage = currentMonth === birthMonth && currentDay === birthDay
    ? `Selamat ulang tahun yang ke-${age}! 🎉`
    : age;

  const response = {
    lahir: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
    ulang_tahun_berikutnya: nextBirthday,
    usia: birthdayMessage,
    zodiak: zodiac
  };

  res.status(200).json(response);
});

export default router;
