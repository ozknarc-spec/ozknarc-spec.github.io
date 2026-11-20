let tumTelefonlar = [];
let seciliTelefonlar = [];
let aktifGorunum = "all";
const MAKSIMUM_KARSILASTIRMA = 4;
const FAVORI_ANAHTARI = "telefonKarsilastirFavoriler";
const SON_ANAHTARI = "telefonKarsilastirSon";
const etiketler = {marka:"Marka",model:"Model",cikisTarihi:"Çıkış tarihi",isletimSistemi:"İşletim sistemi",ekran:"Ekran",yenilemeHizi:"Yenileme hızı",islemci:"İşlemci",ram:"RAM",depolama:"Depolama",kamera:"Arka kamera",onKamera:"Ön kamera",batarya:"Batarya",hizliSarj:"Hızlı şarj",kablosuzSarj:"Kablosuz şarj",agirlik:"Ağırlık",boyutlar:"Boyutlar",ipSertifikasi:"IP sertifikası",besG:"5G"};
const gizliAlanlar = new Set(["id","fiyat","fiyat_tl"]);
const $ = id => document.getElementById(id);
const oku = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const yaz = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const sayi = value => { const m=String(value ?? "").replace(",",".").match(/\d+(\.\d+)?/); return m ? Number(m[0]) : 0; };
const ramDegeri = t => Math.max(0,...String(t.ram||"").match(/\d+/g)?.map(Number) || [0]);
const bataryaDegeri = t => sayi(t.batarya);
const ekranDegeri = t => sayi(t.ekran);
const kameraDegeri = t => sayi(t.kamera);
const etiket = key => etiketler[key] || key.replace(/([A-Z])/g," $1");
const metin = value => Array.isArray(value) ? value.join(", ") : (value ?? "—");
function guvenli(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function favoriler(){return oku(FAVORI_ANAHTARI);}
function seciliFiltreliTelefonlar(){
 let list=[...tumTelefonlar]; const q=$("arama-kutusu").value.toLocaleLowerCase("tr").trim();
 const brand=$("marka-filtresi").value, minRam=Number($("ram-filtresi").value), minBat=Number($("batarya-filtresi").value), five=$("besg-filtresi").value;
 if(brand!=="hepsi") list=list.filter(t=>t.marka===brand);
 if(q) list=list.filter(t=>Object.values(t).join(" ").toLocaleLowerCase("tr").includes(q));
 if(minRam) list=list.filter(t=>ramDegeri(t)>=minRam);
 if(minBat) list=list.filter(t=>bataryaDegeri(t)>=minBat);
 if(five==="evet") list=list.filter(t=>String(t.besG).toLocaleLowerCase("tr")==="evet");
 const sort=$("siralama-secici").value;
 if(sort==="batarya") list.sort((a,b)=>bataryaDegeri(b)-bataryaDegeri(a));
 if(sort==="ram") list.sort((a,b)=>ramDegeri(b)-ramDegeri(a));
 if(sort==="ekran") list.sort((a,b)=>ekranDegeri(b)-ekranDegeri(a));
 if(aktifGorunum==="favorites") list=list.filter(t=>favoriler().includes(t.id));
 if(aktifGorunum==="recent"){const recent=oku(SON_ANAHTARI);list=list.filter(t=>recent.includes(t.id)).sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id));}
 return list;
}
function puanla(t, alan){
 // Bu puanlar laboratuvar testi değil; yalnızca veri setindeki teknik sayılara dayalı yaklaşık sıralama göstergesidir.
 const ram=ramDegeri(t), battery=bataryaDegeri(t), refresh=sayi(t.yenilemeHizi), screen=ekranDegeri(t), camera=kameraDegeri(t);
 const processor=String(t.islemci||"").toLowerCase();
 const perf=(processor.includes("elite")||processor.includes("a19")||processor.includes("a18")||processor.includes("dimensity 9400")?95:processor.includes("gen 3")||processor.includes("a17")||processor.includes("dimensity 9300")?88:processor.includes("tensor g5")||processor.includes("8s gen 4")?82:70);
 const raw={performans:perf, pil:Math.min(100,battery/60), kamera:Math.min(100,camera/2.2), ekran:Math.min(100,refresh/1.2+screen*2), genel:Math.round((perf+Math.min(100,battery/60)+Math.min(100,camera/2.2)+Math.min(100,refresh/1.2+screen*2)+Math.min(100,ram*6))/5)};
 return Math.round(raw[alan]||raw.genel);
}
function markaDoldur(){const s=$("marka-filtresi"), old=s.value; s.innerHTML='<option value="hepsi">Tüm Markalar</option>'+[...new Set(tumTelefonlar.map(t=>t.marka))].sort().map(m=>'<option>'+guvenli(m)+'</option>').join("");s.value=old;}
function kart(t){
 const selected=seciliTelefonlar.includes(t.id), fav=favoriler().includes(t.id);
 return '<article class="telefon-karti"><div class="kart-top"><span class="marka-etiket">'+guvenli(t.marka)+'</span><span class="puan">'+puanla(t,"genel")+'/100 tahmini puan</span></div><h3><a class="model-link" href="telefon/'+encodeURIComponent(t.id)+'/">'+guvenli(t.model)+'</a></h3><ul class="ozellik-listesi">'+["islemci","ram","depolama","ekran","kamera","batarya"].map(k=>'<li><strong>'+etiket(k)+':</strong> '+guvenli(metin(t[k]))+'</li>').join("")+'</ul><div class="kart-actions"><button class="button" data-action="compare" data-id="'+guvenli(t.id)+'" '+(selected?'disabled':'')+'>'+(selected?'Seçildi':'Karşılaştır')+'</button><button class="button secondary" data-action="detail" data-id="'+guvenli(t.id)+'">Detaylar</button><button class="button secondary" data-action="favorite" data-id="'+guvenli(t.id)+'" aria-pressed="'+fav+'">'+(fav?'♥ Favoride':'♡ Favorile')+'</button></div></article>';
}
function kartlariCiz(){const list=seciliFiltreliTelefonlar();$("sonuc-sayisi").textContent="("+list.length+" telefon)";$("telefon-listesi").innerHTML=list.length?list.map(kart).join(""):'<p class="muted">Bu ölçütlere uygun telefon bulunamadı.</p>';}
function karsilastirmayiCiz(){
 const chosen=seciliTelefonlar.map(id=>tumTelefonlar.find(t=>t.id===id)).filter(Boolean);
 if(!chosen.length){$("karsilastirma-alani").innerHTML='<p class="muted">Karşılaştırmak için telefon kartlarından seçim yap.</p>';return;}
 const keys=["marka","model","cikisTarihi","isletimSistemi","islemci","ram","depolama","ekran","yenilemeHizi","kamera","onKamera","batarya","hizliSarj","kablosuzSarj","agirlik","ipSertifikasi","besG"];
 $("karsilastirma-alani").innerHTML='<div class="tablo-kapsayici"><table class="karsilastirma-tablosu"><thead><tr><th>Özellik</th>'+chosen.map(t=>'<th>'+guvenli(t.marka+" "+t.model)+'</th>').join("")+'</tr></thead><tbody>'+keys.map(k=>'<tr><th>'+etiket(k)+'</th>'+chosen.map(t=>'<td>'+guvenli(metin(t[k]))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
}
function favoriDegistir(id){let f=favoriler();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];yaz(FAVORI_ANAHTARI,f);kartlariCiz();}
function sonGorulen(id){let a=oku(SON_ANAHTARI).filter(x=>x!==id);a.unshift(id);yaz(SON_ANAHTARI,a.slice(0,12));}
function detayAc(id){const t=tumTelefonlar.find(x=>x.id===id);if(!t)return;sonGorulen(id);$("detay-baslik").textContent=t.marka+" "+t.model;$("detay-icerik").innerHTML='<div class="detay-puan"><strong>'+puanla(t,"genel")+'/100</strong><span>Teknik özelliklerden hesaplanan yaklaşık puan</span></div><dl class="detay-grid">'+Object.entries(t).filter(([k,v])=>!gizliAlanlar.has(k)&&v!==null&&v!=="").map(([k,v])=>'<div><dt>'+etiket(k)+'</dt><dd>'+guvenli(metin(v))+'</dd></div>').join("")+'</dl><p class="muted">Puan, bağımsız test sonucu değildir; mevcut teknik verilerden oluşturulmuş yaklaşık bir göstergedir.</p>';$("telefon-detay-dialog").showModal();kartlariCiz();}
function oner(){const usage=$("kullanim-onceligi").value,min=Number($("onerici-ram").value);const candidates=tumTelefonlar.filter(t=>ramDegeri(t)>=min);const score=t=>usage==="oyun"?puanla(t,"performans"):usage==="kamera"?puanla(t,"kamera"):usage==="pil"?puanla(t,"pil"):usage==="ekran"?puanla(t,"ekran"):puanla(t,"genel");const best=[...candidates].sort((a,b)=>score(b)-score(a)).slice(0,3);$("oner-sonuc").innerHTML=best.length?'<h3>Öneriler</h3><div class="oner-kartlar">'+best.map(t=>'<button class="oner-kart" data-action="detail" data-id="'+guvenli(t.id)+'"><strong>'+guvenli(t.marka+" "+t.model)+'</strong><span>'+score(t)+'/100 yaklaşık eşleşme puanı</span></button>').join("")+'</div><p class="muted">Öneriler yalnızca mevcut teknik özelliklere göre sıralanır; fiyat ve bağımsız performans testi içermez.</p>':'<p>Bu RAM ölçütünde telefon bulunamadı.</p>';}
function olaylar(){
 ["arama-kutusu","marka-filtresi","siralama-secici","ram-filtresi","batarya-filtresi","besg-filtresi"].forEach(id=>$(id).addEventListener(id==="arama-kutusu"?"input":"change",kartlariCiz));
 $("filtreleri-temizle").addEventListener("click",()=>{["arama-kutusu"].forEach(id=>$(id).value="");["marka-filtresi","siralama-secici","ram-filtresi","batarya-filtresi","besg-filtresi"].forEach((id,i)=>$(id).selectedIndex=0);aktifGorunum="all";document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view==="all"));kartlariCiz();});
 $("oner-sonuc").addEventListener("click",e=>{const b=e.target.closest("button[data-action=\"detail\"]");if(b)detayAc(b.dataset.id);});
 $("telefon-listesi").addEventListener("click",e=>{const b=e.target.closest("button[data-action]");if(!b)return;const {action,id}=b.dataset;if(action==="compare"){if(seciliTelefonlar.length>=MAKSIMUM_KARSILASTIRMA){alert("En fazla 4 telefon karşılaştırabilirsin.");return;}seciliTelefonlar.push(id);kartlariCiz();karsilastirmayiCiz();}if(action==="favorite")favoriDegistir(id);if(action==="detail")detayAc(id);});
 $("karsilastirmayi-temizle").addEventListener("click",()=>{seciliTelefonlar=[];kartlariCiz();karsilastirmayiCiz();});
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{aktifGorunum=b.dataset.view;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));kartlariCiz();}));
 $("oner-button").addEventListener("click",oner);$("detay-kapat").addEventListener("click",()=>$("telefon-detay-dialog").close());
 $("telefon-detay-dialog").addEventListener("click",e=>{if(e.target===$("telefon-detay-dialog"))$("telefon-detay-dialog").close();});
}
async function baslat(){olaylar();try{const response=await fetch("telefonlar.json");if(!response.ok)throw new Error("Telefon verileri yüklenemedi ("+response.status+")");const data=await response.json();if(!Array.isArray(data))throw new Error("Telefon veri dosyası beklenen formatta değil.");tumTelefonlar=data;markaDoldur();kartlariCiz();karsilastirmayiCiz();}catch(err){$("telefon-listesi").innerHTML='<p class="hata-mesaji">'+guvenli(err.message)+'</p>';}}
document.addEventListener("DOMContentLoaded",baslat);
