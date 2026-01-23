const express = require('express');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

/* ================= SESSION ================= */
app.use(session({
    secret: 'starphone-secret-key',
    resave: false,
    saveUninitialized: false
}));

/* ================= ADMIN ================= */
const fakeUser = {
    name: "Sevde",
    password: "1234",
    role: "admin"
};

/* ================= FOTOĞRAF HAVUZLARI ================= */

const iosFotolar = [
    "/images/ios/iphone1.jpeg",
    "/images/ios/iphone2.jpeg",
    "/images/ios/iphone3.jpeg",
    "/images/ios/iphone4.jpeg",
    "/images/ios/iphone5.jpeg",
    "/images/ios/iphone6.jpeg",
    "/images/ios/iphone7.jpeg",
    "/images/ios/iphone8.jpeg",
    "/images/ios/iphone9.jpeg",
    "/images/ios/iphone10.jpeg",
    "/images/ios/iphone11.jpeg",
    "/images/ios/iphone12.jpeg"
];

const androidFotolar = [
    "/images/android/samsung1.jpeg",
    "/images/android/samsung2.jpeg",
    "/images/android/samsung3.jpeg",
    "/images/android/samsung4.jpeg",
    "/images/android/samsung5.jpeg",
    "/images/android/samsung6.jpeg",
    "/images/android/samsung7.jpeg",
    "/images/android/samsung8.jpeg",
    "/images/android/samsung9.jpeg",
    "/images/android/samsung10.jpeg",
    "/images/android/samsung11.jpeg",
    "/images/android/samsung12.jpeg",
    "/images/android/samsung13.jpeg",
    "/images/android/samsung14.jpeg"
];

const klasikFotolar = [
    "/images/klasik/nokia1.jpeg",
    "/images/klasik/nokia2.jpeg",
    "/images/klasik/nokia3.jpeg",
    "/images/klasik/nokia4.jpeg",
    "/images/klasik/nokia5.jpeg",
    "/images/klasik/nokia6.jpeg",
    "/images/klasik/nokia7.jpeg"
];

/* ================= MODELLER ================= */

const iosModeller = [
    "iPhone 11","iPhone 12","iPhone 13","iPhone 14","iPhone 15",
    "iPhone 11 Pro","iPhone 12 Pro","iPhone 13 Pro",
    "iPhone 14 Pro","iPhone 15 Pro Max"
];

const androidModeller = [
    "Samsung Galaxy S21","Samsung Galaxy S22","Samsung Galaxy S23",
    "Samsung Galaxy S24","Samsung Galaxy S24 Ultra"
];

const klasikModeller = [
    "Nokia 3310","Nokia E72","Nokia N95","Nokia 6300"
];

/* ================= İLANLAR ================= */

let ilanlar = [
    {
        id: "1",
        baslik: "iPhone 15 Pro",
        kategori: "iOS",
        fiyat: "72.500 ₺",
        resim: iosFotolar[0],
        aciklama: "Apple iPhone 15 Pro, temiz ve sorunsuz.",
        owner: "admin"
    }
];

const kategoriler = ["iOS", "Android", "Klasik"];

for (let i = 2; i <= 80; i++) {
    const kategori = kategoriler[i % 3];
    const index = i - 2;

    const foto =
        kategori === "iOS" ? iosFotolar[index % iosFotolar.length] :
        kategori === "Android" ? androidFotolar[index % androidFotolar.length] :
        klasikFotolar[index % klasikFotolar.length];

    const baslik =
        kategori === "iOS" ? iosModeller[index % iosModeller.length] :
        kategori === "Android" ? androidModeller[index % androidModeller.length] :
        klasikModeller[index % klasikModeller.length];

    ilanlar.push({
        id: String(i),
        baslik,
        kategori,
        fiyat: `${(3000 + index * 350).toLocaleString()} ₺`,
        resim: foto,
        aciklama: "Cihaz temiz kullanılmıştır.",
        owner: "admin"
    });
}

/* ================= AUTH ================= */

// LOGIN
app.post('/login', (req, res) => {
    const { name, password } = req.body;

    if (name === fakeUser.name && password === fakeUser.password) {
        req.session.user = fakeUser;
        return res.redirect('/');
    }

    res.send(`
        <script>
            alert("Hatalı kullanıcı adı veya şifre!");
            history.back();
        </script>
    `);
});

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

/* ================= ROUTES ================= */

app.get('/', (req, res) => {
    const aranan = req.query.search || "";
    const kategori = req.query.category || "";

    const sonuc = ilanlar.filter(i =>
        i.baslik.toLowerCase().includes(aranan.toLowerCase()) &&
        (kategori === "" || i.kategori === kategori)
    );

    res.render('anasayfa', {
        ilanlar: sonuc,
        aramaKelimesi: aranan,
        seciliKategori: kategori,
        aramaYapildiMi: !!(aranan || kategori),
        user: req.session.user
    });
});

app.get('/hakkimizda', (req, res) => {
    res.render('hakkimizda', { user: req.session.user });
});

app.get('/detay/:id', (req, res) => {
    const ilan = ilanlar.find(i => i.id === req.params.id);
    if (!ilan) return res.redirect('/');
    res.render('ilan-detay', { ilan, user: req.session.user });
});

app.get('/ekle', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('ilan-ekle', { user: req.session.user });
});

app.post('/ekle', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const { baslik, kategori, fiyat, aciklama } = req.body;

    const foto =
        kategori === "iOS" ? iosFotolar[0] :
        kategori === "Android" ? androidFotolar[0] :
        klasikFotolar[0];

    ilanlar.push({
        id: Date.now().toString(),
        baslik,
        kategori,
        fiyat: fiyat + " ₺",
        resim: foto,
        aciklama,
        owner: "admin"
    });

    res.redirect('/');
});

app.get('/duzenle/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const ilan = ilanlar.find(i => i.id === req.params.id);
    if (!ilan || ilan.owner !== "admin") return res.redirect('/');
    res.render('ilan-duzenle', { ilan, user: req.session.user });
});

app.post('/duzenle/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const ilan = ilanlar.find(i => i.id === req.params.id);
    if (!ilan || ilan.owner !== "admin") return res.redirect('/');

    ilan.baslik = req.body.baslik;
    ilan.fiyat = req.body.fiyat + " ₺";
    ilan.aciklama = req.body.aciklama;

    res.redirect('/detay/' + ilan.id);
});

app.get('/sil/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    ilanlar = ilanlar.filter(i => i.id !== req.params.id);
    res.redirect('/');
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 StarPhone çalışıyor. Port:", PORT);
});
