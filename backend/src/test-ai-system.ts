// Test script to create sample feedback data for AI analysis
import { getPool } from './database';

const testFeedbackData = [
  {
    rating: 1,
    comment: "The chicken curry today smelled bad and many students got stomach ache after eating it. This is a serious health issue!",
    meal_type: "lunch",
    is_anonymous: false
  },
  {
    rating: 2,
    comment: "The food counter was closed during lunch time and staff was very rude to students waiting in queue.",
    meal_type: "lunch", 
    is_anonymous: false
  },
  {
    rating: 3,
    comment: "The rice was too salty today and the dal was cold. Food quality needs improvement.",
    meal_type: "lunch",
    is_anonymous: false
  },
  {
    rating: 5,
    comment: "The food was delicious today, especially the dessert. Great job by the kitchen staff!",
    meal_type: "lunch",
    is_anonymous: false
  },
  {
    rating: 1,
    comment: "Found insects in the sambar. This is disgusting and unhygienic. Immediate action needed.",
    meal_type: "breakfast",
    is_anonymous: true
  }
];

async function createTestData() {
  try {
    const pool = getPool();
    if (!pool) {
      console.error('Database not connected');
      return;
    }

    console.log('Creating test feedback data...');
    
    for (const feedback of testFeedbackData) {
      const today = new Date().toISOString().split('T')[0];
      
      await pool.request()
        .input('userId', 2) // Using user ID 2 (regular user)
        .input('rating', feedback.rating)
        .input('comment', feedback.comment)
        .input('isAnonymous', feedback.is_anonymous ? 1 : 0)
        .input('mealDate', today)
        .input('mealType', feedback.meal_type)
        .query(`
          INSERT INTO Feedback (user_id, rating, comment, is_anonymous, status, meal_date, meal_type)
          VALUES (@userId, @rating, @comment, @isAnonymous, 'pending', @mealDate, @mealType)
        `);
    }

    console.log('✅ Test feedback data created successfully!');
    console.log('Now the AI system will analyze this feedback and you should see:');
    console.log('- Priority scores assigned');
    console.log('- Health/safety alerts triggered');
    console.log('- Sentiment analysis results');
    console.log('- Category classifications');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();
