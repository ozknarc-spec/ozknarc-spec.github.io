let tumTelefonlar = [];
let seciliTelefonlar = [];

const OZELLIK_ETIKETLERI = {
  marka: "Marka",
  model: "Model",
  cikisTarihi: "Çıkış Tarihi",
  isletimSistemi: "İşletim Sistemi",
  ekran: "Ekran",
  yenilemeHizi: "Yenileme Hızı",
  islemci: "İşlemci",
  ram: "RAM",
  depolama: "Depolama",
  kamera: "Arka Kamera",
  onKamera: "Ön Kamera",
  batarya: "Batarya",
  hizliSarj: "Hızlı Şarj",
  kablosuzSarj: "Kablosuz Şarj",
  agirlik: "Ağırlık",
  boyutlar: "Boyutlar",
  ipSertifikasi: "IP Sertifikası",
  besG: "5G Desteği",
  suyaDayaniklilik: "Suya/Toza Dayanıklılık",
};

const HARIC_TUTULAN_ALANLAR = [
  "id",
  "orijinalIndex",
  "fiyat",
  "fiyat_tl",
];

function etiketGetir(anahtar) {
  if (OZELLIK_ETIKETLERI[anahtar]) {
    return OZELLIK_ETIKETLERI[anahtar];
  }
  return anahtar
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (karakter) => karakter.toUpperCase())
    .trim();
}

function sayiCikar(deger) {
  if (typeof deger === "number") return deger;
  if (!deger) return 0;
  const eslesme = String(deger).replace(",", ".").match(/\d+(\.\d+)?/);
  return eslesme ? parseFloat(eslesme[0]) : 0;
}

function markaListesiniDoldur() {
  const markaSecici = document.getElementById("marka-filtresi");
  markaSecici.innerHTML = `<option value="hepsi">Tüm Markalar</option>`;
  const markalar = [...new Set(tumTelefonlar.map((t) => t.marka))].sort();

  markalar.forEach((marka) => {
    const secenek = document.createElement("option");
    secenek.value = marka;
    secenek.textContent = marka;
    markaSecici.appendChild(secenek);
  });
}

function filtrelenmisVeSiralanmisTelefonlar() {
  const aramaMetni = document.getElementById("arama-kutusu").value.toLowerCase().trim();
  const seciliMarka = document.getElementById("marka-filtresi").value;
  const siralama = document.getElementById("siralama-secici").value;

  let sonuc = tumTelefonlar.map((tel, orijinalIndex) => ({
    ...tel,
    orijinalIndex,
  }));

  if (seciliMarka !== "hepsi") {
    sonuc = sonuc.filter((t) => t.marka === seciliMarka);
  }

  if (aramaMetni !== "") {
    sonuc = sonuc.filter((t) => {
      const tumDegerler = Object.values(t).join(" ").toLowerCase();
      return tumDegerler.includes(aramaMetni);
    });
  }

  if (siralama === "batarya-azalan") {
    sonuc.sort((a, b) => sayiCikar(b.batarya) - sayiCikar(a.batarya));
  } else if (siralama === "ram-azalan") {
    sonuc.sort((a, b) => sayiCikar(b.ram) - sayiCikar(a.ram));
  }

  return sonuc;
}

function kartOzellikListesiOlustur(tel) {
  return Object.entries(tel)
    .filter(([anahtar, deger]) => {
      return (
        !HARIC_TUTULAN_ALANLAR.includes(anahtar) &&
        deger !== null &&
        deger !== undefined &&
        String(deger).trim() !== ""
      );
    })
    .map(([anahtar, deger]) => {
      const metin = Array.isArray(deger) ? deger.join(", ") : deger;
      return `<li><strong>${etiketGetir(anahtar)}:</strong> ${metin}</li>`;
    })
    .join("");
}

function kart
