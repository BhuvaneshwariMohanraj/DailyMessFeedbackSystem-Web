import { GoogleGenerativeAI } from '@google/generative-ai';

interface FeedbackAnalysis {
  priority_score: number;
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  keywords: string[];
  summary: string;
  recommended_action: string;
  escalation_needed: boolean;
  health_safety_concern: boolean;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeFeedback(
    comment: string, 
    rating: number, 
    mealType: string
  ): Promise<FeedbackAnalysis> {
    try {
      const prompt = `
        Analyze this mess/cafeteria feedback and provide a JSON response with the following structure:
        
        Feedback Details:
        - Comment: "${comment}"
        - Rating: ${rating}/5
        - Meal Type: ${mealType}
        
        Please analyze and return ONLY a valid JSON object with these fields:
        {
          "priority_score": <number 1-10>,
          "priority_level": "<LOW|MEDIUM|HIGH|URGENT>",
          "sentiment": "<positive|neutral|negative>",
          "category": "<string: Food Quality|Service|Hygiene|Health Safety|Infrastructure|Staff|Other>",
          "keywords": ["<array of key terms>"],
          "summary": "<brief 1-2 sentence summary>",
          "recommended_action": "<suggested action for management>",
          "escalation_needed": <boolean>,
          "health_safety_concern": <boolean>
        }
        
        Priority Scoring Guidelines:
        - 9-10 (URGENT): Health/safety issues, food poisoning, contamination, serious hygiene problems
        - 7-8 (HIGH): Service disruptions, equipment failures, staff issues, major quality problems
        - 4-6 (MEDIUM): Taste issues, minor quality problems, suggestions for improvement
        - 1-3 (LOW): Minor complaints, general suggestions, positive feedback
        
        Consider the rating when determining priority - very low ratings (1-2) should increase priority.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const analysis: FeedbackAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return this.validateAnalysis(analysis);
      
    } catch (error) {
      console.error('Error analyzing feedback with Gemini:', error);
      
      // Fallback analysis based on rating and basic keywords
      return this.getFallbackAnalysis(comment, rating, mealType);
    }
  }

  private validateAnalysis(analysis: FeedbackAnalysis): FeedbackAnalysis {
    // Ensure priority_score is within valid range
    analysis.priority_score = Math.max(1, Math.min(10, analysis.priority_score));
    
    // Ensure priority_level matches score
    if (analysis.priority_score >= 9) analysis.priority_level = 'URGENT';
    else if (analysis.priority_score >= 7) analysis.priority_level = 'HIGH';
    else if (analysis.priority_score >= 4) analysis.priority_level = 'MEDIUM';
    else analysis.priority_level = 'LOW';
    
    // Ensure valid sentiment
    if (!['positive', 'neutral', 'negative'].includes(analysis.sentiment)) {
      analysis.sentiment = 'neutral';
    }
    
    // Ensure keywords is an array
    if (!Array.isArray(analysis.keywords)) {
      analysis.keywords = [];
    }
    
    return analysis;
  }

  private getFallbackAnalysis(comment: string, rating: number, mealType: string): FeedbackAnalysis {
    const lowerComment = comment.toLowerCase();
    
    // Health/safety keywords
    const healthKeywords = ['poison', 'sick', 'stomach', 'vomit', 'spoiled', 'rotten', 'insects', 'hair', 'dirty', 'contaminated'];
    const hasHealthConcern = healthKeywords.some(keyword => lowerComment.includes(keyword));
    
    // Service keywords
    const serviceKeywords = ['staff', 'rude', 'slow', 'queue', 'wait', 'service'];
    const hasServiceIssue = serviceKeywords.some(keyword => lowerComment.includes(keyword));
    
    // Quality keywords
    const qualityKeywords = ['taste', 'cold', 'hot', 'salty', 'sweet', 'bland', 'overcooked', 'undercooked'];
    const hasQualityIssue = qualityKeywords.some(keyword => lowerComment.includes(keyword));
    
    let priority_score = 5;
    let category = 'Other';
    
    if (hasHealthConcern) {
      priority_score = 10;
      category = 'Health Safety';
    } else if (rating <= 2) {
      priority_score = Math.max(7, priority_score);
      category = hasServiceIssue ? 'Service' : 'Food Quality';
    } else if (rating <= 3) {
      priority_score = Math.max(5, priority_score);
      category = hasQualityIssue ? 'Food Quality' : 'Service';
    } else if (rating >= 4) {
      priority_score = Math.min(4, priority_score);
      category = 'Food Quality';
    }
    
    return {
      priority_score,
      priority_level: priority_score >= 9 ? 'URGENT' : priority_score >= 7 ? 'HIGH' : priority_score >= 4 ? 'MEDIUM' : 'LOW',
      sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
      category,
      keywords: [mealType, category.toLowerCase()],
      summary: `${rating}/5 rating for ${mealType} with ${category.toLowerCase()} feedback`,
      recommended_action: hasHealthConcern ? 'Immediate investigation required' : 'Review and address concerns',
      escalation_needed: priority_score >= 8,
      health_safety_concern: hasHealthConcern
    };
  }

  async generateInsights(feedbackList: any[]): Promise<string> {
    try {
      const prompt = `
        Analyze these mess feedback entries and provide actionable insights for management:
        
        ${feedbackList.map((fb, index) => `
        ${index + 1}. Rating: ${fb.rating}/5, Meal: ${fb.meal_type}
           Comment: "${fb.comment}"
           Category: ${fb.ai_category || 'N/A'}
           Priority: ${fb.ai_priority_level || 'N/A'}
        `).join('\n')}
        
        Provide a concise summary with:
        1. Key trends and patterns
        2. Most urgent issues to address
        3. Specific actionable recommendations
        4. Overall satisfaction trends
        
        Keep the response under 300 words and focus on actionable insights.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error generating insights:', error);
      return 'Unable to generate insights at this time. Please review individual feedback items.';
    }
  }
}

export default new GeminiService();
