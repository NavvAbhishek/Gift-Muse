import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { getConfig, isConfigured } from './configManager.js';

dotenv.config();

/**
 * Generate gift search queries using Gemini AI
 */
async function generateWithGemini(userDescription, apiKey, model) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = buildPrompt(userDescription);

  console.log(`🤖 Requesting gift ideas from Gemini AI (${model})...`);

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  console.log('📥 Raw AI Response:', text);

  return cleanAndParseResponse(text);
}

/**
 * Generate gift search queries using Groq AI
 */
async function generateWithGroq(userDescription, apiKey, model) {
  const groq = new Groq({ apiKey });

  const prompt = buildPrompt(userDescription);

  console.log(`🤖 Requesting gift ideas from Groq AI (${model})...`);

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: model,
    temperature: 0.7,
    max_tokens: 1024
  });

  let text = chatCompletion.choices[0]?.message?.content || '';

  console.log('📥 Raw AI Response:', text);

  return cleanAndParseResponse(text);
}

/**
 * Build the prompt for gift query generation
 */
function buildPrompt(userDescription) {
  return `You are a gift recommendation expert. Analyze this person description and generate exactly 6 unique, specific search queries for finding gifts.

Person Description: "${userDescription}"

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no explanations, just the JSON array.

Format:
[
  {
    "query": "specific search term",
    "reason": "why this gift matches the person (1-2 sentences)"
  },
  {
    "query": "another specific search term",
    "reason": "why this gift is perfect"
  },
  {
    "query": "third unique search term",
    "reason": "why they'll love this"
  },
  {
    "query": "fourth creative search term",
    "reason": "why this is a great match"
  },
  {
    "query": "fifth unique search term",
    "reason": "why this gift works"
  },
  {
    "query": "sixth special search term",
    "reason": "why this is perfect for them"
  }
]

Make the queries creative, specific, and tailored to the person's interests. Include a mix of practical and creative gifts. Avoid generic terms.`;
}

/**
 * Clean and parse the AI response
 */
function cleanAndParseResponse(text) {
  // Clean up response - remove markdown code blocks if present
  text = text.trim();

  // Remove ```json and ``` if present
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Parse JSON
  const queries = JSON.parse(text);

  // Validate the response
  if (!Array.isArray(queries) || queries.length !== 6) {
    throw new Error('AI did not return exactly 6 queries');
  }

  // Validate each query object
  queries.forEach((q, index) => {
    if (!q.query || !q.reason) {
      throw new Error(`Query ${index + 1} is missing 'query' or 'reason' field`);
    }
  });

  console.log('✅ Successfully generated 6 gift queries');
  return queries;
}

/**
 * Get fallback queries when AI service fails
 */
function getFallbackQueries() {
  return [
    {
      query: 'unique personalized gifts',
      reason: 'AI service temporarily unavailable. This is a generic search to help you get started.'
    },
    {
      query: 'best seller gifts',
      reason: 'Popular gift items that many people enjoy.'
    },
    {
      query: 'creative gift ideas',
      reason: 'Unique and creative options for any occasion.'
    },
    {
      query: 'handmade artisan gifts',
      reason: 'Handcrafted items with a personal touch.'
    },
    {
      query: 'premium gift sets',
      reason: 'Curated gift collections for special occasions.'
    },
    {
      query: 'experience gifts',
      reason: 'Memorable experiences and activities.'
    }
  ];
}

/**
 * Generate gift search queries and reasons using configured AI provider
 * @param {string} userDescription - Description of the person (e.g., "My dad who likes fishing")
 * @returns {Promise<Array>} Array of 3 objects with {query, reason}
 */
export async function generateGiftQueries(userDescription) {
  try {
    // Check if API is configured
    if (!isConfigured()) {
      throw new Error('API key not configured. Please set up your API key in settings.');
    }

    const config = getConfig();
    const { provider, apiKey, model } = config;

    console.log(`🔧 Using provider: ${provider}, model: ${model}`);

    let queries;

    if (provider === 'gemini') {
      queries = await generateWithGemini(userDescription, apiKey, model);
    } else if (provider === 'groq') {
      queries = await generateWithGroq(userDescription, apiKey, model);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return queries;

  } catch (error) {
    console.error('❌ AI Service Error:', error.message);

    // Return fallback queries if AI fails
    console.log('⚠️ Using fallback queries...');
    return getFallbackQueries();
  }
}
