import db from '../config/database.js';

export const getAllFoods = (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM foods WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, foods) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(foods);
  });
};

export const getFoodById = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM foods WHERE id = ?', [id], (err, food) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  });
};

export const searchFoods = (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  db.all(
    'SELECT * FROM foods WHERE name LIKE ? OR category LIKE ? LIMIT 20',
    [`%${query}%`, `%${query}%`],
    (err, foods) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(foods);
    }
  );
};

export const getFoodsByCategory = (req, res) => {
  const { category } = req.params;

  db.all('SELECT * FROM foods WHERE category = ?', [category], (err, foods) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(foods);
  });
};

export const getCategories = (req, res) => {
  db.all('SELECT DISTINCT category FROM foods', (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(categories.map((c) => c.category));
  });
};

export const getFoodNutrition = (req, res) => {
  const { id } = req.params;

  db.get('SELECT id, name, calories, protein, carbs, fats, fiber FROM foods WHERE id = ?', [id], (err, food) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  });
};

export default {
  getAllFoods,
  getFoodById,
  searchFoods,
  getFoodsByCategory,
  getCategories,
  getFoodNutrition,
};
