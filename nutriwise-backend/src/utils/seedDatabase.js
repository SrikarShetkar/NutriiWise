import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = () => {
  const foodsPath = path.join(__dirname, '../../data/foods.json');

  try {
    const foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

    db.serialize(() => {
      // Check if foods already exist
      db.get('SELECT COUNT(*) as count FROM foods', (err, result) => {
        if (err) {
          console.error('Error checking existing foods:', err);
          return;
        }

        if (result.count > 0) {
          console.log(`Database already has ${result.count} foods. Skipping seed.`);
          return;
        }

        // Insert foods
        foodsData.forEach((food) => {
          const stmt = db.prepare(
            `INSERT INTO foods (name, category, calories, protein, carbs, fats, fiber, vitamins, minerals, price, storageLife, prepTime, healthBenefits, source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );

          stmt.run(
            food.name,
            food.category,
            food.calories,
            food.protein,
            food.carbs,
            food.fats,
            food.fiber,
            food.vitamins ? JSON.stringify(food.vitamins) : null,
            food.minerals ? JSON.stringify(food.minerals) : null,
            food.price,
            food.storageLife,
            food.prepTime,
            food.healthBenefits,
            food.source || 'USDA'
          );
        });

        console.log(`Successfully seeded ${foodsData.length} foods to the database`);
      });
    });
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

seedDatabase();
