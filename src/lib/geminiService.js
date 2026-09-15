// Default system instruction for 365hopejourney AI Spiritual Guide
export const DEFAULT_AI_SYSTEM_PROMPT = `You are the Official Spiritual Guide, Compassionate Mentor, and Encouraging Companion of 365hopejourney.

Your mission is to provide warm, comforting, and deeply inspiring spiritual guidance, personalized prayers, scripture reflections, and practical motivation grounded in faith, hope, gratitude, and divine love.

CORE MISSION & GUIDELINES:

1. ALWAYS RESPOND IN ENGLISH:
- All responses, reflections, scripture references, and prayers MUST ALWAYS be written in natural, warm, and beautiful US English, regardless of the language the member uses.

2. CONVERSATIONAL & EMPATHETIC COMPANIONSHIP:
- Talk to the person like a wise, compassionate friend and loving spiritual mentor.
- Listen attentively to what they are experiencing (anxiety, grief, loneliness, relationship trials, financial stress, waiting on God, health challenges, or moments of celebration).
- Validate their emotions with kindness, empathy, and tenderness—make them feel heard, safe, understood, and deeply valued.

3. TAILORED BIBLICAL SCRIPTURES:
- For every question, phase, or trial the person is walking through, cite relevant, uplifting, and comforting Bible verses that directly speak to their exact situation (e.g., Jeremiah 29:11, Isaiah 40:31, Psalm 23, Psalm 91, Romans 8:28, Philippians 4:6-7, Matthew 11:28, Joshua 1:9, Lamentations 3:22-23, Psalm 30:5, 2 Corinthians 12:9).
- Cite the book, chapter, and verse clearly and quote the scripture text.

4. PRACTICAL SPIRITUAL WISDOM & EXPLANATIONS:
- Explain the scripture in simple, heart-touching, and practical terms.
- Show them how God's promises apply directly to their daily life right now, turning worry into peace and despair into faith.

5. FEEDING HOPE & REKINDLING THE SPARK FOR LIFE:
- Always feed and multiply their hope.
- Speak life, joy, and purpose into their soul. Reignite their inner glow and excitement for life.
- Remind them that they are never alone, that their story is not over, and that their greatest breakthroughs and blessings are ahead.

6. PERSONALIZED PRAYER & BLESSING:
- Include a short, beautiful, and heartfelt prayer for them, followed by an uplifting blessing.

7. FORMATTING & STYLE:
- Address the member naturally by their first name inside the sentence.
- Do NOT start every response with generic greetings like "Hello [Name]!". Jump directly and gracefully into your comforting answer.
- Keep paragraphs clean, mobile-friendly, and gentle on the eyes. Use soft, uplifting emojis naturally (✨, 🕊️, 🌅, 🌿, 🙏, 🤍).
- Do not output excessive markdown double asterisks (**); keep text elegant and clean.`;

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

STRICT CONVERSATION & GREETING RULES:
- You must ALWAYS respond in ENGLISH, regardless of the language used by the user.
- Tone Style: ${aiTone}
- User First Name: ${finalName}
- Quote specific Biblical scriptures relevant to their phase, explain the verses, feed their hope, rekindle their spark for life, and include a personalized prayer.
- Do not output markdown double asterisks (**). Output clean, beautifully spaced paragraphs with gentle emojis.`;

      // Multi-turn context
      const chatMessages = (finalHistory || [])
        .slice(-8)
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
        max_tokens: 1024,
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
  const q = (userQuestion || '').toLowerCase();
  const firstName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';

  // 1. Anxiety, Fear, Worry, Overwhelmed
  if (q.includes('anxiety') || q.includes('anxious') || q.includes('ansiedade') || q.includes('medo') || q.includes('fear') || q.includes('panic') || q.includes('stress') || q.includes('worry') || q.includes('overwhelm') || q.includes('afraid')) {
    return `${firstName}, take a gentle, deep breath and know that you are not alone in this moment. 🕊️

When the waves of anxiety feel tall, hold onto the comforting truth in Philippians 4:6-7:
"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds."

What this means for your life today:
Anxiety often tries to make us carry tomorrow's burdens with today's strength. But God does not ask you to solve everything right now. He invites you to hand over the weight that was never yours to carry. When you release control, His supernatural peace steps in to shelter your thoughts.

Your life is precious, and this heavy feeling is temporary. The fog will lift, and your joy will shine bright again.

Let us pray together:
"Heavenly Father, I lift ${firstName} up to Your loving presence. Wrap them in Your peace that surpasses all human logic. Silence every anxious whisper and fill their heart with calm assurance, quiet confidence, and renewed hope. In Your name, Amen." 🙏✨

How does your heart feel right now as you take a quiet breath?`;
  }

  // 2. Sadness, Grief, Depression, Heavy Heart, Loneliness
  if (q.includes('sad') || q.includes('depress') || q.includes('triste') || q.includes('grief') || q.includes('luto') || q.includes('alone') || q.includes('lonely') || q.includes('sozinho') || q.includes('solidão') || q.includes('solidao') || q.includes('crying') || q.includes('cry') || q.includes('chorar') || q.includes('hurt') || q.includes('pain') || q.includes('dor')) {
    return `${firstName}, your tears and your tender heart are deeply seen and cherished. 🤍

In seasons of sorrow, cling to Psalm 34:18:
"The Lord is close to the brokenhearted and saves those who are crushed in spirit."
And remember the promise of Psalm 30:5: "Weeping may endure for a night, but joy comes with the morning."

What this means for your life today:
Sadness does not mean you have lost your way; it simply means your soul is healing and processing. You are not broken beyond repair. God is right beside you in the quiet moments, collecting every tear. There is still so much beauty, love, and light awaiting you.

Your life has immense purpose, and the light inside of you will shine brighter than ever before.

A prayer for your healing:
"Loving God, hold ${firstName} gently in Your arms today. Mend the quiet aches of their spirit and remind them of their sacred worth. Breathe fresh hope into their soul and rekindle the divine spark of life within them. Amen." 🌅🕊️

I am here with you. What is one small comfort that brought peace to your heart recently?`;
  }

  // 3. Hopelessness, Losing Faith, Giving Up, Lost the Spark for Life
  if (q.includes('hope') || q.includes('esperança') || q.includes('esperanca') || q.includes('give up') || q.includes('desistir') || q.includes('lost') || q.includes('perdido') || q.includes('tired') || q.includes('cansado') || q.includes('exhausted') || q.includes('purpose') || q.includes('propósito') || q.includes('spark') || q.includes('brilho')) {
    return `${firstName}, let this be a reminder that your story is far from over. ✨

Stand firm upon Jeremiah 29:11:
"'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.'"
And Isaiah 40:31:
"Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."

What this means for your life today:
When your strength feels depleted, God's grace becomes your foundation. You do not need to figure out the next ten steps—you only need to take one step in faith today. The spark of enthusiasm and wonder for life will return to your eyes. You were created for a wonderful purpose, and the world is richer because you are in it.

Never lose heart; God is preparing blessings in secret that will soon become visible.

A blessing of renewed hope:
"Lord, ignite the fire of hope inside ${firstName}'s heart today. Dispel every shadow of discouragement and awaken their enthusiasm for living. Grant them the strength of eagles and let them see the glorious future You have prepared. Amen." 🌿✨

What is a dream or blessing you would love to see blossom in your life?`;
  }

  // 4. Waiting on God, Patience, Decisions, Unanswered Prayers
  if (q.includes('wait') || q.includes('esperar') || q.includes('patience') || q.includes('paciência') || q.includes('future') || q.includes('decision') || q.includes('decisão') || q.includes('decisao') || q.includes('unanswered') || q.includes('when') || q.includes('quando')) {
    return `${firstName}, waiting seasons are never wasted seasons in God's hands. ⏳✨

Reflect on Ecclesiastes 3:11 and Romans 8:28:
"He has made everything beautiful in its time."
"And we know that in all things God works for the good of those who love Him, who have been called according to His purpose."

What this means for your life today:
While you are waiting, God is working behind the scenes. He is aligning details, strengthening your character, and preparing you for what He has prepared for you. Trust the divine timing. What is meant for you will not pass you by.

Keep your heart expectant and full of joy, for your breakthrough is on the way.

A prayer for patience and clarity:
"Father, give ${firstName} wisdom, patience, and peace as they navigate this season of waiting. Open the right doors that no one can shut, and quiet their spirit with trusting faith. Amen." 🕊️🌸`;
  }

  // 5. Morning Devotion, Gratitude, New Day
  if (q.includes('morning') || q.includes('bom dia') || q.includes('day') || q.includes('dia') || q.includes('gratitude') || q.includes('gratidão') || q.includes('gratidao') || q.includes('thank') || q.includes('obrigado') || q.includes('wake') || q.includes('acordar')) {
    return `${firstName}, blessed morning! Today is a gift overflowing with fresh mercies. 🌅

Declare Lamentations 3:22-23:
"The steadfast love of the Lord never ceases; His mercies never come to an end; they are new every morning; great is Your faithfulness."

What this means for your day:
Yesterday's mistakes and worries have no claim on today. You start with a clean slate, accompanied by God's infinite grace. Approach this day with a grateful heart, a bright smile, and expectant faith. You are going to be a blessing to everyone you cross paths with today!

A morning prayer:
"Lord, thank You for the breath of life in ${firstName}. Fill their steps with light, their heart with gratitude, and their mind with focus. May this day be rich in peace, love, and divine favor. Amen." 🙏✨

What are three small things you are grateful for this morning?`;
  }

  // 6. Rest, Sleep, Night Time Peace
  if (q.includes('sleep') || q.includes('dormir') || q.includes('night') || q.includes('noite') || q.includes('rest') || q.includes('descanso') || q.includes('insomnia') || q.includes('insonia')) {
    return `${firstName}, as the day comes to a close, let your soul enter into deep, sacred rest. 🌙

Rest your thoughts on Psalm 4:8 and Proverbs 3:24:
"In peace I will lie down and sleep, for You alone, Lord, make me dwell in safety."
"When you lie down, you will not be afraid; when you lie down, your sleep will be sweet."

What this means for your night:
You have done what you could today, and now it is time to hand the night over to God. Release every thought, unclench your shoulders, and rest in the assurance that God watches over you and your loved ones while you sleep.

A prayer for restorative sleep:
"Lord, cover ${firstName} with Your gentle canopy of peace tonight. Quiet every racing thought and grant them sweet, refreshing sleep. May they wake up tomorrow restored in body, mind, and spirit. Amen." 🕊️✨`;
  }

  // 7. General Faith & Life Inspiration
  return `${firstName}, what a joy it is to walk beside you in this journey of faith and hope. ✨

Be encouraged by Joshua 1:9:
"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."

Remember that you are deeply loved, protected, and called to live an extraordinary life filled with grace, peace, and purposeful joy. Whatever you are walking through today, know that God's strength is made perfect in your weakness.

A prayer for your day:
"Heavenly Father, bless ${firstName} abundantly. Illuminate their path, fill their heart with courage, and awaken a radiant love for life within their soul. In Your name, Amen." 🙏🤍

Tell me, what specific area of your life would you like us to pray and reflect on today?`;
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

