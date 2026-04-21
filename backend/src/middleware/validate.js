export const validateRegistration = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Trim and normalize
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

export const validateProfile = (req, res, next) => {
  const { age, gender, height, weight, activityLevel, budgetPerWeek } = req.body;

  if (!age || !gender || !height || !weight || !activityLevel || !budgetPerWeek) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  if (isNaN(age) || age < 10 || age > 100) {
    return res.status(400).json({ error: 'Invalid age' });
  }

  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    return res.status(400).json({ error: 'Invalid height or weight' });
  }

  if (isNaN(budgetPerWeek) || budgetPerWeek < 0) {
    return res.status(400).json({ error: 'Invalid budget' });
  }

  next();
};

export default { validateRegistration, validateProfile };
