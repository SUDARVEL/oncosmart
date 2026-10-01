/**
 * Clinical exercise descriptions (English and Tamil) from the cancer
 * exercise description documents. The same wording is used for every
 * cancer type. Language follows the app language.
 */

import { exerciseSlugFromId } from './phase2PlaceholderMedia';

export type ClinicalExerciseDescription = {
  en: string;
  ta: string;
};

export const CLINICAL_EXERCISE_DESCRIPTIONS: Record<string, ClinicalExerciseDescription> = {
  "diaphragmatic-breathing": {
    en: "Improves lung expansion and helps you breathe better. Sit upright on a chair with your shoulders relaxed. Place one hand on your chest and the other on your abdomen. Breathe slowly through your nose and feel your abdomen rise. Exhale gently through your mouth.",
    ta: "நுரையீரல் விரிவை அதிகரித்து சுவாசத்தை மேம்படுத்த உதவும். நாற்காலியில் நிமிர்ந்து அமர்ந்து, தோள்களை தளர்வாக வைத்திருக்கவும். ஒரு கையை மார்பிலும், மற்றொரு கையை வயிற்றிலும் வைக்கவும். மூக்கில் மெதுவாக சுவாசித்து வயிறு உயர்வதை உணரவும். வாயால் மெதுவாக சுவாசத்தை வெளியே விடவும்.",
  },
  "ankle-pumps": {
    en: "Improves blood circulation and prevents stiffness in the legs. Sit upright on the bed with your legs straight. Slowly move your feet up and down.",
    ta: "கால்களில் இரத்த ஓட்டத்தை மேம்படுத்தி, விறைப்பைத் தடுக்க உதவுகிறது. படுக்கையில் கால்களை நேராக வைத்து அமரவும். பாதங்களை மெதுவாக மேலும் கீழும் அசைக்கவும்.",
  },
  "thoracic-expansion": {
    en: "Improves chest expansion and lung capacity. Take a deep breath while expanding your chest. Hold for a few seconds and slowly breathe out.",
    ta: "மார்பு விரிவை அதிகரித்து நுரையீரல் செயல்பாட்டை மேம்படுத்தும். ஆழமாக சுவாசிக்கும்போது மார்பை விரிவாக்கவும். சில விநாடிகள் தங்கி மெதுவாக சுவாசத்தை வெளியே விடவும்.",
  },
  "chest-stretch": {
    en: "Improves flexibility of the chest muscles. Stand in a doorframe with your hands at shoulder height. Gently lean forward until you feel a stretch across the front of your chest.",
    ta: "மார்பு தசைகளின் நெகிழ்வுத்தன்மையை நீட்ட உதவும். வாசல் கட்டத்தில் நின்று, தோள்பட்டை உயரத்தில் கைகளை வைக்கவும். மெதுவாக உடலை முன்புறமாக சாய்த்து, மார்பின் முன்புறத்தில் இழுக்கும் உணர்வு ஏற்படும் வரை செய்யவும்.",
  },
  "arm-circles": {
    en: "Improves shoulder mobility and circulation. Lift your arms and slowly rotate them in circular motion.",
    ta: "தோள்பட்டை இயக்கத்தை மேம்படுத்தும். கைகளை உயர்த்தி வட்டமாக மெதுவாக சுழற்றவும்.",
  },
  "biceps-curls": {
    en: "Strengthens arm muscles. Bend your elbows and bring your hands toward your shoulders, then slowly lower.",
    ta: "கை தசைகளை பலப்படுத்தும். முழங்கைகளை மடக்கி கைகளை தோள்களுக்கு அருகே கொண்டு வந்து மெதுவாக கீழிறக்கவும்.",
  },
  "shoulder-shrugging": {
    en: "Relieves shoulder tension and improves mobility. Lift both shoulders towards your ears and slowly relax.",
    ta: "தோள்பட்டை இறுக்கத்தை குறைக்க உதவும். தோள்களை காதுகளுக்கு நோக்கி உயர்த்தி மீண்டும் தளர்த்தவும்.",
  },
  "wall-climbing-right": {
    en: "Improves shoulder mobility. Stand facing the wall with your right hand on the wall. Slowly slide your hand upward along the wall to a comfortable height. Then slowly return to the starting position.",
    ta: "தோளின் இயக்கத்தை மேம்படுத்த உதவும். சுவரை நோக்கி நின்று, வலது கையை சுவரில் வைக்கவும். மெதுவாக கையை சுவரில் மேல்நோக்கி நகர்த்தி, வசதியாக இருக்கும் உயரம் வரை கொண்டு செல்லவும். பின்னர் மெதுவாக கையை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "wall-climbing-left": {
    en: "Improves shoulder mobility. Stand facing the wall with your left hand on the wall. Slowly slide your hand upward along the wall to a comfortable height. Then slowly return to the starting position.",
    ta: "தோளின் இயக்கத்தை மேம்படுத்த உதவும். சுவரை நோக்கி நின்று, இடது கையை சுவரில் வைக்கவும். மெதுவாக கையை சுவரில் மேல்நோக்கி நகர்த்தி, வசதியாக இருக்கும் உயரம் வரை கொண்டு செல்லவும். பின்னர் மெதுவாக கையை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "wall-slides": {
    en: "Improves shoulder mobility. Stand with your back against the wall and your arms raised to shoulder height. Slowly slide your arms upward along the wall to a comfortable range. Then slide your arms back to the starting position.",
    ta: "தோள்பட்டை அசைவுத்திறனை மேம்படுத்த உதவும். முதுகை சுவரில் சாய்த்து நின்று, கைகளை தோள்பட்டை உயரத்தில் வைக்கவும். மெதுவாக கைகளை சுவரில் மேல்நோக்கி நகர்த்தி, வசதியான அளவு வரை உயர்த்தவும். பின்னர் கைகளை மெதுவாக ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "wall-pushup": {
    en: "Improves upper-body strength. Stand facing the wall with your hands at shoulder height. Slowly bend your elbows and lean toward the wall. Then gently push back to the starting position.",
    ta: "மேல் உடல் தசைகளின் வலிமையை மேம்படுத்த உதவும். சுவரை நோக்கி நின்று, கைகளை தோள்பட்டை உயரத்தில் சுவரில் வைக்கவும். மெதுவாக முழங்கைகளை மடக்கி, உடலை சுவரை நோக்கி சாய்க்கவும். பின்னர் மெதுவாக தள்ளி ஆரம்ப நிலைக்கு வரவும்.",
  },
  "triceps-stretch-right": {
    en: "Helps stretch the muscles at the back of the upper arm. Place your right arm behind your head and gently pull the right elbow with your left hand. Feel a stretch at the back of your right upper arm.",
    ta: "மேல் கையின் பின்புறத் தசைகளை நீட்ட உதவும். வலது கையை தலைக்கு பின்னால் வைத்து, இடது கையால் வலது முழங்கையை மெதுவாக இழுக்கவும். வலது மேல் கையின் பின்புறத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
  "triceps-stretch-left": {
    en: "Helps stretch the muscles at the back of the upper arm. Place your left arm behind your head and gently pull the left elbow with your right hand. Feel a stretch at the back of your left upper arm.",
    ta: "மேல் கையின் பின்புறத் தசைகளை நீட்ட உதவும். இடது கையை தலைக்கு பின்னால் வைத்து, வலது கையால் இடது முழங்கையை மெதுவாக இழுக்கவும். இடது மேல் கையின் பின்புறத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
  "spot-marching": {
    en: "Improves circulation and endurance. Stand straight and march in place by lifting knees alternately.",
    ta: "இரத்த ஓட்டத்தையும் சக்தியையும் மேம்படுத்தும். நேராக நின்று மாறி மாறி முழங்கால்களை உயர்த்தி இடத்தில் நடைபோடவும்.",
  },
  "neck-flexion-extension": {
    en: "Helps improve neck mobility and flexibility. Slowly move your chin toward your chest and return to the starting position. Then gently tilt your head backward to a comfortable range and return to the starting position.",
    ta: "கழுத்தின் இயக்கம் மற்றும் நெகிழ்வுத்தன்மையை மேம்படுத்த உதவும். மெதுவாக உங்கள் தாடையை மார்பை நோக்கி கீழே கொண்டு வந்து, ஆரம்ப நிலைக்கு திரும்பவும். அடுத்து, தலையை மெதுவாக பின்னால் சாய்த்து, வசதியான அளவு வரை கொண்டு சென்று, ஆரம்ப நிலைக்கு திரும்பவும்.",
  },
  "jaw-opening-closing": {
    en: "Helps improve jaw and mouth mobility. Stand upright and slowly open your mouth as wide as comfortable. Then gently close your mouth and return to the starting position.",
    ta: "தாடை மற்றும் வாயின் இயக்கத்தை மேம்படுத்த உதவும். நிமிர்ந்து நின்று, வசதியாக இருக்கும் அளவு வரை மெதுவாக வாயைத் திறக்கவும். பின்னர் மெதுவாக வாயை மூடி, ஆரம்ப நிலைக்கு திரும்பவும்.",
  },
  "jaw-side-to-side": {
    en: "Helps improve jaw mobility. Stand upright and slowly move your lower jaw to the left side as far as comfortable. Then move your lower jaw to the right side and return to the starting position.",
    ta: "தாடையின் இயக்கத்தை மேம்படுத்த உதவும். நிமிர்ந்து நின்று, கீழ் தாடையை வசதியாக இருக்கும் அளவு வரை மெதுவாக இடது பக்கமாக நகர்த்தவும். அடுத்து, கீழ் தாடையை வலது பக்கமாக நகர்த்தி, ஆரம்ப நிலைக்கு திரும்பவும்.",
  },
  "neck-stretch-left": {
    en: "Helps improve neck movement. Stand upright with your shoulders relaxed. Slowly tilt your head towards your right shoulder. Gently apply pressure with your right hand. You should feel a stretch along the left side of your neck.",
    ta: "கழுத்தின் இயக்கத்தை மேம்படுத்த உதவும். நிமிர்ந்து நின்று, தோள்களை தளர்வாக வைத்திருக்கவும். மெதுவாக தலையை வலது தோள்பக்கம் சாய்க்கவும். வலது கையால் மெதுவாக அழுத்தம் கொடுக்கவும். கழுத்தின் இடது பக்கத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
  "neck-stretch-right": {
    en: "Helps improve neck movement. Stand upright with your shoulders relaxed. Slowly tilt your head towards your left shoulder. Gently apply pressure with your left hand. You should feel a stretch along the right side of your neck.",
    ta: "கழுத்தின் இயக்கத்தை மேம்படுத்த உதவும். நிமிர்ந்து நின்று, தோள்களை தளர்வாக வைத்திருக்கவும். மெதுவாக தலையை இடது தோள்பக்கம் சாய்க்கவும். இடது கையால் மெதுவாக அழுத்தம் கொடுக்கவும். கழுத்தின் வலது பக்கத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
  "seated-knee-extension-right": {
    en: "Strengthens the thigh muscles and improves knee movement. Sit comfortably on a chair. Slowly straighten your right knee by lifting your lower leg upward. Then slowly lower it back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நாற்காலியில் வசதியாக அமரவும். வலது காலை மெதுவாக மேலே உயர்த்தி, முழங்காலை நேராக நீட்டவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "seated-knee-extension-left": {
    en: "Strengthens the thigh muscles and improves knee movement. Sit comfortably on a chair. Slowly straighten your left knee by lifting your lower leg upward. Then slowly lower it back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நாற்காலியில் வசதியாக அமரவும். இடது காலை மெதுவாக மேலே உயர்த்தி, முழங்காலை நேராக நீட்டவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "standing-hamstring-curls-right": {
    en: "Strengthens the back of the thigh and improves knee movement. Stand upright and hold the chair for support. Slowly bend your right knee toward your buttock as far as comfortable. Then slowly return your leg to the starting position.",
    ta: "தொடையின் பின்புறத் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். வலது முழங்காலை வசதியான அளவு வரை மெதுவாக மடக்கி, காலை பின்புறமாக உயர்த்தவும். பின்னர் மெதுவாக காலை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "standing-hamstring-curls-left": {
    en: "Strengthens the back of the thigh and improves knee movement. Stand upright and hold the chair for support. Slowly bend your left knee toward your buttock as far as comfortable. Then slowly return your leg to the starting position.",
    ta: "தொடையின் பின்புறத் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். இடது முழங்காலை வசதியான அளவு வரை மெதுவாக மடக்கி, காலை பின்புறமாக உயர்த்தவும். பின்னர் மெதுவாக காலை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "hamstring-stretch": {
    en: "Improves flexibility of the back of the thigh. Sit on the bed with your legs straight. Slowly lean forward and reach toward your toes. Feel a gentle stretch behind your thighs.",
    ta: "தொடையின் பின்புறத் தசைகளை நீட்ட உதவும். படுக்கையில் கால்களை நேராக வைத்து அமரவும். மெதுவாக முன்னால் சாய்ந்து, கால்விரல்களைத் தொட முயற்சிக்கவும். தொடையின் பின்புறத்தில் மெதுவாக இழுக்கும் உணர்வு இருக்கும்.",
  },
  "quadriceps-stretch-right": {
    en: "Improves flexibility of the front thigh muscles. Stand upright and hold the chair for support. Bend your right knee as far as comfortable and gently pull your foot toward your buttock to stretch the front of your thigh.",
    ta: "தொடையின் முன்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். வலது முழங்காலை வசதியான அளவு வரை மடக்கி, பாதத்தை மெதுவாக பின்புறமாக கொண்டு சென்று தொடையின் முன்புறத்தை நீட்டவும்.",
  },
  "quadriceps-stretch-left": {
    en: "Improves flexibility of the front thigh muscles. Stand upright and hold the chair for support. Bend your left knee as far as comfortable and gently pull your foot toward your buttock to stretch the front of your thigh.",
    ta: "தொடையின் முன்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். இடது முழங்காலை வசதியான அளவு வரை மடக்கி, பாதத்தை மெதுவாக பின்புறமாக கொண்டு சென்று தொடையின் முன்புறத்தை நீட்டவும்.",
  },
  "calf-raise": {
    en: "Strengthens the lower leg muscles and improves balance. Stand upright with your hands on the wall for support. Slowly lift your heels off the floor. Then slowly lower your heels back down.",
    ta: "கீழ் கால் தசைகளை வலுப்படுத்தி, சமநிலையை மேம்படுத்துகிறது. நிமிர்ந்து நின்று, ஆதரவாக கைகளை சுவரில் வைக்கவும். மெதுவாக குதிகால்களை தரையிலிருந்து உயர்த்தவும். பின்னர் மெதுவாக குதிகால்களை மீண்டும் தரையில் இறக்கவும்.",
  },
  "straight-leg-raise-right": {
    en: "Strengthens the thigh muscles and improves leg strength. Lie comfortably on your back on the bed. Keep your right knee straight and slowly lift your right leg as far as comfortable. Then slowly lower your leg back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, காலின் வலிமையை மேம்படுத்துகிறது. படுக்கையில் முதுகில் வசதியாக படுத்துக் கொள்ளவும். வலது காலை நேராக வைத்துக் கொண்டு, வசதியான அளவு வரை மெதுவாக மேலே உயர்த்தவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "straight-leg-raise-left": {
    en: "Strengthens the thigh muscles and improves leg strength. Lie comfortably on your back on the bed. Keep your left knee straight and slowly lift your left leg as far as comfortable. Then slowly lower your leg back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, காலின் வலிமையை மேம்படுத்துகிறது. படுக்கையில் முதுகில் வசதியாக படுத்துக் கொள்ளவும். இடது காலை நேராக வைத்துக் கொண்டு, வசதியான அளவு வரை மெதுவாக மேலே உயர்த்தவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "calf-stretch-right": {
    en: "Helps stretch the muscles at the back of the lower leg. Stand upright with your hands on the wall at shoulder height. Keep your right leg straight behind you with your heel on the floor. Gently lean forward until you feel a stretch in the back of your lower leg.",
    ta: "கீழ் காலின் பின்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, தோள்பட்டை உயரத்தில் கைகளை சுவரில் வைக்கவும். வலது காலை நேராக பின்னால் வைத்து, குதிகாலை தரையில் வைத்திருக்கவும். மெதுவாக முன்புறமாக சாய்ந்து, வலது கீழ் காலின் பின்புறத்தில் இழுக்கும் உணர்வு வரும் வரை செல்லவும்.",
  },
  "calf-stretch-left": {
    en: "Helps stretch the muscles at the back of the lower leg. Stand upright with your hands on the wall at shoulder height. Keep your left leg straight behind you with your heel on the floor. Gently lean forward until you feel a stretch in the back of your lower leg.",
    ta: "கீழ் காலின் பின்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, தோள்பட்டை உயரத்தில் கைகளை சுவரில் வைக்கவும். இடது காலை நேராக பின்னால் வைத்து, குதிகாலை தரையில் வைத்திருக்கவும். மெதுவாக முன்புறமாக சாய்ந்து, இடது கீழ் காலின் பின்புறத்தில் இழுக்கும் உணர்வு வரும் வரை செல்லவும்.",
  },
  "arm-rotation": {
    en: "Improves shoulder mobility and circulation. Lift your arms and slowly rotate them in circular motion.",
    ta: "தோள்பட்டை இயக்கத்தை மேம்படுத்தும். கைகளை உயர்த்தி வட்டமாக மெதுவாக சுழற்றவும்.",
  },
  "wall-climbing": {
    en: "Improves shoulder mobility. Stand facing the wall with your left hand on the wall. Slowly slide your hand upward along the wall to a comfortable height. Then slowly return to the starting position.",
    ta: "தோளின் இயக்கத்தை மேம்படுத்த உதவும். சுவரை நோக்கி நின்று, இடது கையை சுவரில் வைக்கவும். மெதுவாக கையை சுவரில் மேல்நோக்கி நகர்த்தி, வசதியாக இருக்கும் உயரம் வரை கொண்டு செல்லவும். பின்னர் மெதுவாக கையை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "triceps-stretch": {
    en: "Helps stretch the muscles at the back of the upper arm. Place your left arm behind your head and gently pull the left elbow with your right hand. Feel a stretch at the back of your left upper arm.",
    ta: "மேல் கையின் பின்புறத் தசைகளை நீட்ட உதவும். இடது கையை தலைக்கு பின்னால் வைத்து, வலது கையால் இடது முழங்கையை மெதுவாக இழுக்கவும். இடது மேல் கையின் பின்புறத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
  "seated-knee-extension": {
    en: "Strengthens the thigh muscles and improves knee movement. Sit comfortably on a chair. Slowly straighten your left knee by lifting your lower leg upward. Then slowly lower it back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நாற்காலியில் வசதியாக அமரவும். இடது காலை மெதுவாக மேலே உயர்த்தி, முழங்காலை நேராக நீட்டவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "standing-hamstring-curls": {
    en: "Strengthens the back of the thigh and improves knee movement. Stand upright and hold the chair for support. Slowly bend your left knee toward your buttock as far as comfortable. Then slowly return your leg to the starting position.",
    ta: "தொடையின் பின்புறத் தசைகளை வலுப்படுத்தி, முழங்கால் இயக்கத்தை மேம்படுத்துகிறது. நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். இடது முழங்காலை வசதியான அளவு வரை மெதுவாக மடக்கி, காலை பின்புறமாக உயர்த்தவும். பின்னர் மெதுவாக காலை ஆரம்ப நிலைக்கு கொண்டு வரவும்.",
  },
  "quadriceps-stretch": {
    en: "Improves flexibility of the front thigh muscles. Stand upright and hold the chair for support. Bend your left knee as far as comfortable and gently pull your foot toward your buttock to stretch the front of your thigh.",
    ta: "தொடையின் முன்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, ஆதரவாக நாற்காலியை பிடிக்கவும். இடது முழங்காலை வசதியான அளவு வரை மடக்கி, பாதத்தை மெதுவாக பின்புறமாக கொண்டு சென்று தொடையின் முன்புறத்தை நீட்டவும்.",
  },
  "straight-leg-raise": {
    en: "Strengthens the thigh muscles and improves leg strength. Lie comfortably on your back on the bed. Keep your left knee straight and slowly lift your left leg as far as comfortable. Then slowly lower your leg back down.",
    ta: "தொடையின் தசைகளை வலுப்படுத்தி, காலின் வலிமையை மேம்படுத்துகிறது. படுக்கையில் முதுகில் வசதியாக படுத்துக் கொள்ளவும். இடது காலை நேராக வைத்துக் கொண்டு, வசதியான அளவு வரை மெதுவாக மேலே உயர்த்தவும். பின்னர் மெதுவாக காலை கீழே இறக்கவும்.",
  },
  "calf-stretch": {
    en: "Helps stretch the muscles at the back of the lower leg. Stand upright with your hands on the wall at shoulder height. Keep your left leg straight behind you with your heel on the floor. Gently lean forward until you feel a stretch in the back of your lower leg.",
    ta: "கீழ் காலின் பின்புறத் தசைகளை நீட்ட உதவும். நிமிர்ந்து நின்று, தோள்பட்டை உயரத்தில் கைகளை சுவரில் வைக்கவும். இடது காலை நேராக பின்னால் வைத்து, குதிகாலை தரையில் வைத்திருக்கவும். மெதுவாக முன்புறமாக சாய்ந்து, இடது கீழ் காலின் பின்புறத்தில் இழுக்கும் உணர்வு வரும் வரை செல்லவும்.",
  },
  "neck-stretch": {
    en: "Helps improve neck movement. Stand upright with your shoulders relaxed. Slowly tilt your head towards your right shoulder. Gently apply pressure with your right hand. You should feel a stretch along the left side of your neck.",
    ta: "கழுத்தின் இயக்கத்தை மேம்படுத்த உதவும். நிமிர்ந்து நின்று, தோள்களை தளர்வாக வைத்திருக்கவும். மெதுவாக தலையை வலது தோள்பக்கம் சாய்க்கவும். வலது கையால் மெதுவாக அழுத்தம் கொடுக்கவும். கழுத்தின் இடது பக்கத்தில் இழுக்கும் உணர்வு இருக்கும்.",
  },
};

/**
 * Headings copied from the exercise documents. Tamil copy in those files
 * is the description only, so the heading stays the document heading.
 */
export const CLINICAL_EXERCISE_TITLES: Record<string, string> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing',
  'ankle-pumps': 'Ankle Pumps',
  'thoracic-expansion': 'Thoracic Expansion Exercise',
  'chest-stretch': 'Pectoralis Stretch',
  'arm-circles': 'Arm Circles',
  'arm-rotation': 'Arm Circles',
  'biceps-curls': 'Biceps Curls',
  'shoulder-shrugging': 'Shoulder Shrugging',
  'wall-climbing-right': 'Wall Climbing (Right)',
  'wall-climbing-left': 'Wall Climbing (Left)',
  'wall-slides': 'Wall Slides',
  'wall-pushup': 'Wall Push-up',
  'triceps-stretch-right': 'Triceps Stretch (Right)',
  'triceps-stretch-left': 'Triceps Stretch (Left)',
  'spot-marching': 'Spot Marching',
  'neck-flexion-extension': 'Neck Flexion and Extension',
  'jaw-opening-closing': 'Mouth Opening and Closing',
  'jaw-side-to-side': 'Jaw Side-to-Side',
  'neck-stretch-left': 'Neck Stretch (Left)',
  'neck-stretch-right': 'Neck Stretch (Right)',
  'seated-knee-extension-right': 'Knee Extension (Right)',
  'seated-knee-extension-left': 'Knee Extension (Left)',
  'standing-hamstring-curls-right': 'Hamstring Curls (Right)',
  'standing-hamstring-curls-left': 'Hamstring Curls (Left)',
  'hamstring-stretch': 'Hamstring Stretch',
  'quadriceps-stretch-right': 'Quadriceps Stretch (Right)',
  'quadriceps-stretch-left': 'Quadriceps Stretch (Left)',
  'calf-raise': 'Calf Raises',
  'straight-leg-raise-right': 'Straight Leg Raise (Right)',
  'straight-leg-raise-left': 'Straight Leg Raise (Left)',
  'calf-stretch-right': 'Calf Stretch (Right)',
  'calf-stretch-left': 'Calf Stretch (Left)',
};

export function getClinicalExerciseTitle(exerciseId: string): string | null {
  const slug = exerciseSlugFromId(exerciseId || '');
  return CLINICAL_EXERCISE_TITLES[slug] ?? null;
}

export function getClinicalExerciseDescription(
  exerciseId: string,
  language: string | null | undefined,
): string | null {
  const slug = exerciseSlugFromId(exerciseId || '');
  const lang =
    language === 'ta' || (language ?? '').toLowerCase().startsWith('ta')
      ? 'ta'
      : 'en';
  const direct = CLINICAL_EXERCISE_DESCRIPTIONS[slug];
  if (direct) return direct[lang];
  const base = slug.replace(/-(left|right)$/i, '');
  const fallback = CLINICAL_EXERCISE_DESCRIPTIONS[base];
  return fallback ? fallback[lang] : null;
}
