let tumTelefonlar = [];
let seciliTelefonlar = [];

function fiyatFormatla(fiyat) {
  return Number(fiyat).toLocaleString("tr-TR") + " ₺";
}

function markaListesiniDoldur() {
  const markaSecici = document.getElementById("marka-filtresi");
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
      const birlesikMetin = `${t.marka} ${t.model} ${t.islemci} ${t.ekran} ${t.hizliSarj}`.toLowerCase();
      return birlesikMetin.includes(aramaMetni);
    });
  }

  if (siralama === "fiyat-artan") {
    sonuc.sort((a, b) => a.fiyat - b.fiyat);
  } else if (siralama === "fiyat-azalan") {
    sonuc.sort((a, b) => b.fiyat - a.fiyat);
  } else if (siralama === "batarya-azalan") {
    sonuc.sort((a, b) => b.batarya - a.batarya);
  } else if (siralama === "ram-azalan") {
    sonuc.sort((a, b) => b.ram - a.ram);
  }

  return sonuc;
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
          <div class="kart-ust">
            <span class="marka-etiket">${tel.marka}</span>
            <span class="besg-etiket">${tel.besG === "Var" ? "5G" : "4.5G"}</span>
          </div>
          <h3>${tel.marka} ${tel.model}</h3>
          <p class="fiyat">${fiyatFormatla(tel.fiyat)}</p>
          <ul>
            <li><strong>Ekran:</strong> ${tel.ekran}</li>
            <li><strong>İşlemci:</strong> ${tel.islemci}</li>
            <li><strong>RAM / Depolama:</strong> ${tel.ram} GB / ${tel.depolama} GB</li>
            <li><strong>Arka Kamera:</strong> ${tel.kamera}</li>
            <li><strong>Ön Kamera:</strong> ${tel.onKamera}</li>
            <li><strong>Batarya:</strong> ${tel.batarya} mAh (${tel.hizliSarj})</li>
            <li><strong>Dayanıklılık:</strong> ${tel.suyaDayaniklilik}</li>
          </ul>
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
            <tr>
              <td><strong>Ekran</strong></td>
              ${secilenler.map((t) => `<td>${t.ekran}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>İşlemci</strong></td>
              ${secilenler.map((t) => `<td>${t.islemci}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>RAM</strong></td>
              ${secilenler.map((t) => `<td>${t.ram} GB</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Depolama</strong></td>
              ${secilenler.map((t) => `<td>${t.depolama} GB</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Arka Kamera</strong></td>
              ${secilenler.map((t) => `<td>${t.kamera}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Ön Kamera</strong></td>
              ${secilenler.map((t) => `<td>${t.onKamera}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Batarya</strong></td>
              ${secilenler.map((t) => `<td>${t.batarya} mAh</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Hızlı Şarj</strong></td>
              ${secilenler.map((t) => `<td>${t.hizliSarj}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>5G Desteği</strong></td>
              ${secilenler.map((t) => `<td>${t.besG}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Suya Dayanıklılık</strong></td>
              ${secilenler.map((t) => `<td>${t.suyaDayaniklilik}</td>`).join("")}
            </tr>
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
