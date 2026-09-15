export const INITIAL_EBOOKS = [
  // SUPPLEMENTS
  {
    id: 'prod-sup-1',
    title: 'Vitalix Gold – Liver Healing',
    subtitle: 'Advanced supplement for liver regeneration and deep detox.',
    coverImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    category: 'Supplement',
    type: 'Main',
    releaseType: 'Manual',
    salesPageUrl: 'https://vitalixgold.com/offer',
    tag: 'Supplement',
    isActive: true,
    description: 'Exclusive formula with bioactive nutrients for deep liver cellular repair.',
    chapters: []
  },
  {
    id: 'prod-sup-2',
    title: 'Prostiv – Prostate Health',
    subtitle: 'Natural formula supporting prostate and urinary tract health.',
    coverImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80',
    category: 'Supplement',
    type: 'Main',
    releaseType: 'Manual',
    salesPageUrl: 'https://prostiv.com/offer',
    tag: 'Supplement',
    isActive: true,
    description: 'Essential micro-nutrients for prostate inflammation control and cell regulation.',
    chapters: []
  },

  // MODULES / CONTENTS
  {
    id: 'ebook-1',
    title: 'Ancestral Diet – Natural Cure',
    subtitle: 'Comfort Food for Real Health. Honest meals for your everyday life.',
    coverImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    category: 'Content',
    type: 'Main',
    releaseType: 'Immediate',
    salesPageUrl: 'https://health365.com/ancestral-diet',
    tag: 'Released',
    isActive: true,
    description: 'Discover the truth about ancestral nutrition and how it can transform your health and vitality forever.',
    chapters: [
      {
        id: 'ch-1-1',
        number: 1,
        title: 'Part 1 – Breaking Health Beliefs',
        subtitle: 'The Big Lie About Pain, Disease, and Aging',
        thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
        gammaUrl: 'https://gamma.app/embed/m6l78s28u7u8d00',
        status: 'released',
        isCompleted: true,
        previewContent: {
          headline: 'The Big Lie About Pain, Disease, and Aging',
          subheadline: 'Discover the truth that can transform your health and quality of life forever.',
          body: `What You Believe Is Wrong\n\nThe Lies We Are Told:\n• Pain is normal after 40\n• Genetics dictate 90% of your health\n• Medication is the only long-term solution\n\nThe Truth:\nYour body was designed to heal itself when given the appropriate ancestral fuel.`
        }
      },
      {
        id: 'ch-1-2',
        number: 2,
        title: 'Part 2 – Inflammation Begins in the Gut',
        subtitle: 'Restoring gut barrier and microbiome naturally',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'Inflammation Begins in the Gut',
          subheadline: 'How the gut-immune connection dictates whole-body inflammation.',
          body: `Understanding leaky gut, zonulin spikes, and how real ancestral fats calm internal chronic inflammation.`
        }
      },
      {
        id: 'ch-1-3',
        number: 3,
        title: 'Part 3 – The Biggest Poisons of Modern Nutrition',
        subtitle: 'Seed oils, refined sugars, and anti-nutrients',
        thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'The Modern Industrial Food Trap',
          subheadline: 'Eliminating the hidden triggers in grocery store foods.',
          body: `Industrial seed oils (canola, soybean, corn), high fructose corn syrup and processed emulsifiers.`
        }
      },
      {
        id: 'ch-1-4',
        number: 4,
        title: 'Part 4 – Ancient Nutrition for Healing Diseases',
        subtitle: 'Bioavailable proteins, animal fats, and micro-nutrients',
        thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'Fueling Your Cells',
          subheadline: 'Nutrient-dense foods that historical populations thrived on.',
          body: `Ruminant meats, organ meats, pasture-raised eggs, bone broth and mineral-rich salt.`
        }
      },
      {
        id: 'ch-1-5',
        number: 5,
        title: 'Part 5 – Simple Protocol for a Pain-Free Life',
        subtitle: 'Content not available',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'locked',
        isCompleted: false,
        previewContent: null
      },
      {
        id: 'ch-1-6',
        number: 6,
        title: 'Part 6 – AI Testing & Advanced Protocols',
        subtitle: 'Content not available',
        thumbnail: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'locked',
        isCompleted: false,
        previewContent: null
      }
    ]
  },
  {
    id: 'ebook-2',
    title: 'Ancestral Menu',
    subtitle: 'Delicious, nourishing and anti-inflammatory weekly recipes.',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    category: 'Content',
    type: 'Main',
    releaseType: 'Immediate',
    salesPageUrl: 'https://health365.com/menu',
    tag: 'Released',
    isActive: true,
    description: 'Complete anti-inflammatory meal plans designed for easy daily preparation.',
    chapters: [
      {
        id: 'ch-2-1',
        number: 1,
        title: 'Module 1 – High-Energy Breakfasts',
        subtitle: 'Gluten-free, sugar-free stable energy meals',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: true,
        previewContent: {
          headline: 'Start Your Day with Stable Energy',
          subheadline: 'Pasture-raised eggs, avocado, grass-fed butter, and clean coffee.',
          body: 'Learn how to break your fast without triggering insulin spikes.'
        }
      },
      {
        id: 'ch-2-2',
        number: 2,
        title: 'Module 2 – Quick 15-Minute Lunches',
        subtitle: 'Flavorful meals for busy daily schedules',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'Practical and Nutrient-Dense Lunch',
          subheadline: 'One-pan and one-skillet preparations in minutes.',
          body: 'How to build meals rich in highly bioavailable protein and essential minerals.'
        }
      }
    ]
  },
  {
    id: 'ebook-3',
    title: 'Protocol – The End of Chronic Pain',
    subtitle: 'Step by step recovery blueprint for joint and muscular inflammation.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    category: 'Content',
    type: 'Main',
    releaseType: 'Immediate',
    salesPageUrl: 'https://health365.com/chronic-pain',
    tag: 'Released',
    isActive: true,
    description: 'Clinical protocol for joint regeneration and systemic chronic inflammation relief.',
    chapters: [
      {
        id: 'ch-3-1',
        number: 1,
        title: 'Part 1 – Systemic De-inflammation',
        subtitle: 'The first 7 days of the protocol',
        thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'Phase 1: The Inflammatory Reset',
          subheadline: 'Eliminate acute triggers in the first 48 hours.',
          body: 'Electrolyte hydration, seed oil elimination, and liver detoxification support.'
        }
      }
    ]
  },
  {
    id: 'ebook-4',
    title: 'Protocol – Diabetes Control',
    subtitle: 'Reversing insulin resistance and controlling blood glucose naturally.',
    coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    category: 'Content',
    type: 'Main',
    releaseType: 'Immediate',
    salesPageUrl: 'https://health365.com/diabetes',
    tag: 'Released',
    isActive: true,
    description: 'Master insulin sensitivity and blood glucose with strategic ancestral nutrition.',
    chapters: [
      {
        id: 'ch-4-1',
        number: 1,
        title: 'Part 1 – The Key to Insulin Sensitivity',
        subtitle: 'Understanding cellular response to carbohydrates',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=300&q=80',
        gammaUrl: '',
        status: 'released',
        isCompleted: false,
        previewContent: {
          headline: 'Master Insulin',
          subheadline: 'Lower blood sugar spikes without hunger or restrictive starvation.',
          body: 'Food sequence strategies, post-meal walks, and gentle intermittent fasting.'
        }
      }
    ]
  }
];

export const INITIAL_FEED = [
  {
    id: 'feed-1',
    title: '🌿 Welcome to Health365 🌿',
    subtitle: 'A new chapter in your life starts here.',
    content: `Health365 is not just an app.
It's a space to open your mind, step outside the bubble of an industry that profits from illness, and learn how to take care of your body in a natural, conscious, and consistent way.

Here you will find:
📘 Practical and educational eBooks
🥗 Content about natural nutrition
🌱 Natural supplements to support your body
👥 An active community with real people and real results

The idea is simple:
to stop merely treating symptoms and start giving your body what it truly needs to function better—with smarter and more consistent habits.

📩 Pay attention to the newsletters sent to your email.
There you will receive:
• Important announcements
• Weekly updates
• Exclusive content`,
    date: '15/03/2026',
    status: 'Active'
  }
];
