const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const db = new sqlite3.Database('./contact_form.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    }
});

// Detailed projects data
const projectsData = {
    'hatam-sofer': {
        title: 'פרויקט חתם סופר אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/1',
        description: 'פרויקט חתם סופר מציע לדיירים איכות חיים משודרגת, תוך חיזוק המבנים והוספת ממ"דים, מרפסות שמש וחניה. הפרויקט משלב חדשנות וקיימות, ומעניק לדיירים ביטחון ונוחות מקסימלית.',
        address: 'חתם סופר 1-3, אשקלון',
        architect: 'גרוסמן אדריכלים',
        details: [
            'חיזוק מבנים מפני רעידות אדמה',
            'הוספת ממ"דים לכל יחידת דיור',
            'הוספת מרפסות שמש',
            'הוספת מעלית וחניה תת-קרקעית',
            'שיפוץ וחידוש חזיתות הבניין',
            'שיפור התשתיות המשותפות'
        ]
    },
    'abarbanel': {
        title: 'פרויקט אברבנל אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/2',
        description: 'פרויקט אברבנל הוא פרויקט הריסה ובנייה מחדש, שנועד ליצור סביבת מגורים מודרנית ואיכותית. הפרויקט כולל דירות חדשות ומרווחות עם מפרט טכני עשיר, תוך שמירה על עיצוב אדריכלי עכשווי.',
        address: 'אברבנל 8-10, אשקלון',
        architect: 'גבריאל אדריכלים',
        details: [
            'הריסת מבנים ישנים ובנייה מחדש',
            'דירות חדשות ומודרניות',
            'שטחים משותפים מעוצבים',
            'תכנון חדשני ומרחב מחיה מרווח',
            'קרבה למרכז העיר ולמוסדות חינוך'
        ]
    },
    'histadrut': {
        title: 'פרויקט ההסתדרות אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/1',
        description: 'במסגרת פרויקט זה, אנו מבצעים חיזוק ושיקום מבנים, ומוסיפים יחידות דיור חדשות. הפרויקט משלב פתרונות אדריכליים מתקדמים עם תשומת לב לפרטים הקטנים, על מנת להבטיח את שביעות רצונם של הדיירים.',
        address: 'ההסתדרות 1-5, אשקלון',
        architect: 'בנימין דוד אדריכלים',
        details: [
            'שיפוץ וחיזוק המבנה',
            'הוספת ממ"דים ומרפסות',
            'שיקום ושיפוץ תשתית הבניין',
            'שיפור חללי הכניסה והחדר מדרגות',
            'הוספת מעלית'
        ]
    },
    'shevet-sofer': {
        title: 'פרויקט שבט סופר אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/1',
        description: 'פרויקט שבט סופר מעניק פתרון מגורים איכותי וחדשני, תוך חיזוק המבנה הקיים והוספת שטחים ציבוריים ירוקים. הפרויקט מתאים במיוחד למשפחות ומציע סביבה שקטה ובטוחה.',
        address: 'שבט סופר 12, אשקלון',
        architect: 'גרוסמן אדריכלים',
        details: [
            'חיזוק מבנים קיימים',
            'הוספת ממ"דים ומרפסות',
            'שיפוץ חזיתות הבניין',
            'פיתוח סביבתי וגינון',
            'הוספת מעלית'
        ]
    },
    'yehudah-halevi': {
        title: 'פרויקט יהודה הלוי אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/2',
        description: 'פרויקט הריסה ובנייה מחדש במיקום מרכזי. הדירות בפרויקט זה תוכננו בקפידה על מנת למקסם את המרחב ולאפשר איכות חיים גבוהה. הפרויקט כולל לובי מפואר ושטחים ציבוריים נוספים.',
        address: 'יהודה הלוי 7, אשקלון',
        architect: 'אלי אדריכלים',
        details: [
            'הריסה ובנייה מחדש',
            'תכנון דירות מודרניות ופונקציונליות',
            'לובי כניסה מעוצב',
            'חניה פרטית לכל דירה',
            'פיתוח סביבתי ברמה גבוהה'
        ]
    },
    'akiva-eiger': {
        title: 'פרויקט עקיבא איגר אשקלון',
        subtitle: 'התחדשות עירונית - פינוי בינוי',
        description: 'אחד הפרויקטים הגדולים והמשמעותיים בעיר אשקלון. במסגרתו, נהרסו המבנים הישנים והוקמו במקומם בניינים חדשים ומודרניים, עם מאות יחידות דיור חדשות, שטחים ירוקים ומרחבים ציבוריים לרווחת התושבים.',
        address: 'עקיבא איגר 1-5, אשקלון',
        architect: 'אלי אדריכלים',
        details: [
            'מתחם פינוי בינוי רחב היקף',
            'דירות חדשות במגוון גדלים',
            'שטחים ציבוריים ופארקים',
            'חניה תת-קרקעית',
            'קרבה למרכזים מסחריים ותחבורה ציבורית'
        ]
    },
    'shai-agnon': {
        title: 'פרויקט שי עגנון אשקלון',
        subtitle: 'התחדשות עירונית - תמ"א 38/2',
        description: 'פרויקט הריסה ובנייה מחדש המציע דירות יוקרה עם מפרט עשיר, במיקום שקט ומבוקש. הפרויקט מתאפיין בעיצוב מודרני ואלגנטי, ומעניק לדיירים חווית מגורים יוצאת דופן.',
        address: 'שי עגנון 2, אשקלון',
        architect: 'יוסף אדריכלים',
        details: [
            'בניית בניין בוטיק יוקרתי',
            'דירות פנטהאוז ודירות גן',
            'מפרט טכני עשיר',
            'עיצוב אדריכלי ייחודי',
            'חניה פרטית'
        ]
    },
    'magadim-kg': {
        title: 'פרויקט שכונת מגדים, קריית גת',
        subtitle: 'התחדשות עירונית - פינוי בינוי',
        description: 'פרויקט פינוי בינוי רחב היקף שמטרתו לחדש את שכונת מגדים בקרית גת. הפרויקט כולל בניית מגדלי מגורים חדשניים, לצד פיתוח תשתיות, שטחים ירוקים ומוסדות ציבוריים, לטובת יצירת סביבת מגורים תוססת ואיכותית.',
        address: 'שכונת מגדים, קריית גת',
        architect: 'גרוסמן אדריכלים',
        details: [
            'פרויקט פינוי בינוי גדול',
            'דירות חדשות ומרווחות',
            'פיתוח תשתיות מתקדם',
            'קרבה למרכזים מסחריים ופארקים',
            'שטחים משותפים נרחבים'
        ]
    }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;
    if (projectsData[projectId]) {
        res.json(projectsData[projectId]);
    } else {
        res.status(404).send('Project not found');
    }
});

app.post('/api/contact', async (req, res) => {
    const { fullName, email, phone, message } = req.body;
    if (!fullName || !email || !phone || !message) {
        return res.status(400).json({ status: 'error', message: 'כל השדות נדרשים.' });
    }

    try {
        const stmt = db.prepare("INSERT INTO contacts (fullName, email, phone, message) VALUES (?, ?, ?, ?)");
        stmt.run(fullName, email, phone, message, function(err) {
            if (err) {
                console.error('Error saving to database:', err.message);
            } else {
                console.log(`A new contact was inserted with rowid ${this.lastID}`);
            }
        });
        stmt.finalize();

        res.status(200).json({ status: 'success', message: 'הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ status: 'error', message: 'שגיאה פנימית בשרת. אנא נסו שוב מאוחר יותר.' });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/contacts', (req, res) => {
    db.all("SELECT * FROM contacts ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, contacts: rows });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
