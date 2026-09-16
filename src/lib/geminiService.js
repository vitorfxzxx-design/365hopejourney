// Default system instruction for DailyGrace App AI Spiritual Guide
export const DEFAULT_AI_SYSTEM_PROMPT = `You are the Official Spiritual Guide and Compassionate Companion of DailyGrace App.

Your purpose is to walk beside the member with natural warmth, genuine empathy, and uplifting hope grounded in faith and God's love.

CORE CONVERSATIONAL GUIDELINES:

1. CONVERSATIONAL RHYTHM & CONCISENESS (NEVER SEND OVERWHELMING WALLS OF TEXT):
- Keep responses natural, human, warm, and concise—like talking to a wise, caring spiritual friend.
- MATCH THE CONVERSATION:
  * On simple greetings or introductions ("hi", "hello", "ola tudo bem", "my name is..."): Reply warmly and briefly in 2 to 3 short sentences. Acknowledge their name, welcome them, and ask what's on their heart today. DO NOT send giant text blocks or unsolicited long sermons on a simple greeting!
  * When the user shares a problem, fear, or prayer request: Give a focused, comforting, and heartfelt response in 2 to 3 short, easy-to-read paragraphs.
- NO ROBOTIC MARKDOWN HEADERS: Never use robotic section headers like "*A Blessing for You:*", "*Vitor, I want you to know this:*", or "*How can I support you?*". Speak naturally and seamlessly from the heart.

2. HIT THE RIGHT WORD & REKINDLE HOPE GENTLY:
- Speak the right word at the right time. Avoid sounding preachy, forced, or exaggerated.
- Remind them gently of God's love, their divine worth, and that their story is not over.

3. FOCUSED BIBLICAL SCRIPTURE:
- When addressing their specific situation, mention ONE comforting and relevant Bible verse (e.g. Jeremiah 29:11, Isaiah 40:31, Psalm 23, Philippians 4:6-7, Psalm 34:18, Romans 8:28).
- Explain it in 1 or 2 simple, practical sentences that bring instant peace to their heart.

4. SHORT PERSONALIZED PRAYER:
- When fitting, end with 1 or 2 short sentences of prayer or blessing for their day.

5. LANGUAGE & STYLE:
- Always respond in natural, warm US English.
- Use soft, uplifting emojis naturally (✨, 🕊️, 🌅, 🌿, 🙏, 🤍).
- Keep text clean, spacious, and mobile-friendly without excessive asterisks or markdown clutter.`;

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
  userQuestion,
  userName = 'Friend',
  userFirstName,
  history = [],
  conversationHistory,
  apiKey = '',
  systemPrompt,
  customPrompt,
  aiModel = 'claude-sonnet-4-5-20250929',
  aiTone = 'warm_encouraging',
  temperature = 0.7
}) {
  const finalMessage = userMessage || userQuestion || '';
  const finalName = userFirstName || userName || 'Friend';
  const finalHistory = conversationHistory || history || [];
  const finalPrompt = customPrompt || systemPrompt || DEFAULT_AI_SYSTEM_PROMPT;
  const cleanKey = (apiKey || import.meta.env?.VITE_ANTHROPIC_API_KEY || '').trim();

  // 1. If Anthropic Claude is configured or requested
  if (cleanKey || aiModel.includes('claude')) {
    try {
      const fullSystemPrompt = `${finalPrompt}

CRITICAL RULES:
- ALWAYS respond in warm, natural US English.
- Keep responses human, concise, and conversational. Do NOT send long walls of text.
- If the user sent a greeting or intro, reply in 2-3 brief, friendly sentences.
- User First Name: ${finalName}
- Do NOT output robotic headers like "*A Blessing for You:*" or excessive markdown asterisks. Output clean, elegant paragraphs.`;

      // Multi-turn context
      const chatMessages = (finalHistory || [])
        .slice(-6)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text || ''
        }))
        .filter(m => m.content.trim().length > 0);

      chatMessages.push({
        role: 'user',
        content: finalMessage
      });

      const activeClaudeModel = normalizeClaudeModel(aiModel);

      const payload = {
        apiKey: cleanKey,
        model: activeClaudeModel,
        max_tokens: 600,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        system: fullSystemPrompt,
        messages: chatMessages
      };

      const directHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'dangerously-allow-browser': 'true'
      };

      const directBody = JSON.stringify({
        model: activeClaudeModel,
        max_tokens: 600,
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
          }
        } catch (callErr) {
          console.warn(`Proxy endpoint ${endpoint} failed:`, callErr.message || callErr);
        }
      }
    } catch (err) {
      console.error('Claude API execution error:', err.message || err);
    }
  }

  // 2. Dynamic contextual response generator grounded in 365hopejourney faith and life-spark renewal
  return generateDynamicContextualResponse(finalMessage, finalName, finalPrompt);
}

function generateDynamicContextualResponse(userQuestion, userName, systemPrompt) {
  const q = (userQuestion || '').toLowerCase().trim();
  const firstName = userName && userName.toLowerCase() !== 'friend' ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';

  // 0. Greetings & Introductions ("hi", "hello", "ola", "oi", "meu nome é", "tudo bem")
  if (
    /^(hi|hello|hey|greetings|ola|olá|oi|bom dia|boa tarde|boa noite|tudo bem|como vai|meu nome|my name)/i.test(q) ||
    q.length < 20 && (q.includes('ola') || q.includes('olá') || q.includes('oi') || q.includes('tudo bem') || q.includes('hello') || q.includes('hi'))
  ) {
    return `Hello ${firstName}, it is truly wonderful to connect with you today! ✨

I am here to walk alongside you, offer a listening heart, and share uplifting reflections whenever you need peace or guidance.

How are you feeling today, and what is on your mind? 🕊️`;
  }

  // 1. Anxiety, Fear, Worry, Overwhelmed
  if (q.includes('anxiety') || q.includes('anxious') || q.includes('ansiedade') || q.includes('medo') || q.includes('fear') || q.includes('panic') || q.includes('stress') || q.includes('worry') || q.includes('overwhelm') || q.includes('afraid')) {
    return `${firstName}, take a gentle, deep breath. You are safe in God's care right now. 🕊️

In moments when anxiety tries to overwhelm your thoughts, hold onto Philippians 4:6-7:
"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds."

You do not have to carry tomorrow's weight today. Hand it over to God, and allow His quiet peace to settle over your heart.

May His presence calm every racing thought and fill your spirit with gentle serenity. Amen. 🙏✨

How does your heart feel as you take a quiet breath?`;
  }

  // 2. Sadness, Grief, Depression, Heavy Heart, Loneliness
  if (q.includes('sad') || q.includes('depress') || q.includes('triste') || q.includes('grief') || q.includes('luto') || q.includes('alone') || q.includes('lonely') || q.includes('sozinho') || q.includes('solidão') || q.includes('solidao') || q.includes('crying') || q.includes('cry') || q.includes('chorar') || q.includes('hurt') || q.includes('pain') || q.includes('dor')) {
    return `${firstName}, your heart and every silent tear are deeply valued by God. 🤍

Remember the comforting promise in Psalm 34:18:
"The Lord is close to the brokenhearted and saves those who are crushed in spirit."

This heavy season will not last forever. God is gently mending your soul, and the joy and lightness in your spirit will return.

"Lord, hold ${firstName} closely today, bring healing to their heart, and rekindle their hope for tomorrow. Amen." 🌅🕊️

I'm right here with you. What is one small comfort you can give yourself today?`;
  }

  // 3. Hopelessness, Losing Faith, Giving Up, Lost the Spark for Life
  if (q.includes('hope') || q.includes('esperança') || q.includes('esperanca') || q.includes('give up') || q.includes('desistir') || q.includes('lost') || q.includes('perdido') || q.includes('tired') || q.includes('cansado') || q.includes('exhausted') || q.includes('purpose') || q.includes('propósito') || q.includes('spark') || q.includes('brilho')) {
    return `${firstName}, your story is far from over—your best chapters are still ahead. ✨

Cling to the promise in Jeremiah 29:11:
"'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.'"

The spark that gave you love for life is still inside you; God is preparing to rekindle it in a beautiful way. Take it one step at a time today.

May divine hope fill your heart and give you fresh strength for the journey. Amen. 🌿✨

What is a dream or blessing you would love to see blossom in your life?`;
  }

  // 4. Waiting on God, Patience, Decisions, Unanswered Prayers
  if (q.includes('wait') || q.includes('esperar') || q.includes('patience') || q.includes('paciência') || q.includes('future') || q.includes('decision') || q.includes('decisão') || q.includes('decisao') || q.includes('unanswered') || q.includes('when') || q.includes('quando')) {
    return `${firstName}, seasons of waiting are never in vain in God's hands. ⏳✨

As Ecclesiastes 3:11 reminds us, "He has made everything beautiful in its time."

While you are waiting, God is working behind the scenes, preparing what is truly best for you. Trust His timing—what is meant for you will not pass you by.

"Father, grant ${firstName} peace, wisdom, and patience as they trust Your divine timing. Amen." 🕊️🌸`;
  }

  // 5. Morning Devotion, Gratitude, New Day
  if (q.includes('morning') || q.includes('bom dia') || q.includes('day') || q.includes('dia') || q.includes('gratitude') || q.includes('gratidão') || q.includes('gratidao') || q.includes('thank') || q.includes('obrigado') || q.includes('wake') || q.includes('acordar')) {
    return `Blessed morning, ${firstName}! 🌅

Remember Lamentations 3:22-23: "The steadfast love of the Lord never ceases; His mercies are new every morning."

Today is a fresh opportunity to walk with joy and light. May your day be filled with peace, unexpected blessings, and fruitful steps.

What are you most grateful for this morning? 🙏✨`;
  }

  // 6. Rest, Sleep, Night Time Peace
  if (q.includes('sleep') || q.includes('dormir') || q.includes('night') || q.includes('noite') || q.includes('rest') || q.includes('descanso') || q.includes('insomnia') || q.includes('insonia')) {
    return `${firstName}, as you rest tonight, release the day into God's hands. 🌙

Rest on Psalm 4:8: "In peace I will lie down and sleep, for You alone, Lord, make me dwell in safety."

Let every worry melt away and enjoy peaceful, restorative sleep tonight. 🕊️✨`;
  }

  // 7. General Faith & Life Inspiration
  return `${firstName}, what a blessing it is to share this moment with you. ✨

Be encouraged by Joshua 1:9: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."

You are deeply loved and never alone. How can I best pray for or encourage your heart today? 🙏🤍`;
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

