let tumTelefonlar = [];
let seciliTelefonlar = [];

function fiyatFormatla(fiyat) {
  return Number(fiyat).toLocaleString("tr-TR") + " ₺";
}

function kartlariCiz() {
  const listeAlani = document.getElementById("telefon-listesi");

  listeAlani.innerHTML = tumTelefonlar
    .map((tel, index) => {
      const seciliMi = seciliTelefonlar.includes(index);
      const kameraMetni = tel.kamera > 0 ? `${tel.kamera} MP` : "Yok";

      return `
        <article class="telefon-karti ${seciliMi ? "secili" : ""}">
          <h3>${tel.marka} ${tel.model}</h3>
          <p class="fiyat">${fiyatFormatla(tel.fiyat)}</p>
          <ul>
            <li><strong>RAM:</strong> ${tel.ram} GB</li>
            <li><strong>Kamera:</strong> ${kameraMetni}</li>
            <li><strong>Batarya:</strong> ${tel.batarya} mAh</li>
          </ul>
          <button onclick="karsilastirmayaEkleCikar(${index})">
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
        <h2>⚖️ Seçilen Telefonları Karşılaştır (${secilenler.length}/3)</h2>
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
              ${secilenler.map((t) => `<td>${fiyatFormatla(t.fiyat)}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>RAM</strong></td>
              ${secilenler.map((t) => `<td>${t.ram} GB</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Kamera</strong></td>
              ${secilenler.map((t) => `<td>${t.kamera > 0 ? t.kamera + " MP" : "Yok"}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Batarya</strong></td>
              ${secilenler.map((t) => `<td>${t.batarya} mAh</td>`).join("")}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function karsilastirmayaEkleCikar(index) {
  if (seciliTelefonlar.includes(index)) {
    seciliTelefonlar = seciliTelefonlar.filter((i) => i !== index);
  } else {
    if (seciliTelefonlar.length >= 3) {
      alert("En fazla 3 telefonu aynı anda karşılaştırabilirsiniz.");
      return;
    }
    seciliTelefonlar.push(index);
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
    kartlariCiz();
  } catch (hata) {
    console.error(hata);
    listeAlani.innerHTML = "<p>Telefon verileri yüklenirken bir hata oluştu.</p>";
  }
}

document.addEventListener("DOMContentLoaded", telefonlariYukle);
