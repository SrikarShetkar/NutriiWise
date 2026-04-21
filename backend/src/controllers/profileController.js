import db from '../config/database.js';

export const getUserProfile = (req, res) => {
  const { userId } = req;

  db.get('SELECT * FROM user_profiles WHERE userId = ?', [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  });
};

export const createOrUpdateProfile = (req, res) => {
  const { userId } = req;
  const {
    age,
    gender,
    height,
    weight,
    activityLevel,
    dietaryRestrictions,
    allergies,
    budgetPerWeek,
    healthGoals,
    medicalConditions,
    preferredCuisines,
    step,
  } = req.body;

  db.get('SELECT * FROM user_profiles WHERE userId = ?', [userId], (err, existingProfile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingProfile) {
      // Update existing profile
      const updateFields = [];
      const values = [];

      if (age !== undefined) {
        updateFields.push('age = ?');
        values.push(age);
      }
      if (gender !== undefined) {
        updateFields.push('gender = ?');
        values.push(gender);
      }
      if (height !== undefined) {
        updateFields.push('height = ?');
        values.push(height);
      }
      if (weight !== undefined) {
        updateFields.push('weight = ?');
        values.push(weight);
      }
      if (activityLevel !== undefined) {
        updateFields.push('activityLevel = ?');
        values.push(activityLevel);
      }
      if (dietaryRestrictions !== undefined) {
        updateFields.push('dietaryRestrictions = ?');
        values.push(dietaryRestrictions);
      }
      if (allergies !== undefined) {
        updateFields.push('allergies = ?');
        values.push(allergies);
      }
      if (budgetPerWeek !== undefined) {
        updateFields.push('budgetPerWeek = ?');
        values.push(budgetPerWeek);
      }
      if (healthGoals !== undefined) {
        updateFields.push('healthGoals = ?');
        values.push(healthGoals);
      }
      if (medicalConditions !== undefined) {
        updateFields.push('medicalConditions = ?');
        values.push(medicalConditions);
      }
      if (preferredCuisines !== undefined) {
        updateFields.push('preferredCuisines = ?');
        values.push(preferredCuisines);
      }

      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(userId);

      const query = `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE userId = ?`;
      db.run(query, values, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({
          message: 'Profile updated successfully',
          step: step || 'unknown',
        });
      });
    } else {
      // Create new profile
      db.run(
        `INSERT INTO user_profiles (userId, age, gender, height, weight, activityLevel, dietaryRestrictions, allergies, budgetPerWeek, healthGoals, medicalConditions, preferredCuisines)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, age, gender, height, weight, activityLevel, dietaryRestrictions, allergies, budgetPerWeek, healthGoals, medicalConditions, preferredCuisines],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create profile' });
          }

          res.status(201).json({
            message: 'Profile created successfully',
            profileId: this.lastID,
            step: step || 'unknown',
          });
        }
      );
    }
  });
};

export const calculateBMI = (req, res) => {
  const { weight, height } = req.body;

  if (!weight || !height) {
    return res.status(400).json({ error: 'Weight and height are required' });
  }

  const bmi = weight / (height * height);
  let category = '';

  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  res.json({ bmi: bmi.toFixed(2), category });
};

export const deleteProfile = (req, res) => {
  const { userId } = req;

  db.run('DELETE FROM user_profiles WHERE userId = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete profile' });
    }

    res.json({ message: 'Profile deleted successfully' });
  });
};

export default {
  getUserProfile,
  createOrUpdateProfile,
  calculateBMI,
  deleteProfile,
};
