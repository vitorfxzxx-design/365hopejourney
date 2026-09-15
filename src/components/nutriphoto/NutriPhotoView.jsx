import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Image as ImageIcon, Flame, Sparkles, Plus, Trash2, CheckCircle2, Heart,
  Check, X, AlertTriangle, User, Scale, Ruler, Calendar, Activity, Target, Save, Tag, ShieldCheck
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import { analyzeMealPhotoWithAI } from '../../lib/geminiService';
import NutriPhotoSalesPage from './NutriPhotoSalesPage';

export default function NutriPhotoView() {
  const { currentUser, hasNutriPhotoAccess } = useEbooks();
  const [subTab, setSubTab] = useState('home'); // 'home' | 'tips' | 'profile'
  const [forcedUnlock, setForcedUnlock] = useState(false);
  const fileInputRef = useRef(null);

  const userEmail = currentUser?.email?.toLowerCase() || 'teste@gmail.com';
  const accessInfo = hasNutriPhotoAccess ? hasNutriPhotoAccess(userEmail) : { hasAccess: true };
  const hasAccess = forcedUnlock || accessInfo.hasAccess || currentUser?.role === 'admin';
  const profileStorageKey = `health365_nutri_profile_${userEmail}`;

  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey) || localStorage.getItem('health365_nutri_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      sex: 'female',
      weight: 70,
      height: 170,
      age: 30,
      activity: 'moderate',
      goal: 'lose'
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate target daily calories & macronutrients based on Mifflin-St Jeor equation
  const calculateTargets = (profile) => {
    const { sex = 'female', weight = 70, height = 170, age = 30, activity = 'moderate', goal = 'lose' } = profile;
    
    // BMR
    let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    if (sex === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725
    };
    const multiplier = activityMultipliers[activity] || 1.4;
    const tdee = bmr * multiplier;

    // Goal adjustment
    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = tdee * 0.80; // 20% deficit
    } else if (goal === 'gain') {
      targetCalories = tdee * 1.15; // 15% surplus
    }
    const finalCalories = Math.max(1200, Math.round(targetCalories));

    // Ancestral Health365 Macro ratios (30% Protein, 45% Healthy Fats, 25% Carbs)
    const targetProtein = Math.round((finalCalories * 0.30) / 4);
    const targetFats = Math.round((finalCalories * 0.45) / 9);
    const targetCarbs = Math.round((finalCalories * 0.25) / 4);

    return {
      calories: finalCalories,
      protein: targetProtein,
      fats: targetFats,
      carbs: targetCarbs
    };
  };

  const nutritionTargets = calculateTargets(profileData);

  // Exact America/Sao_Paulo (Horário de Brasília) timezone date calculator (resets every day at 23:59)
  const getSaoPauloDateKey = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [currentDayKey, setCurrentDayKey] = useState(getSaoPauloDateKey);

  // Check every 20 seconds for midnight 23:59 rollover in São Paulo time
  useEffect(() => {
    const interval = setInterval(() => {
      const nowSpKey = getSaoPauloDateKey();
      if (nowSpKey !== currentDayKey) {
        setCurrentDayKey(nowSpKey);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [currentDayKey]);

  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem(`health365_meals_${userEmail}`) || localStorage.getItem('health365_meals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [scannedMeal, setScannedMeal] = useState(null); // { image, name, calories, protein, carbs, fats, portion: 1, ingredients: [] }
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [mealSearchQuery, setMealSearchQuery] = useState('');

  // Comprehensive Food & Ancestral Meal Database (English)
  const FOOD_DATABASE = [
    { name: 'Seasoned Rice with Beef & Diced Carrots', calories: 485, protein: 28, carbs: 62, fats: 14 },
    { name: 'Penne Pasta with Sautéed Beef & Herbs', calories: 540, protein: 36, carbs: 58, fats: 16 },
    { name: 'Pasture-Raised Eggs with Avocado & Ghee', calories: 420, protein: 24, carbs: 6, fats: 34 },
    { name: 'Ancestral Grass-Fed Beef with Leafy Salad', calories: 580, protein: 46, carbs: 4, fats: 42 },
    { name: 'Wild-Caught Grilled Salmon with Asparagus', calories: 490, protein: 38, carbs: 10, fats: 32 },
    { name: 'Grilled Chicken Breast with Jasmine Rice & Greens', calories: 460, protein: 44, carbs: 42, fats: 10 },
    { name: 'Grass-Fed Ribeye Steak with Roasted Sweet Potato', calories: 650, protein: 52, carbs: 32, fats: 36 }
  ];

  const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name || '';
    e.target.value = '';

    const compressedBase64 = await compressImage(file);
    if (compressedBase64) {
      processMealImage(compressedBase64, fileName);
    }
  };

  const processMealImage = async (imageUrl, fileName = '') => {
    setAnalyzing(true);

    try {
      const detected = await analyzeMealPhotoWithAI({ imageBase64: imageUrl });
      
      const initialBase = {
        calories: Number(detected.calories) || 480,
        protein: Number(detected.protein) || 32,
        carbs: Number(detected.carbs) || 45,
        fats: Number(detected.fats) || 16
      };

      setScannedMeal({
        image: imageUrl,
        name: detected.name || 'Detected Dish',
        baseCalories: initialBase.calories,
        baseProtein: initialBase.protein,
        baseCarbs: initialBase.carbs,
        baseFats: initialBase.fats,
        calories: initialBase.calories,
        protein: initialBase.protein,
        carbs: initialBase.carbs,
        fats: initialBase.fats,
        ingredients: Array.isArray(detected.ingredients) && detected.ingredients.length > 0
          ? detected.ingredients
          : ['Main food item', 'Protein source', 'Healthy carbs', 'Herbs / Seasoning'],
        closestMatches: detected.closestMatches && detected.closestMatches.length > 0 ? detected.closestMatches : FOOD_DATABASE.slice(0, 4),
        portion: 1
      });
      setMealSearchQuery('');
      setScannerModalOpen(true);
    } catch (err) {
      console.error('Error scanning meal photo:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectSuggestedMeal = (mealItem) => {
    if (!scannedMeal) return;
    const factor = scannedMeal.portion || 1;
    const baseCals = Number(mealItem.calories) || 450;
    const baseProt = Number(mealItem.protein) || 30;
    const baseCarb = Number(mealItem.carbs) || 40;
    const baseFat = Number(mealItem.fats) || 15;

    setScannedMeal({
      ...scannedMeal,
      name: mealItem.name,
      baseCalories: baseCals,
      baseProtein: baseProt,
      baseCarbs: baseCarb,
      baseFats: baseFat,
      calories: Math.round(baseCals * factor),
      protein: Math.round(baseProt * factor),
      carbs: Math.round(baseCarb * factor),
      fats: Math.round(baseFat * factor)
    });
  };

  const handlePortionChange = (portionFactor) => {
    if (!scannedMeal) return;
    const factor = Number(portionFactor);
    const baseCals = scannedMeal.baseCalories || scannedMeal.calories;
    const baseProt = scannedMeal.baseProtein || scannedMeal.protein;
    const baseCarb = scannedMeal.baseCarbs || scannedMeal.carbs;
    const baseFat = scannedMeal.baseFats || scannedMeal.fats;

    setScannedMeal({
      ...scannedMeal,
      portion: factor,
      calories: Math.round(baseCals * factor),
      protein: Math.round(baseProt * factor),
      carbs: Math.round(baseCarb * factor),
      fats: Math.round(baseFat * factor)
    });
  };

  const handleConfirmLoggedMeal = () => {
    if (!scannedMeal) return;

    const todayDate = getSaoPauloDateKey();
    const newMeal = {
      id: 'meal-' + Date.now(),
      date: todayDate,
      image: scannedMeal.image,
      name: scannedMeal.name,
      ingredients: scannedMeal.ingredients || [],
      calories: Number(scannedMeal.calories) || 0,
      protein: Number(scannedMeal.protein) || 0,
      carbs: Number(scannedMeal.carbs) || 0,
      fats: Number(scannedMeal.fats) || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    localStorage.setItem(`health365_meals_${userEmail}`, JSON.stringify(updated));
    localStorage.setItem('health365_meals', JSON.stringify(updated));
    setScannerModalOpen(false);
    setScannedMeal(null);
  };

  const handleSimulatePreset = () => {
    const presetImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
    processMealImage(presetImg, 'eggs_avocado');
  };

  const handleDeleteMeal = (id) => {
    const updated = meals.filter(m => m.id !== id);
    setMeals(updated);
    localStorage.setItem(`health365_meals_${userEmail}`, JSON.stringify(updated));
    localStorage.setItem('health365_meals', JSON.stringify(updated));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem(profileStorageKey, JSON.stringify(profileData));
    localStorage.setItem('health365_nutri_profile', JSON.stringify(profileData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Extract clean first name
  const rawName = currentUser?.name || 'Sabrina';
  const firstName = rawName.split(/\s+/)[0] || 'Member';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  // Daily filter: only meals from today in São Paulo time (resets at 23:59) count towards calories & macros
  const todayMeals = (Array.isArray(meals) ? meals : []).filter(meal => {
    if (!meal.date) return true; // keep today's session meals
    return meal.date === currentDayKey;
  });

  // Defensive safe calculation of today's totals
  const totals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal?.calories) || 0),
      protein: acc.protein + (Number(meal?.protein) || 0),
      carbs: acc.carbs + (Number(meal?.carbs) || 0),
      fats: acc.fats + (Number(meal?.fats) || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const safeNutritionTargets = {
    calories: Number(nutritionTargets?.calories) || 2000,
    protein: Number(nutritionTargets?.protein) || 150,
    carbs: Number(nutritionTargets?.carbs) || 130,
    fats: Number(nutritionTargets?.fats) || 100
  };

  if (!hasAccess) {
    return (
      <NutriPhotoSalesPage
        onUnlockSuccess={(record) => {
          setForcedUnlock(true);
        }}
      />
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Greeting & Active Plan Indicator */}
      <div className="px-1 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
            Hello, {displayName}! <span className="text-xl">👋</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            AI Food Scanner & Specialist Macro Tracker
          </p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {accessInfo?.planType === 'annual'
              ? 'Annual Plan ($29.90)'
              : (accessInfo?.planType === 'monthly' ? 'Monthly Plan ($9.90)' : 'Active Plan')}
          </span>
        </div>
      </div>

      {/* Subtabs Bar matching images */}
      <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setSubTab('home')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            subTab === 'home'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setSubTab('tips')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            subTab === 'tips'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tips
        </button>
        <button
          onClick={() => setSubTab('profile')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            subTab === 'profile'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile
        </button>
      </div>

      {subTab === 'home' && (
        <>
          {/* Today - Calories Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                <span className="text-brand-500">🔥</span>
                <span>Today – Calories</span>
              </div>
              <span className="text-slate-400 text-xs font-medium">—</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {totals.calories}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ {safeNutritionTargets.calories} kcal</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totals.calories / Math.max(safeNutritionTargets.calories, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* Protein */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-center">
                <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs mb-1.5">
                  🥩
                </div>
                <span className="block text-[11px] text-slate-400 font-medium">Protein</span>
                <span className="block text-xs font-bold text-slate-800 mt-0.5">
                  {totals.protein}/{safeNutritionTargets.protein}g
                </span>
              </div>

              {/* Carbs */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-center">
                <div className="w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs mb-1.5">
                  🌾
                </div>
                <span className="block text-[11px] text-slate-400 font-medium">Carbs</span>
                <span className="block text-xs font-bold text-slate-800 mt-0.5">
                  {totals.carbs}/{safeNutritionTargets.carbs}g
                </span>
              </div>

              {/* Fats */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-center">
                <div className="w-6 h-6 mx-auto rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs mb-1.5">
                  💧
                </div>
                <span className="block text-[11px] text-slate-400 font-medium">Fats</span>
                <span className="block text-xs font-bold text-slate-800 mt-0.5">
                  {totals.fats}/{safeNutritionTargets.fats}g
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Camera size={16} />
              Take photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 bg-white hover:bg-slate-50 text-brand-600 border-2 border-brand-500 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ImageIcon size={16} />
              Gallery
            </button>
          </div>

          {analyzing && (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-center space-y-2 animate-pulse">
              <Sparkles size={20} className="text-brand-500 mx-auto animate-spin" />
              <p className="text-xs font-bold text-brand-800">Analyzing meal with NutriPhoto AI...</p>
            </div>
          )}

          {/* Recent Meals */}
          <div className="pt-2 px-1">
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              Recent meals
            </h3>

            {todayMeals.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="text-slate-400 mb-1">
                  <Camera size={32} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-xs text-slate-700">No meals logged today</h4>
                <p className="text-[11px] text-slate-400">
                  Take a photo of your meal to track your daily nutrition!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-3"
                  >
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{meal.name}</h4>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-[11px] font-bold text-brand-600 mt-0.5">
                        {meal.calories} kcal
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>G: {meal.fats}g</span>
                        <span>• {meal.time}</span>
                      </div>
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {meal.ingredients.slice(0, 4).map((ing, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                              ✓ {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TIPS SUBTAB - Exactly matching Screenshots 1 & 2 */}
      {subTab === 'tips' && (
        <div className="space-y-4 pb-6">
          {/* Philosophy Card */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1.5">
              <Heart size={15} className="text-emerald-600 fill-emerald-100" />
              <span>Philosophy</span>
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed font-normal">
              Inflammation caused by bad foods is the root of chronic pain and diseases. Natural and ancestral foods heal the body.
            </p>
          </div>

          {/* Good Foods (Allowed) Card */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-3xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Good foods (allowed)</span>
            </div>

            {/* Protein */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                🍎 Proteins
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Beef, pork, lamb, eggs, fish, seafood, chicken
              </p>
            </div>

            {/* Dairy */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                🍎 Dairy
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Raw milk cheeses, butter, whole milk
              </p>
            </div>

            {/* Fruits */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                🍎 Fruits
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Banana, papaya, orange, kiwi, all natural fruits
              </p>
            </div>

            {/* Allowed carbs */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                🍎 Allowed carbs
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                White rice, sweet potato, potato, cucumber, carrot, pumpkin
              </p>
            </div>

            {/* Good fats */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                🍎 Good fats
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Butter, lard, olive oil
              </p>
            </div>
          </div>

          {/* Bad Foods (Forbidden) Card */}
          <div className="bg-rose-50/40 border border-rose-200/80 rounded-3xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <X size={12} strokeWidth={3} />
              </div>
              <span>Bad foods (forbidden)</span>
            </div>

            {/* Top 5 worst */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                ⚠️ Top 5 worst
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Vegetable oil, powdered juice, soda, margarine, sausage
              </p>
            </div>

            {/* Ultra-processed */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                ⚠️ Ultra-processed
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Instant noodles, sugary cereals, chips, frozen pizza, ready-made seasonings
              </p>
            </div>

            {/* Hidden dangers */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-xs">
              <h4 className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                ⚠️ Hidden dangers
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                Brown rice, whole grain breads, nuts and seeds
              </p>
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="text-center pt-2">
            <p className="text-[11px] font-medium text-slate-400">
              Anti-inflammatory diet based on natural foods
            </p>
          </div>
        </div>
      )}

      {/* PROFILE SUBTAB - Exactly matching user requirements & images */}
      {subTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 pb-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs text-center space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">{displayName}'s Nutrition Goals</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Your daily calorie and macronutrient targets are calibrated to your ancestral nutrition plan and inflammation reduction goals.
            </p>
          </div>

          {/* Form Container */}
          <div className="space-y-4 px-1">
            {/* 1. Sex */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <span className="text-emerald-600">👤</span>
                <span>Sex</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProfileData(p => ({ ...p, sex: 'male' }))}
                  className={`py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    profileData.sex === 'male'
                      ? 'bg-blue-50/40 border-2 border-blue-500 text-slate-900 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl mb-0.5">👱‍♂️</span>
                  <span className="text-xs font-bold">Male</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileData(p => ({ ...p, sex: 'female' }))}
                  className={`py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    profileData.sex === 'female'
                      ? 'bg-blue-50/40 border-2 border-blue-500 text-slate-900 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl mb-0.5">👱‍♀️</span>
                  <span className="text-xs font-bold">Female</span>
                </button>
              </div>
            </div>

            {/* 2. Weight */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="text-emerald-600">⚖️</span>
                  <span>Weight: <strong className="text-slate-900 font-extrabold">{profileData.weight} kg</strong></span>
                </div>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="1"
                value={profileData.weight}
                onChange={(e) => setProfileData(p => ({ ...p, weight: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 3. Height */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="text-emerald-600">📎</span>
                  <span>Height: <strong className="text-slate-900 font-extrabold">{profileData.height} cm</strong></span>
                </div>
              </div>
              <input
                type="range"
                min="130"
                max="220"
                step="1"
                value={profileData.height}
                onChange={(e) => setProfileData(p => ({ ...p, height: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 4. Age */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="text-emerald-600">📅</span>
                  <span>Age: <strong className="text-slate-900 font-extrabold">{profileData.age} years</strong></span>
                </div>
              </div>
              <input
                type="range"
                min="16"
                max="90"
                step="1"
                value={profileData.age}
                onChange={(e) => setProfileData(p => ({ ...p, age: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 5. Activity */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <span className="text-emerald-600">📈</span>
                <span>Activity</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'sedentary', label: 'Sedentary' },
                  { key: 'light', label: 'Light' },
                  { key: 'moderate', label: 'Moderate' },
                  { key: 'intense', label: 'Intense' }
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => setProfileData(p => ({ ...p, activity: act.key }))}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      profileData.activity === act.key
                        ? 'bg-blue-50/50 border-2 border-blue-500 text-slate-900 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Goal */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <span className="text-emerald-600">🎯</span>
                <span>Goal</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'lose', label: 'Lose', emoji: '🔥' },
                  { key: 'maintain', label: 'Maintain', emoji: '⚖️' },
                  { key: 'gain', label: 'Gain', emoji: '💪' }
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setProfileData(p => ({ ...p, goal: g.key }))}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      profileData.goal === g.key
                        ? 'bg-blue-50/50 border-2 border-blue-500 text-slate-900 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Preview Pill */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-center">
              <span className="text-[11px] text-emerald-800 font-bold block">
                Calculated Target: {nutritionTargets.calories} kcal/day
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">
                P: {nutritionTargets.protein}g • C: {nutritionTargets.carbs}g • F: {nutritionTargets.fats}g
              </span>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#9ec87b] hover:bg-[#8eb86b] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <Save size={15} />
              <span>Save changes</span>
            </button>

            {savedSuccess && (
              <div className="bg-emerald-500 text-white text-center py-2.5 px-4 rounded-xl text-xs font-bold animate-fade-in shadow-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Profile & Nutrition targets saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      )}

      {/* AI Meal Confirmation & Customizer Modal */}
      {scannerModalOpen && scannedMeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                    🥗
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">AI Meal Recognition</h3>
                    <p className="text-[11px] text-emerald-100 font-medium">Verify dish & nutritional breakdown</p>
                  </div>
                </div>
                <button
                  onClick={() => setScannerModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-36">
                <img
                  src={scannedMeal.image}
                  alt="Scanned Meal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>AI Scanned</span>
                </div>
              </div>

              {/* Identified Dish Name & Edit Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detected Dish / Meal Name:
                </label>
                <input
                  type="text"
                  value={scannedMeal.name}
                  onChange={(e) => setScannedMeal({ ...scannedMeal, name: e.target.value })}
                  placeholder="e.g. Rigatoni Pasta with Sautéed Beef & Cherry Tomatoes"
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
                />
              </div>

              {/* Detected Ingredients Badges */}
              {scannedMeal.ingredients && scannedMeal.ingredients.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Tag size={11} className="text-emerald-600" />
                    <span>Detected Foods on Plate:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {scannedMeal.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-lg text-[11px] font-bold"
                      >
                        ✓ {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portion Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Portion Size:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '0.5x (Small)', factor: 0.5 },
                    { label: '1.0x (Normal)', factor: 1 },
                    { label: '1.5x (Large)', factor: 1.5 },
                    { label: '2.0x (Double)', factor: 2 }
                  ].map((p) => (
                    <button
                      key={p.factor}
                      type="button"
                      onClick={() => handlePortionChange(p.factor)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-xl border transition-all ${
                        scannedMeal.portion === p.factor
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Calories & Macros Display */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                    <Flame size={14} className="text-amber-500" />
                    <span>Total Energy:</span>
                  </span>
                  <span className="font-extrabold text-sm text-emerald-700">
                    {scannedMeal.calories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white rounded-xl p-2 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Protein</span>
                    <span className="text-xs font-bold text-slate-800">{scannedMeal.protein}g</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Carbs</span>
                    <span className="text-xs font-bold text-slate-800">{scannedMeal.carbs}g</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Fats</span>
                    <span className="text-xs font-bold text-slate-800">{scannedMeal.fats}g</span>
                  </div>
                </div>
              </div>

              {/* Quick Suggestions / Closest Matches */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Or select closest match:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {(scannedMeal.closestMatches && scannedMeal.closestMatches.length > 0 ? scannedMeal.closestMatches : FOOD_DATABASE.slice(0, 5)).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectSuggestedMeal(item)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        scannedMeal.name === item.name
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.name} ({item.calories} kcal)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScannerModalOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLoggedMeal}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 size={15} />
                <span>Log This Meal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
