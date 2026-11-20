let tumTelefonlar = [];
let seciliTelefonlar = [];

const OZELLIK_ETIKETLERI = {
  isletimSistemi: "İşletim Sistemi",
  ekran: "Ekran",
  islemci: "İşlemci",
  ram: "RAM",
  depolama: "Depolama",
  kamera: "Arka Kamera",
  onKamera: "Ön Kamera",
  batarya: "Batarya",
  hizliSarj: "Hızlı Şarj",
  sarjGirisi: "Şarj Girişi",
  kablosuzSarj: "Kablosuz Şarj",
  simDestegi: "SIM Desteği",
  guvenlik: "Güvenlik",
  sesHoparlor: "Ses & Hoparlör",
  agirlik: "Ağırlık",
  besG: "5G Desteği",
  suyaDayaniklilik: "Suya/Toza Dayanıklılık"
};

const HARIC_TUTULAN_ALANLAR = ["marka", "model", "fiyat", "orijinalIndex"];

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

function fiyatFormatla(fiyat) {
  return Number(fiyat).toLocaleString("tr-TR") + " ₺";
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

  let sonuc = tumTelefonlar.map((tel, orijinalIndex) => ({ ...tel, orijinalIndex }));

  if (seciliMarka !== "hepsi") {
    sonuc = sonuc.filter((t) => t.marka === seciliMarka);
  }

  if (aramaMetni !== "") {
    sonuc = sonuc.filter((t) => {
      const tumDegerler = Object.values(t).join(" ").toLowerCase();
      return tumDegerler.includes(aramaMetni);
    });
  }

  if (siralama === "fiyat-artan") {
    sonuc.sort((a, b) => sayiCikar(a.fiyat) - sayiCikar(b.fiyat));
  } else if (siralama === "fiyat-azalan") {
    sonuc.sort((a, b) => sayiCikar(b.fiyat) - sayiCikar(a.fiyat));
  } else if (siralama === "batarya-azalan") {
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

function kartlariCiz() {
  const listeAlani = document.getElementById("telefon-listesi");
  const gosterilecekler = filtrelenmisVeSiralanmisTelefonlar();

  if (gosterilecekler.length === 0) {
    listeAlani.innerHTML = `<p class="bos-mesaj">Aramanıza uygun telefon bulunamadı.</p>`;
    return;
  }

  listeAlani.innerHTML = gosterilecekler
    .map((tel) => {
      const seciliMi = seciliTelefonlar.includes(tel.orijinalIndex);

      return `
        <article class="telefon-karti ${seciliMi ? "secili" : ""}">
          <div>
            <div class="kart-ust">
              <span class="marka-etiket">${tel.marka}</span>
              <span class="besg-etiket">${tel.besG === "Var" ? "5G" : "4.5G"}</span>
            </div>
            <h3>${tel.marka} ${tel.model}</h3>
            <p class="fiyat">${fiyatFormatla(tel.fiyat)}</p>
            <ul>
              ${kartOzellikListesiOlustur(tel)}
            </ul>
          </div>
          <button onclick="karsilastirmayaEkleCikar(${tel.orijinalIndex})">
            ${seciliMi ? "✓ Karşılaştırmada" : "+ Karşılaştır"}
          </button>
        </article>
      `;
    })
    .join("");
}

function karsilastirmayiCiz() {
  const alan = document.getElementById("karsilastirma-alani");
  if (!alan) return;

  if (seciliTelefonlar.length === 0) {
    alan.innerHTML = "";
    return;
  }

  const secilenler = seciliTelefonlar.map((i) => tumTelefonlar[i]);

  const tumOzellikAnahtarlari = [];
  secilenler.forEach((tel) => {
    Object.keys(tel).forEach((anahtar) => {
      if (!HARIC_TUTULAN_ALANLAR.includes(anahtar) && !tumOzellikAnahtarlari.includes(anahtar)) {
        tumOzellikAnahtarlari.push(anahtar);
      }
    });
  });

  const tabloSatirlari = tumOzellikAnahtarlari
    .map((anahtar) => {
      return `
        <tr>
          <td><strong>${etiketGetir(anahtar)}</strong></td>
          ${secilenler
            .map((tel) => {
              const deger = tel[anahtar];
              const gosterim =
                deger !== undefined && deger !== null && String(deger).trim() !== ""
                  ? Array.isArray(deger)
                    ? deger.join(", ")
                    : deger
                  : "-";
              return `<td>${gosterim}</td>`;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  alan.innerHTML = `
    <div class="karsilastirma-kutusu">
      <div class="karsilastirma-ust">
        <h2>⚖️ Karşılaştırma Tablosu (${secilenler.length}/3)</h2>
        <button class="temizle-btn" onclick="karsilastirmayiTemizle()">Temizle</button>
      </div>
      <div class="tablo-sarmalayici">
        <table>
          <thead>
            <tr>
              <th>Özellik</th>
              ${secilenler.map((t) => `<th>${t.marka} ${t.model}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Fiyat</strong></td>
              ${secilenler.map((t) => `<td class="tablo-fiyat">${fiyatFormatla(t.fiyat)}</td>`).join("")}
            </tr>
            ${tabloSatirlari}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function karsilastirmayaEkleCikar(orijinalIndex) {
  if (seciliTelefonlar.includes(orijinalIndex)) {
    seciliTelefonlar = seciliTelefonlar.filter((i) => i !== orijinalIndex);
  } else {
    if (seciliTelefonlar.length >= 3) {
      alert("En fazla 3 telefonu aynı anda karşılaştırabilirsiniz.");
      return;
    }
    seciliTelefonlar.push(orijinalIndex);
  }
  kartlariCiz();
  karsilastirmayiCiz();
}

function karsilastirmayiTemizle() {
  seciliTelefonlar = [];
  kartlariCiz();
  karsilastirmayiCiz();
}

async function telefonlariYukle() {
  const listeAlani = document.getElementById("telefon-listesi");

  try {
    const yanit = await fetch("./telefonlar.json");
    if (!yanit.ok) throw new Error("telefonlar.json okunamadı.");

    tumTelefonlar = await yanit.json();
    markaListesiniDoldur();
    kartlariCiz();

    document.getElementById("arama-kutusu").addEventListener("input", kartlariCiz);
    document.getElementById("marka-filtresi").addEventListener("change", kartlariCiz);
    document.getElementById("siralama-secici").addEventListener("change", kartlariCiz);
  } catch (hata) {
    console.error(hata);
    listeAlani.innerHTML = "<p>Telefon verileri yüklenirken bir hata oluştu.</p>";
  }
}

document.addEventListener("DOMContentLoaded", telefonlariYukle);
