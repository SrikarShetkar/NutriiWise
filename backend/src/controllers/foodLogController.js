import db from '../config/database.js';

export const logFood = (req, res) => {
  const { userId } = req;
  const { foodId, date, mealType, servingSize, unit } = req.body;

  // Get food details for nutritional info
  db.get('SELECT * FROM foods WHERE id = ?', [foodId], (err, food) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    // Calculate nutrition based on serving size
    const multiplier = servingSize || 1;
    const calories = (food.calories || 0) * multiplier;
    const protein = (food.protein || 0) * multiplier;
    const carbs = (food.carbs || 0) * multiplier;
    const fats = (food.fats || 0) * multiplier;
    const fiber = (food.fiber || 0) * multiplier;

    db.run(
      'INSERT INTO food_logs (userId, foodId, date, mealType, servingSize, unit, calories, protein, carbs, fats, fiber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, foodId, date, mealType, servingSize, unit, calories, protein, carbs, fats, fiber],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to log food' });
        }

        res.status(201).json({
          message: 'Food logged successfully',
          logId: this.lastID,
          nutritionInfo: { calories, protein, carbs, fats, fiber },
        });
      }
    );
  });
};

export const getFoodLog = (req, res) => {
  const { userId } = req;
  const { date } = req.query;

  let query = 'SELECT fl.*, f.name FROM food_logs fl JOIN foods f ON fl.foodId = f.id WHERE fl.userId = ?';
  const params = [userId];

  if (date) {
    query += ' AND fl.date = ?';
    params.push(date);
  }

  query += ' ORDER BY fl.createdAt DESC';

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(logs);
  });
};

export const getDailyNutrition = (req, res) => {
  const { userId } = req;
  const { date } = req.query;

  const queryDate = date || new Date().toISOString().split('T')[0];

  db.get(
    'SELECT SUM(calories) as totalCalories, SUM(protein) as totalProtein, SUM(carbs) as totalCarbs, SUM(fats) as totalFats, SUM(fiber) as totalFiber FROM food_logs WHERE userId = ? AND date = ?',
    [userId, queryDate],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        date: queryDate,
        nutrition: {
          totalCalories: result?.totalCalories || 0,
          totalProtein: result?.totalProtein || 0,
          totalCarbs: result?.totalCarbs || 0,
          totalFats: result?.totalFats || 0,
          totalFiber: result?.totalFiber || 0,
        },
      });
    }
  );
};

export const deleteFoodLog = (req, res) => {
  const { logId } = req.params;
  const { userId } = req;

  db.run('DELETE FROM food_logs WHERE id = ? AND userId = ?', [logId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete food log' });
    }

    res.json({ message: 'Food log deleted successfully' });
  });
};

export const getNutritionTrends = (req, res) => {
  const { userId } = req;
  const { days = 7 } = req.query;

  const query = `
    SELECT 
      date,
      SUM(calories) as totalCalories,
      SUM(protein) as totalProtein,
      SUM(carbs) as totalCarbs,
      SUM(fats) as totalFats
    FROM food_logs
    WHERE userId = ? AND date >= date('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date DESC
  `;

  db.all(query, [userId, days], (err, trends) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(trends);
  });
};

export default {
  logFood,
  getFoodLog,
  getDailyNutrition,
  deleteFoodLog,
  getNutritionTrends,
};
