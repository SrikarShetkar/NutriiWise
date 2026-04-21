import db from '../config/database.js';

export const saveFoodsToFavorites = (req, res) => {
  const { userId } = req;
  const { foodId } = req.body;

  db.run(
    'INSERT OR REPLACE INTO saved_foods (userId, foodId, isFavorite) VALUES (?, ?, 1)',
    [userId, foodId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save food' });
      }

      res.status(201).json({ message: 'Food added to favorites' });
    }
  );
};

export const getUserSavedFoods = (req, res) => {
  const { userId } = req;

  db.all(
    'SELECT f.* FROM foods f JOIN saved_foods sf ON f.id = sf.foodId WHERE sf.userId = ? AND sf.isFavorite = 1',
    [userId],
    (err, foods) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(foods);
    }
  );
};

export const removeSavedFood = (req, res) => {
  const { userId } = req;
  const { foodId } = req.params;

  db.run('DELETE FROM saved_foods WHERE userId = ? AND foodId = ?', [userId, foodId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove saved food' });
    }

    res.json({ message: 'Food removed from favorites' });
  });
};

export const isFoodSaved = (req, res) => {
  const { userId } = req;
  const { foodId } = req.params;

  db.get('SELECT * FROM saved_foods WHERE userId = ? AND foodId = ?', [userId, foodId], (err, saved) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ isSaved: !!saved });
  });
};

export default {
  saveFoodsToFavorites,
  getUserSavedFoods,
  removeSavedFood,
  isFoodSaved,
};
