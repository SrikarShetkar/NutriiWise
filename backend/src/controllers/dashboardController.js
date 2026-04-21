import db from '../config/database.js';

export const getDashboardData = (req, res) => {
  const { userId } = req;
  const today = new Date().toISOString().split('T')[0];

  Promise.all([
    // Get today's nutrition
    new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(calories) as totalCalories, SUM(protein) as totalProtein, SUM(carbs) as totalCarbs, SUM(fats) as totalFats FROM food_logs WHERE userId = ? AND date = ?',
        [userId, today],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    }),
    // Get user profile
    new Promise((resolve, reject) => {
      db.get('SELECT * FROM user_profiles WHERE userId = ?', [userId], (err, profile) => {
        if (err) reject(err);
        else resolve(profile);
      });
    }),
    // Get meal logs for today
    new Promise((resolve, reject) => {
      db.all(
        'SELECT fl.*, f.name FROM food_logs fl JOIN foods f ON fl.foodId = f.id WHERE fl.userId = ? AND fl.date = ? ORDER BY fl.mealType',
        [userId, today],
        (err, logs) => {
          if (err) reject(err);
          else resolve(logs);
        }
      );
    }),
    // Get recent meal plans
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM meal_plans WHERE userId = ? ORDER BY createdAt DESC LIMIT 3', [userId], (err, plans) => {
        if (err) reject(err);
        else resolve(plans);
      });
    }),
    // Get saved foods count
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM saved_foods WHERE userId = ? AND isFavorite = 1', [userId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
  ])
    .then(([nutrition, profile, logs, plans, saved]) => {
      res.json({
        today,
        nutrition: {
          totalCalories: nutrition?.totalCalories || 0,
          totalProtein: nutrition?.totalProtein || 0,
          totalCarbs: nutrition?.totalCarbs || 0,
          totalFats: nutrition?.totalFats || 0,
        },
        profile,
        foodLogs: logs,
        recentMealPlans: plans,
        savedFoodsCount: saved?.count || 0,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    });
};

export const getWeeklyStats = (req, res) => {
  const { userId } = req;

  db.all(
    `
    SELECT 
      date,
      SUM(calories) as totalCalories,
      SUM(protein) as totalProtein,
      SUM(carbs) as totalCarbs,
      SUM(fats) as totalFats,
      COUNT(*) as mealCount
    FROM food_logs
    WHERE userId = ? AND date >= date('now', '-7 days')
    GROUP BY date
    ORDER BY date DESC
  `,
    [userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(stats);
    }
  );
};

export const getHealthMetrics = (req, res) => {
  const { userId } = req;

  db.get('SELECT * FROM user_profiles WHERE userId = ?', [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const bmi = profile.weight / (profile.height * profile.height);
    const dailyCaloryNeed = calculateCaloryNeeds(profile);

    res.json({
      bmi: bmi.toFixed(2),
      dailyCaloryNeeds: dailyCaloryNeed,
      healthGoals: profile.healthGoals,
      medicalConditions: profile.medicalConditions,
    });
  });
};

function calculateCaloryNeeds(profile) {
  // Harris-Benedict formula for BMR
  let bmr;
  if (profile.gender === 'male') {
    bmr = 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age;
  } else {
    bmr = 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;
  }

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extremely: 1.9,
  };

  const multiplier = activityMultipliers[profile.activityLevel] || 1.5;
  return Math.round(bmr * multiplier);
}

export default {
  getDashboardData,
  getWeeklyStats,
  getHealthMetrics,
};
