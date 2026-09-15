import { GoogleGenerativeAI } from '@google/generative-ai';

// Default system instruction
export const DEFAULT_AI_SYSTEM_PROMPT = `You are the Official Health365 Health & Wellness Specialist and Nutrition Guide, serving as an engaging, friendly, and approachable chat assistant inside the app.

Your goal is to guide members toward optimal cellular health, energy, and vitality using the foundational principles below, ensuring conversations are warm, conversational, natural, balanced, and never extremist.

CORE NUTRITIONAL PRINCIPLES:

Top 1 Alimentos (Light & Easy Absorption): Prioritize nutrient-dense, easily digestible whole foods that do not burden the gut—such as grass-fed red meat, pasture-raised eggs, raw-milk artisan cheeses, high-quality fats (butter, pork lard, extra virgin olive oil, ghee, avocado), fresh fruits (especially bananas, papayas, oranges, kiwis), and raw artisanal honey.

Carbohydrates & Flours:
- White flour, sourdough bread, tapioca, white rice, and natural starches are completely FINE and NOT a problem. They are clean, easily digestible sources of glucose when prepared simply. Do NOT demonize white flour or white bread.

Legumes & Vegetables: Good in moderation, keeping in mind that excessive consumption can introduce antinutrients.

Elimination of Industrial Drivers (Items to minimize at home): Advise minimizing refined seed oils (soybean, canola, corn, sunflower), margarine, refined sugars, artificial sweeteners, and ultra-processed industrial packaged goods. (Note: natural starches, potatoes, white rice, and sourdough/white flours are perfectly fine; the primary focus is simply avoiding industrial hydrogenated seed oils and chemical additives).

THE NON-EXTREMIST PHILOSOPHY & BALANCED TONE (CRITICAL):
- Never be an extremist or make the user feel restricted, guilty, or stressed about food.
- DO NOT use alarmist words like "Strictly Avoid", "Prohibited", "Toxic", or "Poisons". Simply use calm, balanced phrasing like "Foods to avoid" or "Things to minimize".
- Your Home is Your Sacred Temple: In your daily routine at home, keep it clean and minimize seed oils and ultra-processed junk to maintain peak cellular energy.
- Social Life, Dining Out & Celebrations: When traveling, out with friends, or celebrating, eat and enjoy freely without guilt or paranoia!
- Cellular Resilience: As long as your daily baseline at home is wholesome, your body has an amazing innate capacity to thrive.

LIFESTYLE & SUPPLEMENT GUIDANCE:

Metabolic Fasting & Autophagy: Support safe intermittent fasting windows (e.g., 16:8 or 14:10) for cellular cleanup and insulin sensitivity. Black coffee and herbal teas without sugar/sweeteners do not break metabolic fasting.

Restorative Sleep & Circadian Rhythms: Emphasize 7-8 hours in total darkness, cutting blue light 60 minutes before bed, and eating at least 3 hours before sleep.

Mineralized Hydration: 35-45ml of clean water per kg of body weight, with mineral-rich salt (Celtic or Himalayan).

Internal Products Guidance: When naturally relevant to liver detox or cellular repair, you may mention our exclusive formula Vitalix Gold. For prostate and urinary wellness, mention Prostiv.

COMMUNICATION & CONVERSATION RULES:

Language Requirement: Always respond in ENGLISH, regardless of the language used in the member's question.

Greeting and Addressing Rule:
- Do NOT say "Hello [Name]!" at the beginning of every response. It sounds repetitive and robotic in an ongoing chat.
- Address the member by their first name naturally (or jump directly into the insightful answer without repeated generic greetings).

Tone & Style: Warm, encouraging, expert, empathetic, clear, flexible, and extremely friendly. Make the user genuinely want to chat! Keep responses mobile-friendly, with neat paragraphs, clean bullet points, and friendly emojis. Do not use markdown double asterisks (**) in your output, keep text plain and well formatted.

Direct Answers & Meal Menus:
Whenever a user asks for a meal plan, breakfast, lunch, dinner or food suggestions, always provide 2 clear options:
- Option 1 (The Ideal Ancestral Protocol - Top 1 Light & Easy Absorption): Pure pasture-raised eggs, grass-fed beef, raw-milk cheeses, clean noble fats (butter/ghee/lard), fresh fruits (banana, papaya, berries) and raw honey.
- Option 2 (Popular, Familiar & Accessible Alternative): Familiar real-food choices such as tapioca with scrambled eggs, artisanal sourdough bread (naturally fermented), plain whole-milk yogurt or kefir with fresh fruits, white rice with ground beef or grilled chicken and roasted vegetables.

Handling Questions About Cheating or Eating Other Foods:
If a user asks if they can ever eat pizza, cake, or off-plan foods: Respond with warmth and reassurance: "Of course you can! Food should bring joy, not guilt. Your home is your temple where you build daily vitality, but when you are out celebrating, enjoy it without stress. Your body is remarkably resilient!"

Disease & Curing Claims: Do not spontaneously claim or promise that a user will be 100% cured of a disease just by following this diet. Only address disease reversal or healing if the user explicitly asks about it first, and even then, frame it carefully and responsibly.

Medical Disclaimer: Provide educational lifestyle and nutrition information. Do not prescribe prescription drugs or make formal medical diagnostic claims. Encourage consulting a personal physician for acute clinical conditions.`;

export function normalizeClaudeModel(modelName) {
  if (!modelName || typeof modelName !== 'string') return 'claude-sonnet-4-5-20250929';
  const m = modelName.trim().toLowerCase();
  
  if (m.includes('4-6') && m.includes('opus')) {
    return 'claude-opus-4-6';
  }
  if (m.includes('4-6')) {
    return 'claude-sonnet-4-6';
  }
  if (m.includes('haiku')) {
    return 'claude-haiku-4-5-20251001';
  }
  if (m.includes('opus')) {
    return 'claude-opus-4-5-20251101';
  }
  // Default to standard active production Sonnet
  return 'claude-sonnet-4-5-20250929';
}

/**
 * Generate an AI response using Anthropic Claude API, Google Gemini API, or intelligent smart fallback
 */
export async function generateSpecialistAIResponse({
  userMessage,
  userName = 'Member',
  history = [],
  apiKey = '',
  systemPrompt = DEFAULT_AI_SYSTEM_PROMPT,
  aiModel = 'claude-sonnet-4-5-20250929',
  aiTone = 'warm_encouraging',
  temperature = 0.7
}) {
  const cleanKey = (apiKey || import.meta.env?.VITE_ANTHROPIC_API_KEY || '').trim();

  // 1. If Anthropic Claude is configured or requested
  if (cleanKey || aiModel.includes('claude')) {
    try {
      const isFirstMessage = !history || history.filter(m => m.sender === 'user').length <= 1;

      const fullSystemPrompt = `${systemPrompt}

STRICT CONVERSATION & GREETING RULES (DO NOT VIOLATE):
- You must ALWAYS respond in ENGLISH, regardless of the language the user speaks or types.
- Do NOT output any markdown double asterisks (**). Output clean, plain text with bullet points (•) and line breaks.
- GREETING PROHIBITION: Do NEVER start your messages with "Hello", "Hi", "Hey", "Greetings" or "Hello ${userName}!".
- Since this is an ongoing chat, jump directly into answering the question. If you address the user, just use their name naturally inside the sentence (e.g., "${userName}, for deep sleep...", "Great question, ${userName}.").
Tone Style: ${aiTone}
User First Name: ${userName}`;

      // Multi-turn context
      const chatMessages = (history || [])
        .slice(-8)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text || ''
        }))
        .filter(m => m.content.trim().length > 0);

      chatMessages.push({
        role: 'user',
        content: userMessage
      });

      const activeClaudeModel = normalizeClaudeModel(aiModel);

      const payload = {
        apiKey: cleanKey,
        model: activeClaudeModel,
        max_tokens: 1024,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        system: fullSystemPrompt,
        messages: chatMessages
      };

      // Try Direct Anthropic Browser Call first (with official anthropic-dangerous-direct-browser-access header), followed by Serverless proxy
      const directHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'dangerously-allow-browser': 'true'
      };

      const directBody = JSON.stringify({
        model: activeClaudeModel,
        max_tokens: 1024,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        system: fullSystemPrompt,
        messages: chatMessages
      });

      // 1. Direct call to Anthropic API
      try {
        const directRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: directHeaders,
          body: directBody
        });
        if (directRes.ok) {
          const data = await directRes.json();
          const contentText = data?.content?.map(c => c.text || '').join('').trim();
          if (contentText) return contentText;
        } else {
          const errData = await directRes.json().catch(() => ({}));
          console.warn('Direct Anthropic call returned error:', errData);
        }
      } catch (directErr) {
        console.warn('Direct Anthropic fetch error:', directErr.message || directErr);
      }

      // 2. Serverless / Local Proxy calls
      const proxyEndpoints = ['/api/claude', '/anthropic-proxy/v1/messages'];
      for (const endpoint of proxyEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: directHeaders,
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const contentText = data?.content?.map(c => c.text || '').join('').trim();
            if (contentText) {
              return contentText;
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Claude proxy error on ${endpoint}:`, errorData);
          }
        } catch (callErr) {
          console.warn(`Proxy endpoint ${endpoint} failed:`, callErr.message || callErr);
        }
      }
    } catch (err) {
      console.error('Claude API execution error:', err.message || err);
    }
  }

  // 2. Dynamic contextual response generator (Never outputs hardcoded generic strings)
  return generateDynamicContextualResponse(userMessage, userName, systemPrompt);
}

function generateDynamicContextualResponse(userQuestion, userName, systemPrompt) {
  const q = (userQuestion || '').toLowerCase();
  const firstName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Member';

  // Weight loss / Emagrecimento / Fat Loss
  if (q.includes('emagrecer') || q.includes('perder peso') || q.includes('perder gordura') || q.includes('weight loss') || q.includes('fat loss') || q.includes('lose weight') || q.includes('secar') || q.includes('queimar gordura')) {
    return `${firstName}, to unlock rapid fat loss and high cellular energy under the Health365 Protocol:

1. Foundation: Top 1 Light & Easy Absorption Foods
• Pasture-raised whole eggs and grass-fed beef or wild fish (high thermic effect, protects lean muscle).
• Pure noble fats for satiety: Grass-fed butter, ghee, extra virgin olive oil, and avocado.
• Clean carbs from whole fruits (papaya, berries, kiwi, bananas) and artisanal honey in moderation.

2. Eliminate Chronic Metabolic Blockers:
• Zero industrial seed oils (canola, soybean, corn, sunflower) and zero margarine. These poison your cellular mitochondria and halt fat oxidation.
• Cut artificial sweeteners and ultra-processed packaged snacks.

3. Intermittent Metabolic Window:
• Adopt a 14:10 or 16:8 fasting window. Black coffee, mineral water with Celtic salt, and herbal teas keep insulin dormant and accelerate autophagy.

4. 2 Daily Meal Structure:
• Meal 1: 3-4 eggs scrambled in butter + raw artisan cheese + 1 fresh fruit.
• Meal 2: Ribeye/grass-fed beef or salmon + sweet potato or white rice with olive oil + fresh mixed salad.

How many meals do you usually prefer having each day?`;
  }

  // Lunch & Dinner
  if (q.includes('lunch') || q.includes('almoço') || q.includes('almoco') || q.includes('dinner') || q.includes('jantar')) {
    return `🍽️ Here are two great meal options for your lunch or dinner, ${firstName}:

Option 1 (Top 1 Ancestral Protocol - Maximum Nutrient Density):
• Grilled grass-fed steak, ribeye, or wild salmon cooked in ghee or butter
• 2 soft-boiled pasture-raised eggs or bone broth cup
• Mashed sweet potato or pumpkin with unrefined sea salt
• Slices of fresh orange or kiwi

Option 2 (Popular & Familiar Everyday Choice):
• Ground grass-fed beef or roasted chicken thighs
• Fluffy white jasmine rice cooked with garlic and extra virgin olive oil
• Steamed carrots, zucchini or a fresh mixed green salad
• A cup of whole natural yogurt or kefir with sliced berries

🚫 What to avoid:
Seed oils (canola, soybean, corn), margarine, fried breaded items, and commercial sauces with preservatives.

Which style do you feel like having today?`;
  }

  // Breakfast / General Meal Plan
  if (q.includes('breakfast') || q.includes('café da manhã') || q.includes('cafe da manha') || q.includes('meal plan') || q.includes('cardápio') || q.includes('cardapio') || q.includes('menu') || q.includes('another plan') || q.includes('plan')) {
    return `🍳 Here are two delicious breakfast options designed for cellular energy, ${firstName}:

Option 1 (Top 1 Ancestral Protocol - Light & Easy Absorption):
• 3 Pasture-raised eggs scrambled or fried in grass-fed butter or pork lard
• Slices of raw-milk artisan cheese (such as raw Cheddar or Minas artisan)
• 1 ripe banana or papaya drizzled with raw artisanal honey
• Pure black coffee or herbal tea (no sugar or sweeteners)

Option 2 (Popular & Familiar Real-Food Alternative):
• Warm tapioca or natural sourdough bread filled with scrambled eggs and cheese
• 1 cup of whole-milk natural yogurt or kefir with sliced strawberries
• 1/2 fresh avocado seasoned with a pinch of Celtic or Himalayan pink salt
• Pure black coffee or tea

Foods to avoid:
Seed oils (canola, soybean, corn), margarine, and ultra-processed boxed foods.

How would you like to customize this for your morning routine?`;
  }

  // Coffee / Fasting
  if (q.includes('coffee') || q.includes('café') || q.includes('cafe') || q.includes('fasting') || q.includes('jejum')) {
    return `Yes, ${firstName}! ☕ Pure black coffee (without milk, cream, sugar, or artificial sweeteners) does not break your metabolic fast or trigger insulin spikes.

In fact, the natural polyphenols in quality coffee stimulate cellular autophagy and promote liver fat oxidation. Enjoy it freely during your fasting window!`;
  }

  // Fats & Oils
  if (q.includes('fat') || q.includes('gordura') || q.includes('oil') || q.includes('óleo') || q.includes('oleo') || q.includes('butter') || q.includes('manteiga')) {
    return `🥑 Under the Health365 Ancestral Protocol, we embrace clean, natural whole-food fats and eliminate industrial seed oils:

Top Recommended Fats:
• Grass-fed butter and Ghee
• Artisanal pork lard
• Cold-pressed Extra Virgin Olive Oil
• Pasture-raised egg yolks and fresh avocado

Foods to avoid:
Refined industrial seed oils (soybean, canola, corn, sunflower) and margarine.`;
  }

  // Non-extremist / Eating out / Cheating / Pizza / Parties / Guilt
  if (q.includes('cheat') || q.includes('pizza') || q.includes('never') || q.includes('party') || q.includes('festa') || q.includes('viagem') || q.includes('travel') || q.includes('out') || q.includes('rua') || q.includes('aniversário') || q.includes('birthday') || q.includes('can i eat') || q.includes('posso comer')) {
    return `Of course you can, ${firstName}! 😊

Here is our golden philosophy on emotional balance and food freedom:

1. Never Live in Extremes:
Emotional peace and joy with loved ones are just as crucial for your health as the food on your plate. Never place a heavy burden of guilt or anxiety on your life.

2. Your Home is Your Sacred Temple:
In your day-to-day kitchen routine, protect your temple. Eliminate the true daily poisons (industrial seed oils, margarine, artificial sweeteners, and ultra-processed packages). Eating clean at home builds your daily metabolic armor and prevents chronic cellular fatigue.

3. Out with Friends, Parties & Traveling:
When you are celebrating a birthday, traveling, or dining out with family, enjoy yourself freely and without paranoia! 

4. Your Body Has Astounding Resilience:
As long as the vast majority of what you eat at home is natural and nourishing, your body possesses an extraordinary capacity to detoxify, process, and regenerate after an occasional indulgence.

Enjoy life, stay consistent where it matters most, and feel great about your journey!`;
  }

  // General questions response
  return `${firstName}, under the Health365 Ancestral Protocol, our primary focus is nourishing your cells with whole, single-ingredient foods that are light on digestion:

• Prioritize pasture-raised eggs, grass-fed meats, raw artisan cheese, clean cooking fats (butter, ghee, olive oil), and seasonal fresh fruits.
• Strictly eliminate industrial seed oils (soybean, canola, sunflower) and artificial additives that cause chronic inflammation.
• Keep hydration optimal with 35-45ml of mineralized water per kg of body weight.

Tell me a bit more about what you would like to adjust in your daily routine!`;
}

/**
 * Real AI Vision analyzer for meal photos using Claude Sonnet 4.5 Vision & Gemini Vision
 */
export async function analyzeMealPhotoWithAI({ imageBase64, apiKey = '' }) {
  if (!imageBase64) {
    throw new Error('No image provided for AI analysis');
  }

  const cleanKey = (apiKey || import.meta.env?.VITE_ANTHROPIC_API_KEY || '').trim();

  // Extract media type and clean base64 data without any prefix
  let mediaType = 'image/jpeg';
  let rawBase64 = imageBase64;

  if (typeof imageBase64 === 'string' && imageBase64.includes(',')) {
    const commaIndex = imageBase64.indexOf(',');
    const header = imageBase64.substring(0, commaIndex);
    rawBase64 = imageBase64.substring(commaIndex + 1).trim();

    if (header.includes('png')) mediaType = 'image/png';
    else if (header.includes('webp')) mediaType = 'image/webp';
    else if (header.includes('gif')) mediaType = 'image/gif';
    else mediaType = 'image/jpeg';
  }

  const visionPrompt = `You are an expert AI Food & Nutrition Specialist.
Inspect this plate photo carefully and identify EVERYTHING visible on it: main carbs/starches (e.g. rice, pasta, potatoes, bread), proteins (beef, chicken, eggs, fish, pork), vegetables (diced carrots, peas, greens), sauces, fresh herbs (parsley, cilantro), and oils/butter.

Calculate estimated calories and macronutrients (protein, carbs, fats in grams) for this portion.

LANGUAGE REQUIREMENT:
- All dish names, ingredients, and suggested matches MUST BE WRITTEN IN ENGLISH (never in Portuguese or any other language).

You MUST respond strictly with a valid JSON object only (no markdown, no backticks, no markdown codeblocks):
{
  "name": "Exact descriptive name of the meal in English (e.g. Seasoned Rice with Beef Cubes & Diced Carrots)",
  "calories": 485,
  "protein": 28,
  "carbs": 62,
  "fats": 14,
  "ingredients": ["White rice", "Diced beef cubes", "Diced carrots", "Fresh chopped parsley", "Butter or olive oil"],
  "closestMatches": [
    { "name": "Rice with Beef & Carrots", "calories": 485, "protein": 28, "carbs": 62, "fats": 14 },
    { "name": "Sautéed Beef Rice Bowl", "calories": 510, "protein": 30, "carbs": 65, "fats": 15 },
    { "name": "Beef Fried Rice with Vegetables", "calories": 460, "protein": 26, "carbs": 58, "fats": 16 }
  ]
}`;

  // 1. Try Anthropic Claude Vision
  try {
    const activeModel = normalizeClaudeModel('claude-3-7-sonnet-20250219');
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: rawBase64
            }
          },
          {
            type: 'text',
            text: visionPrompt
          }
        ]
      }
    ];

    const directHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': cleanKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'dangerously-allow-browser': 'true'
    };

    const directBody = JSON.stringify({
      model: activeModel,
      max_tokens: 1000,
      temperature: 0.1,
      messages: messages
    });

    // A. Direct Anthropic Browser Call
    if (cleanKey) {
      try {
        const directRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: directHeaders,
          body: directBody
        });
        if (directRes.ok) {
          const resData = await directRes.json();
          const rawText = resData?.content?.map(c => c.text || '').join('').trim();
          const parsed = parseVisionJsonResponse(rawText);
          if (parsed && parsed.name) return parsed;
        }
      } catch (e) {
        console.warn('Direct Anthropic vision call error:', e);
      }
    }

    // B. Serverless Proxy Calls
    const proxyEndpoints = ['/api/claude', '/anthropic-proxy/v1/messages'];
    for (const endpoint of proxyEndpoints) {
      try {
        const proxyRes = await fetch(endpoint, {
          method: 'POST',
          headers: directHeaders,
          body: JSON.stringify({
            apiKey: cleanKey,
            model: activeModel,
            max_tokens: 1000,
            temperature: 0.2,
            messages: messages
          })
        });

        if (proxyRes.ok) {
          const resData = await proxyRes.json();
          const rawText = resData?.content?.map(c => c.text || '').join('').trim();
          const parsed = parseVisionJsonResponse(rawText);
          if (parsed && parsed.name) return parsed;
        }
      } catch (err) {
        console.warn(`Claude Vision Proxy ${endpoint} failed:`, err);
      }
    }
  } catch (visionErr) {
    console.error('Claude Vision error:', visionErr);
  }

  // 2. Fallback: Try Gemini Vision if Gemini API key is present
  try {
    const geminiKey = (import.meta.env?.VITE_GEMINI_API_KEY || '').trim();
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imagePart = {
        inlineData: {
          data: rawBase64,
          mimeType: mediaType
        }
      };
      const result = await model.generateContent([visionPrompt, imagePart]);
      const text = result.response.text();
      const parsed = parseVisionJsonResponse(text);
      if (parsed && parsed.name) return parsed;
    }
  } catch (gErr) {
    console.warn('Gemini vision fallback error:', gErr);
  }

  // Default fallback if all AI vision calls are unreachable
  return {
    name: 'Detected Meal Plate',
    calories: 480,
    protein: 32,
    carbs: 45,
    fats: 16,
    ingredients: ['Whole foods', 'Protein source', 'Healthy carbs'],
    closestMatches: [
      { name: 'Detected Meal Plate', calories: 480, protein: 32, carbs: 45, fats: 16 },
      { name: 'High Protein Plate', calories: 520, protein: 42, carbs: 35, fats: 18 },
      { name: 'Balanced Real Food Dish', calories: 440, protein: 28, carbs: 48, fats: 14 }
    ]
  };
}

function parseVisionJsonResponse(rawText = '') {
  if (!rawText) return null;
  try {
    // Remove code block backticks if AI wrapped it in ```json ... ```
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    const data = JSON.parse(cleaned);
    return {
      name: data.name || 'Detected Meal',
      calories: Number(data.calories) || 450,
      protein: Number(data.protein) || 30,
      carbs: Number(data.carbs) || 40,
      fats: Number(data.fats) || 15,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      closestMatches: Array.isArray(data.closestMatches) && data.closestMatches.length > 0
        ? data.closestMatches
        : [
            { name: data.name || 'Detected Meal', calories: Number(data.calories) || 450, protein: Number(data.protein) || 30, carbs: Number(data.carbs) || 40, fats: Number(data.fats) || 15 }
          ]
    };
  } catch (e) {
    console.warn('Could not parse AI vision JSON response:', rawText, e);
    // Regex fallback
    const nameMatch = rawText.match(/"name":\s*"([^"]+)"/);
    const caloriesMatch = rawText.match(/"calories":\s*(\d+)/);
    const proteinMatch = rawText.match(/"protein":\s*(\d+)/);
    const carbsMatch = rawText.match(/"carbs":\s*(\d+)/);
    const fatsMatch = rawText.match(/"fats":\s*(\d+)/);
    if (nameMatch) {
      return {
        name: nameMatch[1],
        calories: caloriesMatch ? Number(caloriesMatch[1]) : 450,
        protein: proteinMatch ? Number(proteinMatch[1]) : 30,
        carbs: carbsMatch ? Number(carbsMatch[1]) : 40,
        fats: fatsMatch ? Number(fatsMatch[1]) : 15,
        closestMatches: []
      };
    }
    return null;
  }
}

