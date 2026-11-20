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
  suyaDayaniklilik: "Suya/Toza Dayanıklılık"
};

const HARIC_TUTULAN_ALANLAR = [
  "id",
  "orijinalIndex",
  "fiyat",
  "fiyat_tl"
];

const MAKSIMUM_KARSILASTIRMA_SAYISI = 3;

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

  const eslesme = String(deger)
    .replace(",", ".")
    .match(/\d+(\.\d+)?/);

  return eslesme ? parseFloat(eslesme[0]) : 0;
}

function markaListesiniDoldur() {
  const markaSecici = document.getElementById("marka-filtresi");

  markaSecici.innerHTML = `<option value="hepsi">Tüm Markalar</option>`;

  const markalar = [...new Set(tumTelefonlar.map((telefon) => telefon.marka))].sort();

  markalar.forEach((marka) => {
    const secenek = document.createElement("option");
    secenek.value = marka;
    secenek.textContent = marka;
    markaSecici.appendChild(secenek);
  });
}

function filtrelenmisVeSiralanmisTelefonlar() {
  const aramaKutusu = document.getElementById("arama-kutusu");
  const markaSecici = document.getElementById("marka-filtresi");
  const siralamaSecici = document.getElementById("siralama-secici");

  const aramaMetni = aramaKutusu.value.toLowerCase().trim();
  const seciliMarka = markaSecici.value;
  const siralama = siralamaSecici.value;

  let sonuc = tumTelefonlar.map((telefon, orijinalIndex) => ({
    ...telefon,
    orijinalIndex
  }));

  if (seciliMarka !== "hepsi") {
    sonuc = sonuc.filter((telefon) => telefon.marka === seciliMarka);
  }

  if (aramaMetni !== "") {
    sonuc = sonuc.filter((telefon) => {
      const tumDegerler = Object.values(telefon)
        .join(" ")
        .toLowerCase();

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

function kartOzellikListesiOlustur(telefon) {
  return Object.entries(telefon)
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

function kartOlustur(telefon) {
  const seciliMi = seciliTelefonlar.includes(telefon.orijinalIndex);

  return `
    <article class="telefon-karti ${seciliMi ? "secili" : ""}" data-index="${telefon.orijinalIndex}">
      <h2>${telefon.marka || "Bilinmiyor"} ${telefon.model || ""}</h2>

      <button
        class="karsilastir-butonu"
        data-index="${telefon.orijinalIndex}"
        ${seciliMi ? "disabled" : ""}
      >
        ${seciliMi ? "Seçildi" : "Karşılaştırmaya Ekle"}
      </button>

      <ul class="telefon-ozellikleri">
        ${kartOzellikListesiOlustur(telefon)}
      </ul>
    </article>
  `;
}

function kartlariCiz() {
  const telefonListesi = document.getElementById("telefon-listesi");
  const telefonlar = filtrelenmisVeSiralanmisTelefonlar();

  if (telefonlar.length === 0) {
    telefonListesi.innerHTML = `
      <p class="bos-sonuc">
        Aramanıza uygun telefon bulunamadı.
      </p>
    `;

    return;
  }

  telefonListesi.innerHTML = telefonlar
    .map((telefon) => kartOlustur(telefon))
    .join("");
}

function karsilastirmayiCiz() {
  const karsilastirmaAlani = document.getElementById("karsilastirma-alani");

  if (seciliTelefonlar.length === 0) {
    karsilastirmaAlani.innerHTML = `
      <p class="karsilastirma-bilgi">
        Karşılaştırmak için en fazla ${MAKSIMUM_KARSILASTIRMA_SAYISI} telefon seçebilirsin.
      </p>
    `;

    return;
  }

  const seciliTelefonNesneleri = seciliTelefonlar
    .map((index) => tumTelefonlar[index])
    .filter(Boolean);

  const tumAlanlar = new Set();

  seciliTelefonNesneleri.forEach((telefon) => {
    Object.keys(telefon).forEach((anahtar) => {
      if (!HARIC_TUTULAN_ALANLAR.includes(anahtar)) {
        tumAlanlar.add(anahtar);
      }
    });
  });

  const siraliAlanlar = [
    "marka",
    "model",
    "cikisTarihi",
    "isletimSistemi",
    "islemci",
    "ram",
    "depolama",
    "ekran",
    "yenilemeHizi",
    "kamera",
    "onKamera",
    "batarya",
    "hizliSarj",
    "kablosuzSarj",
    "agirlik",
    "boyutlar",
    "ipSertifikasi",
    "besG"
  ];

  const digerAlanlar = [...tumAlanlar].filter(
    (alan) => !siraliAlanlar.includes(alan)
  );

  const tabloBasliklari = seciliTelefonNesneleri
    .map(
      (telefon) => `
        <th>
          ${telefon.marka || ""} ${telefon.model || ""}
        </th>
      `
    )
    .join("");

  const tabloSatirlari = [...siraliAlanlar, ...digerAlanlar]
    .filter((alan) => tumAlanlar.has(alan))
    .map((alan) => {
      const hucreler = seciliTelefonNesneleri
        .map((telefon) => {
          const deger = telefon[alan];

          const gorunenDeger =
            deger === null ||
            deger === undefined ||
            String(deger).trim() === ""
              ? "—"
              : Array.isArray(deger)
                ? deger.join(", ")
                : deger;

          return `<td>${gorunenDeger}</td>`;
        })
        .join("");

      return `
        <tr>
          <th>${etiketGetir(alan)}</th>
          ${hucreler}
        </tr>
      `;
    })
    .join("");

  karsilastirmaAlani.innerHTML = `
    <div class="karsilastirma-baslik">
      <h2>Telefon Karşılaştırması</h2>

      <button id="karsilastirmayi-temizle" class="temizle-butonu">
        Karşılaştırmayı Temizle
      </button>
    </div>

    <div class="tablo-kapsayici">
      <table class="karsilastirma-tablosu">
        <thead>
          <tr>
            <th>Özellik</th>
            ${tabloBasliklari}
          </tr>
        </thead>

        <tbody>
          ${tabloSatirlari}
        </tbody>
      </table>
    </div>
  `;

  const temizleButonu = document.getElementById("karsilastirmayi-temizle");

  if (temizleButonu) {
    temizleButonu.addEventListener("click", () => {
      seciliTelefonlar = [];
      kartlariCiz();
      karsilastirmayiCiz();
    });
  }
}

function telefonSecimDurumunuGuncelle(index) {
  const zatenSecili = seciliTelefonlar.includes(index);

  if (zatenSecili) {
    seciliTelefonlar = seciliTelefonlar.filter(
      (seciliIndex) => seciliIndex !== index
    );
  } else {
    if (seciliTelefonlar.length >= MAKSIMUM_KARSILASTIRMA_SAYISI) {
      alert(
        `En fazla ${MAKSIMUM_KARSILASTIRMA_SAYISI} telefon karşılaştırabilirsin.`
      );

      return;
    }

    seciliTelefonlar.push(index);
  }

  kartlariCiz();
  karsilastirmayiCiz();
}

function olayDinleyicileriniEkle() {
  const aramaKutusu = document.getElementById("arama-kutusu");
  const markaSecici = document.getElementById("marka-filtresi");
  const siralamaSecici = document.getElementById("siralama-secici");
  const telefonListesi = document.getElementById("telefon-listesi");

  aramaKutusu.addEventListener("input", kartlariCiz);
  markaSecici.addEventListener("change", kartlariCiz);
  siralamaSecici.addEventListener("change", kartlariCiz);

  telefonListesi.addEventListener("click", (olay) => {
    const buton = olay.target.closest(".karsilastir-butonu");

    if (!buton) return;

    const index = Number(buton.dataset.index);

    telefonSecimDurumunuGuncelle(index);
  });
}

async function telefonlariYukle() {
  try {
    const yanit = await fetch("telefonlar.json");

    if (!yanit.ok) {
      throw new Error(`JSON dosyası yüklenemedi: ${yanit.status}`);
    }

    const veri = await yanit.json();

    if (!Array.isArray(veri)) {
      throw new Error("telefonlar.json bir dizi değil.");
    }

    tumTelefonlar = veri;

    markaListesiniDoldur();
    kartlariCiz();
    karsilastirmayiCiz();
  } catch (hata) {
    console.error(hata);

    const telefonListesi = document.getElementById("telefon-listesi");

    telefonListesi.innerHTML = `
      <p class="hata-mesaji">
        Telefon verileri yüklenemedi. <br>
        <strong>Hata:</strong> ${hata.message}
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  olayDinleyicileriniEkle();
  telefonlariYukle();
});
