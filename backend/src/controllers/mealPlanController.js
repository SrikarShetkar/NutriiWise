import db from '../config/database.js';

export const createMealPlan = (req, res) => {
  const { userId } = req;
  const { name, startDate, endDate, type, totalCalories, budget } = req.body;

  db.run(
    'INSERT INTO meal_plans (userId, name, startDate, endDate, type, totalCalories, budget) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, name, startDate, endDate, type, totalCalories, budget],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create meal plan' });
      }

      res.status(201).json({
        message: 'Meal plan created successfully',
        mealPlanId: this.lastID,
      });
    }
  );
};

export const getUserMealPlans = (req, res) => {
  const { userId } = req;

  db.all('SELECT * FROM meal_plans WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, plans) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(plans);
  });
};

export const getMealPlanById = (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  db.get('SELECT * FROM meal_plans WHERE id = ? AND userId = ?', [id, userId], (err, plan) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    // Get meal items for this plan
    db.all(
      'SELECT mpi.*, f.name, f.calories, f.protein, f.carbs, f.fats FROM meal_plan_items mpi JOIN foods f ON mpi.foodId = f.id WHERE mpi.mealPlanId = ?',
      [id],
      (err, items) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        plan.items = items;
        res.json(plan);
      }
    );
  });
};

export const addMealToPlain = (req, res) => {
  const { mealPlanId } = req.params;
  const { foodId, mealType, dayOfWeek, servingSize, unit } = req.body;

  db.run(
    'INSERT INTO meal_plan_items (mealPlanId, foodId, mealType, dayOfWeek, servingSize, unit) VALUES (?, ?, ?, ?, ?, ?)',
    [mealPlanId, foodId, mealType, dayOfWeek, servingSize, unit],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add meal item' });
      }

      res.status(201).json({
        message: 'Meal added to plan successfully',
        itemId: this.lastID,
      });
    }
  );
};

export const removeMealFromPlan = (req, res) => {
  const { itemId } = req.params;

  db.run('DELETE FROM meal_plan_items WHERE id = ?', [itemId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove meal item' });
    }

    res.json({ message: 'Meal item removed successfully' });
  });
};

export const deleteMealPlan = (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  db.run('DELETE FROM meal_plans WHERE id = ? AND userId = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete meal plan' });
    }

    res.json({ message: 'Meal plan deleted successfully' });
  });
};

export default {
  createMealPlan,
  getUserMealPlans,
  getMealPlanById,
  addMealToPlain,
  removeMealFromPlan,
  deleteMealPlan,
};
