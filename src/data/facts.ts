export interface Fact {
  id: number;
  text: string;
  emoji: string;
  category: CategoryId;
}

export type CategoryId = 'space' | 'nature' | 'animals' | 'vehicles' | 'airplanes' | 'ships';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  gradient: string;
  lightBg: string;
}

export const categories: Category[] = [
  { id: 'space', name: 'חלל', emoji: '🚀', gradient: 'from-purple-500 to-indigo-600', lightBg: 'bg-purple-50' },
  { id: 'nature', name: 'טבע', emoji: '🌿', gradient: 'from-emerald-500 to-green-600', lightBg: 'bg-emerald-50' },
  { id: 'animals', name: 'חיות', emoji: '🐾', gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50' },
  { id: 'vehicles', name: 'כלי רכב', emoji: '🚗', gradient: 'from-blue-500 to-cyan-600', lightBg: 'bg-blue-50' },
  { id: 'airplanes', name: 'מטוסים', emoji: '✈️', gradient: 'from-sky-500 to-blue-600', lightBg: 'bg-sky-50' },
  { id: 'ships', name: 'ספינות', emoji: '🚢', gradient: 'from-teal-500 to-emerald-600', lightBg: 'bg-teal-50' },
];

export const facts: Fact[] = [
  // === חלל (Space) - 25 facts ===
  { id: 1, text: 'השמש כל כך גדולה שאפשר להכניס לתוכה מיליון כדורי ארץ!', emoji: '☀️', category: 'space' },
  { id: 2, text: 'יום אחד על כוכב נוגה (ונוס) ארוך יותר משנה שלמה שם!', emoji: '🌍', category: 'space' },
  { id: 3, text: 'בחלל אף אחד לא יכול לשמוע אותך צועק, כי אין שם אוויר להעביר צלילים.', emoji: '🤫', category: 'space' },
  { id: 4, text: 'טביעת הרגל של ניל ארמסטרונג על הירח עדיין שם - אין רוח שתמחק אותה!', emoji: '👣', category: 'space' },
  { id: 5, text: 'כוכב נויטרונים כל כך צפוף שכפית אחת ממנו שוקלת כמו הר!', emoji: '⭐', category: 'space' },
  { id: 6, text: 'על צדק (יופיטר) יש סערה ענקית שנקראת הכתם האדום הגדול, והיא גדולה פי שלוש מכדור הארץ!', emoji: '🔴', category: 'space' },
  { id: 7, text: 'החליפה של אסטרונאוט עולה כ-12 מיליון דולר!', emoji: '🧑‍🚀', category: 'space' },
  { id: 8, text: 'על שבתאי (סטורן) יורד גשם של יהלומים!', emoji: '💎', category: 'space' },
  { id: 9, text: 'האור מהשמש לוקח 8 דקות להגיע אלינו לכדור הארץ.', emoji: '💡', category: 'space' },
  { id: 10, text: 'יש יותר כוכבים ביקום מגרגרי חול בכל חופי כדור הארץ!', emoji: '✨', category: 'space' },
  { id: 11, text: 'הירח מתרחק מכדור הארץ כ-3.8 סנטימטר בכל שנה.', emoji: '🌙', category: 'space' },
  { id: 12, text: 'שנה אחת על מאדים אורכת 687 ימי ארץ.', emoji: '🔭', category: 'space' },
  { id: 13, text: 'הר האולימפוס על מאדים הוא הר הגעש הגבוה ביותר במערכת השמש - פי שלושה מהאוורסט!', emoji: '🌋', category: 'space' },
  { id: 14, text: 'תחנת החלל הבינלאומית נעה במהירות של 28,000 קמ"ש ומקיפה את כדור הארץ כל 90 דקות!', emoji: '🛸', category: 'space' },
  { id: 15, text: 'כוכב הלכת הקר ביותר הוא אורנוס, עם טמפרטורה של מינוס 224 מעלות!', emoji: '🥶', category: 'space' },
  { id: 16, text: 'הטבעות של שבתאי עשויות בעיקר מקרח ואבנים.', emoji: '💍', category: 'space' },
  { id: 17, text: 'גודלו של היקום כל כך עצום שהאור צריך 93 מיליארד שנים כדי לחצות אותו!', emoji: '🌌', category: 'space' },
  { id: 18, text: 'נפטון הוא כוכב הלכת הרחוק ביותר מהשמש - לוקח לו 165 שנה להקיף אותה!', emoji: '🪐', category: 'space' },
  { id: 19, text: 'ביקום יש יותר כוכבי לכת מכוכבים - כל כוכב יכול להיות מוקף בכוכבי לכת!', emoji: '🌟', category: 'space' },
  { id: 20, text: 'שביל החלב, הגלקסיה שלנו, מכילה בין 100 ל-400 מיליארד כוכבים!', emoji: '🌠', category: 'space' },
  { id: 21, text: 'חור שחור כל כך חזק שאפילו אור לא יכול לברוח ממנו!', emoji: '🕳️', category: 'space' },
  { id: 22, text: 'האסטרונאוטים גדלים בכ-5 סנטימטר בחלל כי אין כבידה שדוחסת את עמוד השדרה!', emoji: '📏', category: 'space' },
  { id: 23, text: 'על כוכב הלכת HD 189733b יורד גשם של זכוכית - הצידה, במהירות 7,000 קמ"ש!', emoji: '🌧️', category: 'space' },
  { id: 24, text: 'הכלבה לייקה הייתה בעל החיים הראשון שהגיע לחלל, בשנת 1957.', emoji: '🐕', category: 'space' },
  { id: 25, text: 'שקיעה על מאדים נראית בצבע כחול!', emoji: '🌅', category: 'space' },

  // === טבע (Nature) - 25 facts ===
  { id: 26, text: 'ברק יכול לחמם את האוויר סביבו ל-30,000 מעלות - חם פי 5 מפני השמש!', emoji: '⚡', category: 'nature' },
  { id: 27, text: 'דבש לא מתקלקל לעולם! מצאו דבש בקברים מצריים בן 3,000 שנה והוא עדיין טוב!', emoji: '🍯', category: 'nature' },
  { id: 28, text: 'עצי הסקויה הם העצים הגבוהים בעולם ויכולים להגיע לגובה של 115 מטר!', emoji: '🌲', category: 'nature' },
  { id: 29, text: 'בננות מכילות קרינה רדיואקטיבית טבעית, אבל צריך לאכול 10 מיליון בננות בבת אחת כדי שזה יהיה מסוכן!', emoji: '🍌', category: 'nature' },
  { id: 30, text: 'יש יותר עצים על כדור הארץ מכוכבים בשביל החלב!', emoji: '🌳', category: 'nature' },
  { id: 31, text: 'האוקיינוס מכסה יותר מ-70% מפני כדור הארץ, ואנחנו חקרנו רק 5% ממנו!', emoji: '🌊', category: 'nature' },
  { id: 32, text: 'פתית שלג אחד מורכב מכ-200 גבישי קרח קטנים!', emoji: '❄️', category: 'nature' },
  { id: 33, text: 'הנהר הארוך ביותר בעולם הוא הנילוס - 6,650 קילומטר!', emoji: '🏞️', category: 'nature' },
  { id: 34, text: 'בשנה נופלים על כדור הארץ כ-100 טון אבק קוסמי מהחלל!', emoji: '🌍', category: 'nature' },
  { id: 35, text: 'קשת בענן נוצרת כשאור השמש עובר דרך טיפות גשם - היא בעצם עיגול שלם, אבל אנחנו רואים רק חצי!', emoji: '🌈', category: 'nature' },
  { id: 36, text: 'הר האוורסט גדל כ-4 מילימטר בכל שנה!', emoji: '🏔️', category: 'nature' },
  { id: 37, text: 'המדבר הגדול ביותר בעולם הוא אנטארקטיקה - כי מדבר מוגדר לפי כמות המשקעים, לא החום!', emoji: '🏜️', category: 'nature' },
  { id: 38, text: 'עלה של צמח ויקטוריה אמזוניקה יכול לשאת משקל של ילד קטן!', emoji: '🍃', category: 'nature' },
  { id: 39, text: 'יש פטריות שזוהרות בחושך! הן נקראות פטריות ביו-לומינסנטיות.', emoji: '🍄', category: 'nature' },
  { id: 40, text: 'טיפה אחת של מים מהאוקיינוס מכילה מיליוני חיידקים זעירים!', emoji: '💧', category: 'nature' },
  { id: 41, text: 'הוולקנו הפעיל ביותר בעולם הוא קילאואה בהוואי - הוא מתפרץ כמעט ברציפות!', emoji: '🌋', category: 'nature' },
  { id: 42, text: 'העץ הזקן ביותר בעולם הוא אורן זחלני בשם מתושלח, בן כ-5,000 שנה!', emoji: '🌴', category: 'nature' },
  { id: 43, text: 'שורשי עצים יכולים לפצח סלעים ומדרכות בכוח הגדילה שלהם!', emoji: '💪', category: 'nature' },
  { id: 44, text: 'המפל הגבוה ביותר בעולם הוא מפלי אנחל בוונצואלה - 979 מטר!', emoji: '🏞️', category: 'nature' },
  { id: 45, text: 'צמח החמניה תמיד פונה לכיוון השמש - התופעה נקראת הליוטרופיזם.', emoji: '🌻', category: 'nature' },
  { id: 46, text: 'ים המלח הוא הנקודה הנמוכה ביותר על פני כדור הארץ - 430 מטר מתחת לפני הים!', emoji: '🏊', category: 'nature' },
  { id: 47, text: 'ענני סופה יכולים להגיע לגובה של 20 קילומטר - גבוה יותר מטיסת מטוס נוסעים!', emoji: '⛈️', category: 'nature' },
  { id: 48, text: 'האדמה מתחת לרגלינו זורמת לאט כמו נוזל - הלוחות הטקטוניים זזים כ-2-5 ס"מ בשנה!', emoji: '🌏', category: 'nature' },
  { id: 49, text: 'יהלומים נוצרים עמוק באדמה תחת לחץ וחום עצומים - לוקח מיליארדי שנים!', emoji: '💎', category: 'nature' },
  { id: 50, text: 'הזוהר הצפוני נוצר כשחלקיקים מהשמש פוגשים את האטמוספרה של כדור הארץ!', emoji: '🌌', category: 'nature' },

  // === חיות (Animals) - 25 facts ===
  { id: 51, text: 'תמנון יש שלושה לבבות ודם כחול!', emoji: '🐙', category: 'animals' },
  { id: 52, text: 'פרפר טועם עם הרגליים!', emoji: '🦋', category: 'animals' },
  { id: 53, text: 'דולפינים ישנים עם עין אחת פתוחה - חצי מוח ער וחצי ישן!', emoji: '🐬', category: 'animals' },
  { id: 54, text: 'לג\'ירפה ולאדם יש אותו מספר חוליות צוואר - שבע!', emoji: '🦒', category: 'animals' },
  { id: 55, text: 'חתולים ישנים כ-70% מחייהם. חתול בן 9 שנים היה ער רק 3 שנים!', emoji: '🐱', category: 'animals' },
  { id: 56, text: 'קבוצת פלמינגו נקראת "להבה" (flamboyance)!', emoji: '🦩', category: 'animals' },
  { id: 57, text: 'קואלות ישנות עד 22 שעות ביום!', emoji: '🐨', category: 'animals' },
  { id: 58, text: 'לשון הזיקית יכולה להיות ארוכה פי שניים מגופה!', emoji: '🦎', category: 'animals' },
  { id: 59, text: 'פילים הם היונקים היחידים שלא יכולים לקפוץ!', emoji: '🐘', category: 'animals' },
  { id: 60, text: 'לנמלים אין ריאות - הן נושמות דרך חורים זעירים בגוף שלהן!', emoji: '🐜', category: 'animals' },
  { id: 61, text: 'עיניים של יען גדולות מהמוח שלו!', emoji: '🪶', category: 'animals' },
  { id: 62, text: 'כלב הרחה שלו חזק פי 100,000 מהריח של בן אדם!', emoji: '🐕', category: 'animals' },
  { id: 63, text: 'סוס ים זכר הוא זה שמביא את התינוקות לעולם, לא הנקבה!', emoji: '🦈', category: 'animals' },
  { id: 64, text: 'פרת משה רבנו יכולה לאכול עד 5,000 חרקים ביום!', emoji: '🐞', category: 'animals' },
  { id: 65, text: 'הלב של לוויתן כחול גדול כמו מכונית קטנה ושוקל כ-680 קילו!', emoji: '🐋', category: 'animals' },
  { id: 66, text: 'טיגריס הוא החתול הגדול ביותר בעולם ויכול לשקול עד 300 קילו!', emoji: '🐯', category: 'animals' },
  { id: 67, text: 'ינשופים לא יכולים להזיז את העיניים - לכן הם מסובבים את הראש עד 270 מעלות!', emoji: '🦉', category: 'animals' },
  { id: 68, text: 'אצבעות של קואלה דומות מאוד לטביעות אצבע של בני אדם!', emoji: '🔍', category: 'animals' },
  { id: 69, text: 'דבורים יכולות לזהות פנים של בני אדם!', emoji: '🐝', category: 'animals' },
  { id: 70, text: 'כריש לא יכול לעצור - הוא חייב לשחות כל הזמן כדי לנשום!', emoji: '🦈', category: 'animals' },
  { id: 71, text: 'לעכביש אין שרירים ברגליים - הוא משתמש בלחץ דם כדי לזוז!', emoji: '🕷️', category: 'animals' },
  { id: 72, text: 'פפגאי אפור אפריקני יכול ללמוד יותר מ-1,000 מילים!', emoji: '🦜', category: 'animals' },
  { id: 73, text: 'חילזון יכול לישון עד 3 שנים ברציפות!', emoji: '🐌', category: 'animals' },
  { id: 74, text: 'פנדה אוכלת בממוצע 12-38 קילו במבוק ביום!', emoji: '🐼', category: 'animals' },
  { id: 75, text: 'צפרדעי חץ מורעלות כל כך שנגיעה אחת יכולה להרוג 10 אנשים!', emoji: '🐸', category: 'animals' },

  // === כלי רכב (Vehicles) - 25 facts ===
  { id: 76, text: 'המכונית הראשונה בעולם נבנתה ב-1886 על ידי קרל בנץ ונסעה במהירות 16 קמ"ש!', emoji: '🚗', category: 'vehicles' },
  { id: 77, text: 'מכונית פורמולה 1 יכולה לנסוע הפוך על התקרה - הכוח האווירודינמי מחזיק אותה!', emoji: '🏎️', category: 'vehicles' },
  { id: 78, text: 'אוטובוס קומתיים אדום הוא הסמל של לונדון מאז 1956!', emoji: '🚌', category: 'vehicles' },
  { id: 79, text: 'הרכבת המהירה ביותר בעולם היא מגלב ביפן - 603 קמ"ש!', emoji: '🚄', category: 'vehicles' },
  { id: 80, text: 'גלגלי לגו הם יצרן הגלגלים הגדול ביותר בעולם - מייצרים יותר מכל חברת רכב!', emoji: '🧱', category: 'vehicles' },
  { id: 81, text: 'המכונית הכי מהירה בעולם הגיעה ל-1,228 קמ"ש - כמעט מהירות הקול!', emoji: '💨', category: 'vehicles' },
  { id: 82, text: 'אופנוע הומצא ב-1885, שנה לפני המכונית הראשונה!', emoji: '🏍️', category: 'vehicles' },
  { id: 83, text: 'לונדון היא העיר הראשונה שהייתה בה רכבת תחתית - מאז 1863!', emoji: '🚇', category: 'vehicles' },
  { id: 84, text: 'מונית בניו יורק עוברת בממוצע 115,000 קילומטר בשנה!', emoji: '🚕', category: 'vehicles' },
  { id: 85, text: 'מכונית טסלה שוגרה לחלל ב-2018 על גבי טיל של SpaceX!', emoji: '🚀', category: 'vehicles' },
  { id: 86, text: 'הרכב הראשון על הירח היה רובר שנסע עם אפולו 15 ב-1971!', emoji: '🌙', category: 'vehicles' },
  { id: 87, text: 'טרקטור יכול למשוך משקל של יותר מ-10 טון!', emoji: '🚜', category: 'vehicles' },
  { id: 88, text: 'בממוצע, מכונית מורכבת מכ-30,000 חלקים שונים!', emoji: '🔧', category: 'vehicles' },
  { id: 89, text: 'ביפן יש רכבת שמגיעה תמיד בזמן - איחור ממוצע של 18 שניות בלבד!', emoji: '⏰', category: 'vehicles' },
  { id: 90, text: 'אופניים הומצאו ב-1817 ובהתחלה לא היו להם דוושות!', emoji: '🚲', category: 'vehicles' },
  { id: 91, text: 'משאית המכרות הגדולה ביותר יכולה לשאת 450 טון - כמו 300 מכוניות!', emoji: '🚛', category: 'vehicles' },
  { id: 92, text: 'רמזור התנועה הראשון הוצב בלונדון ב-1868 - לפני שהמציאו מכוניות!', emoji: '🚦', category: 'vehicles' },
  { id: 93, text: 'מכונית חשמלית הומצאה לפני מכונית בנזין - כבר ב-1832!', emoji: '🔋', category: 'vehicles' },
  { id: 94, text: 'מרוץ 24 השעות של לה מאן הוא המרוץ הארוך ביותר - נהגים מתחלפים בזמן שהמכונית בתנועה!', emoji: '🏁', category: 'vehicles' },
  { id: 95, text: 'קרוואן הומצא בשנת 1880 והיה נגרר על ידי סוסים!', emoji: '🏕️', category: 'vehicles' },
  { id: 96, text: 'ברוב המדינות, מכבת אש אדומה כי אדום הוא הצבע הכי בולט ביום!', emoji: '🚒', category: 'vehicles' },
  { id: 97, text: 'המהירות המרבית של רכב גולף חשמלי היא כ-40 קמ"ש!', emoji: '⛳', category: 'vehicles' },
  { id: 98, text: 'הרכבל הארוך ביותר בעולם נמצא בוייטנאם - 5.8 קילומטר!', emoji: '🚡', category: 'vehicles' },
  { id: 99, text: 'מכונית ממוצעת מבלה 95% מהזמן שלה חונה!', emoji: '🅿️', category: 'vehicles' },
  { id: 100, text: 'הצוללת הראשונה נבנתה ב-1620 ויכלה לצלול ל-5 מטר עומק!', emoji: '🤿', category: 'vehicles' },

  // === מטוסים (Airplanes) - 25 facts ===
  { id: 101, text: 'האחים רייט ביצעו את הטיסה הראשונה ב-1903 - היא נמשכה רק 12 שניות!', emoji: '✈️', category: 'airplanes' },
  { id: 102, text: 'מטוס בואינג 747 מכיל מספיק דלק כדי למלא 3,500 אמבטיות!', emoji: '🛢️', category: 'airplanes' },
  { id: 103, text: 'הקופסה השחורה במטוס היא בעצם כתומה - כדי שיהיה קל למצוא אותה!', emoji: '📦', category: 'airplanes' },
  { id: 104, text: 'חלונות המטוס עגולים כי חלונות מרובעים עלולים לגרום לסדקים מלחץ האוויר!', emoji: '🪟', category: 'airplanes' },
  { id: 105, text: 'טייס ומטייס משנה אוכלים ארוחות שונות - למקרה שאחד מהם יקבל הרעלת מזון!', emoji: '🍽️', category: 'airplanes' },
  { id: 106, text: 'מטוס נוסעים טס בגובה של כ-10,000 מטר - גבוה יותר מהר האוורסט!', emoji: '🏔️', category: 'airplanes' },
  { id: 107, text: 'הקונקורד היה מטוס שטס מהר יותר ממהירות הקול - מלונדון לניו יורק ב-3 שעות!', emoji: '💨', category: 'airplanes' },
  { id: 108, text: 'כנפי מטוס גמישות - הן יכולות להתכופף עד 3 מטר בטיסה!', emoji: '🦅', category: 'airplanes' },
  { id: 109, text: 'בכל רגע נתון יש כחצי מיליון אנשים באוויר על מטוסים!', emoji: '🌐', category: 'airplanes' },
  { id: 110, text: 'מסלול ההמראה הארוך ביותר בעולם נמצא בסין - 5.5 קילומטר!', emoji: '🛫', category: 'airplanes' },
  { id: 111, text: 'המהירות הממוצעת של מטוס נוסעים היא 900 קמ"ש!', emoji: '⚡', category: 'airplanes' },
  { id: 112, text: 'במטוס, אוכל טעים פחות כי חוש הטעם שלנו יורד ב-30% בגלל הגובה!', emoji: '🍕', category: 'airplanes' },
  { id: 113, text: 'מטוס A380 של איירבוס הוא המטוס הגדול ביותר ויכול להכיל עד 853 נוסעים!', emoji: '🛩️', category: 'airplanes' },
  { id: 114, text: 'אמליה ארהרט הייתה האישה הראשונה שטסה לבד מעבר לאוקיינוס האטלנטי ב-1932!', emoji: '👩‍✈️', category: 'airplanes' },
  { id: 115, text: 'מסוק יכול לטוס קדימה, אחורה, הצידה, ואפילו לרחף במקום!', emoji: '🚁', category: 'airplanes' },
  { id: 116, text: 'המטוס הקטן ביותר בעולם, Bumble Bee II, אורכו רק 2.7 מטר!', emoji: '🐝', category: 'airplanes' },
  { id: 117, text: 'בזמן טיסה ארוכה, מטוס שורף כ-12,000 ליטר דלק בשעה!', emoji: '⛽', category: 'airplanes' },
  { id: 118, text: 'הפסים הלבנים שמטוסים משאירים בשמיים נקראים "קונטריילס" ועשויים מקרח!', emoji: '☁️', category: 'airplanes' },
  { id: 119, text: 'ווילבר רייט אמר פעם ש"האדם לא יוכל לטוס למשך 50 שנה" - ואז הוא טס שנתיים אחר כך!', emoji: '😄', category: 'airplanes' },
  { id: 120, text: 'המטוס המהיר ביותר, SR-71 Blackbird, טס ב-3,540 קמ"ש - מהר יותר מכדור מרובה!', emoji: '🦅', category: 'airplanes' },
  { id: 121, text: 'מצנח הומצא לפני המטוס! אנדרה-ז\'אק גרנרן קפץ עם מצנח ב-1797!', emoji: '🪂', category: 'airplanes' },
  { id: 122, text: 'כדור פורח חם היה כלי הטיסה הראשון - האחים מונגולפיה טסו בו ב-1783!', emoji: '🎈', category: 'airplanes' },
  { id: 123, text: 'מטוסי חמקן (סטלת\') כמעט בלתי נראים לרדאר בזכות הצורה המיוחדת שלהם!', emoji: '🥷', category: 'airplanes' },
  { id: 124, text: 'שדה התעופה הגדול ביותר בעולם הוא המלך פהד בסעודיה - גדול מכל תל אביב!', emoji: '🏗️', category: 'airplanes' },
  { id: 125, text: 'פחות מ-5% מאוכלוסיית העולם טסו אי פעם במטוס!', emoji: '🌍', category: 'airplanes' },

  // === ספינות (Ships) - 25 facts ===
  { id: 126, text: 'הטיטאניק הייתה כל כך גדולה שנחשבה ל"בלתי ניתנת לטביעה" - עד שהיא טבעה ב-1912!', emoji: '🚢', category: 'ships' },
  { id: 127, text: 'תעלת סואץ חוסכת לספינות 7,000 קילומטר - במקום לעקוף את כל אפריקה!', emoji: '🗺️', category: 'ships' },
  { id: 128, text: 'ספינת מכולות גדולה יכולה לשאת 24,000 מכולות - כמו רכבת באורך 72 קילומטר!', emoji: '📦', category: 'ships' },
  { id: 129, text: 'הצוללת הראשונה ששימשה בקרב הייתה ה-CSS Hunley במלחמת האזרחים האמריקנית ב-1864!', emoji: '🤿', category: 'ships' },
  { id: 130, text: 'שובר קרח יכול לפלס דרך קרח בעובי של עד 3 מטר!', emoji: '🧊', category: 'ships' },
  { id: 131, text: 'ספינת הקרוזים הגדולה ביותר בעולם, Wonder of the Seas, מכילה 6,988 נוסעים!', emoji: '🎢', category: 'ships' },
  { id: 132, text: 'מגדלור פארוס באלכסנדריה היה אחד משבעת פלאי תבל העתיקים!', emoji: '🗼', category: 'ships' },
  { id: 133, text: 'הויקינגים הפליגו עד אמריקה 500 שנה לפני קולומבוס!', emoji: '⚔️', category: 'ships' },
  { id: 134, text: 'ספינה צפה כי היא מזיזה מים שמשקלם שווה למשקלה - חוק ארכימדס!', emoji: '⚖️', category: 'ships' },
  { id: 135, text: 'ה-GPS הומצא בזכות הצורך של הצי האמריקני לנווט ספינות בדיוק!', emoji: '📡', category: 'ships' },
  { id: 136, text: 'ספינות מפרש גדולות היו צריכות צוות של מאות מלחים!', emoji: '⛵', category: 'ships' },
  { id: 137, text: 'קפטן ספינה יכול לערוך חתונות בים - זה חוקי ברוב המדינות!', emoji: '💒', category: 'ships' },
  { id: 138, text: 'נושאת מטוסים היא כמו שדה תעופה צף - מטוסים ממריאים ונוחתים עליה!', emoji: '🛫', category: 'ships' },
  { id: 139, text: 'הספינה הראשונה שחצתה את תעלת פנמה ב-1914 הייתה ספינת מלט!', emoji: '🏗️', category: 'ships' },
  { id: 140, text: 'שודדי ים אמיתיים השתמשו בדגל שחור עם גולגולת כדי להפחיד ספינות!', emoji: '🏴‍☠️', category: 'ships' },
  { id: 141, text: 'הצוללת הכי עמוקה צללה ל-10,928 מטר - לתחתית מצולת מריאנה!', emoji: '🌊', category: 'ships' },
  { id: 142, text: 'ספינת מפרש קליפר הייתה הספינה המהירה ביותר במאה ה-19 - 30 קמ"ש!', emoji: '💨', category: 'ships' },
  { id: 143, text: 'מגדלורים בימינו פועלים אוטומטית - פעם היה צריך אדם שידליק אותם כל לילה!', emoji: '💡', category: 'ships' },
  { id: 144, text: 'ספינת קרוזים גדולה צורכת כ-250 טון דלק ביום!', emoji: '⛽', category: 'ships' },
  { id: 145, text: 'סירת מירוץ יכולה להגיע למהירות של 300 קמ"ש על המים!', emoji: '🏁', category: 'ships' },
  { id: 146, text: 'קולומבוס הפליג עם שלוש ספינות בלבד - הניניה, הפינטה והסנטה מריה!', emoji: '🧭', category: 'ships' },
  { id: 147, text: 'צוללת גרעינית יכולה להישאר מתחת למים חודשים בלי לעלות!', emoji: '☢️', category: 'ships' },
  { id: 148, text: 'סירת הצלה על ספינת קרוזים יכולה להכיל עד 150 אנשים!', emoji: '🛟', category: 'ships' },
  { id: 149, text: 'ספינת המלחמה ביסמארק הייתה כל כך מבוצרת שנדרשו 2,800 פגזים כדי להטביע אותה!', emoji: '💥', category: 'ships' },
  { id: 150, text: 'ה"פלאינג דאצ\'מן" היא ספינת רפאים מפורסמת - אגדה על ספינה שלעולם לא תגיע לנמל!', emoji: '👻', category: 'ships' },
];

export function getFactsByCategory(categoryId: CategoryId): Fact[] {
  return facts.filter(f => f.category === categoryId);
}

export function getCategoryById(categoryId: CategoryId): Category | undefined {
  return categories.find(c => c.id === categoryId);
}

export function getRandomFact(): Fact {
  return facts[Math.floor(Math.random() * facts.length)];
}
