const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// FOTOĞRAF HAVUZLARI
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

// GERÇEK MODEL İSİMLERİ
const iosModeller = [
    "iPhone 11",
    "iPhone 12",
    "iPhone 13",
    "iPhone 14",
    "iPhone 15",
    "iPhone 11 Pro",
    "iPhone 12 Pro",
    "iPhone 13 Pro",
    "iPhone 14 Pro",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max"
];

const androidModeller = [
    "Samsung Galaxy S21",
    "Samsung Galaxy S22",
    "Samsung Galaxy S23",
    "Samsung Galaxy S24",
    "Samsung Galaxy S24 Ultra",
    "Samsung Galaxy Note 20",
    "Samsung Galaxy A54",
    "Samsung Galaxy A34"
];

const klasikModeller = [
    "Nokia 3310",
    "Nokia E72",
    "Nokia N95",
    "Nokia 6300",
    "Nokia 6230"
];

// MANUEL İLANLAR
let ilanlar = [
    {
        id: "1",
        baslik: "iPhone 15 Pro",
        kategori: "iOS",
        fiyat: "72.500 ₺",
        resim: iosFotolar[0],
        aciklama: "Apple iPhone 15 Pro, temiz ve sorunsuz."
    },
    {
        id: "2",
        baslik: "Samsung Galaxy S24 Ultra",
        kategori: "Android",
        fiyat: "64.000 ₺",
        resim: androidFotolar[0],
        aciklama: "Samsung S24 Ultra, üst segment Android telefon."
    },
    {
        id: "3",
        baslik: "Nokia E72",
        kategori: "Klasik",
        fiyat: "3.250 ₺",
        resim: klasikFotolar[0],
        aciklama: "Nokia E72, nostaljik ve sağlam."
    }
];

// 🔥 OTOMATİK İLAN ÜRETME
const kategoriler = ["iOS", "Android", "Klasik"];

for (let i = 4; i <= 80; i++) {
    const kategori = kategoriler[i % 3];
    const index = i - 4;

    let foto = "";
    let baslik = "";

    if (kategori === "iOS") {
        foto = iosFotolar[index % iosFotolar.length];
        baslik = iosModeller[index % iosModeller.length];
    } 
    else if (kategori === "Android") {
        foto = androidFotolar[index % androidFotolar.length];
        baslik = androidModeller[index % androidModeller.length];
    } 
    else {
        foto = klasikFotolar[index % klasikFotolar.length];
        baslik = klasikModeller[index % klasikModeller.length];
    }

    ilanlar.push({
        id: String(i),
        baslik,
        kategori,
        fiyat: `${(3000 + index * 350).toLocaleString()} ₺`,
        resim: foto,
        aciklama: "Cihaz temiz kullanılmıştır. Tüm fonksiyonları sorunsuz çalışmaktadır."
    });
}

let girisYapanKullanici = null;

// ANA SAYFA
app.get('/', (req, res) => {
    const aranan = req.query.search || "";
    const kategori = req.query.category || "";

    let sonuclar = ilanlar;

    if (aranan.trim() !== "" || kategori !== "") {
        sonuclar = ilanlar.filter(i =>
            i.baslik.toLowerCase().includes(aranan.toLowerCase()) &&
            (kategori === "" || i.kategori === kategori)
        );
    }

    res.render('anasayfa', {
        ilanlar: sonuclar,
        aramaYapildiMi: !!(aranan || kategori),
        aramaKelimesi: aranan,
        seciliKategori: kategori,
        user: girisYapanKullanici
    });
});

// HAKKIMIZDA
app.get('/hakkimizda', (req, res) => {
    res.render('hakkimizda', { user: girisYapanKullanici });
});

// DETAY
app.get('/detay/:id', (req, res) => {
    const ilan = ilanlar.find(i => i.id === req.params.id);
    if (!ilan) return res.redirect('/');
    res.render('ilan-detay', { ilan, user: girisYapanKullanici });
});

// SİL
app.get('/sil/:id', (req, res) => {
    ilanlar = ilanlar.filter(i => i.id !== req.params.id);
    res.redirect('/');
});

// EKLE
app.get('/ekle', (req, res) => {
    res.render('ilan-ekle', { user: girisYapanKullanici });
});

app.post('/ekle', (req, res) => {
    const { baslik, kategori, fiyat, resim } = req.body;

    let varsayilanFoto = androidFotolar[0];
    if (kategori === "iOS") varsayilanFoto = iosFotolar[0];
    if (kategori === "Klasik") varsayilanFoto = klasikFotolar[0];

    ilanlar.push({
        id: String(Date.now()),
        baslik,
        kategori,
        fiyat: fiyat + " ₺",
        resim: resim || varsayilanFoto,
        aciklama: "Kullanıcı tarafından eklenen ilan."
    });

    res.redirect('/');
});

// AUTH
app.post('/register', (req, res) => {
    const { name, email } = req.body;
    girisYapanKullanici = { name, email };
    res.redirect('/');
});

app.post('/login', (req, res) => {
    const { email } = req.body;
    girisYapanKullanici = { name: "Test Kullanıcı", email };
    res.redirect('/');
});
// 📩 MESAJ GÖNDER
app.post('/mesaj-gonder', (req, res) => {
    const { ilanId, adsoyad, mesaj } = req.body;

    console.log("📩 Yeni mesaj alındı:");
    console.log("İlan ID:", ilanId);
    console.log("Gönderen:", adsoyad);
    console.log("Mesaj:", mesaj);

    res.send(`
        <script>
            alert("Mesajınız başarıyla gönderildi 👍");
            window.location.href = "/detay/${ilanId}";
        </script>
    `);
});

app.get('/logout', (req, res) => {
    girisYapanKullanici = null;
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 StarPhone hazır, port:", PORT);
});


