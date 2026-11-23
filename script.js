/* ===== PENGATURAN DEVELOPER (ubah di sini, pengguna lain tidak bisa mengedit) ===== */
const DEV = {group:'Kelompok 4', members:['Muhamad Rafii Al-AaFi (17)','Muhammad Ginanjar Rizqi (18)','Muthia Azahra (22)','Nafis Syafiya Fidiarti (23)']};
/* ===== FILE AUDIO: semua file ada di folder "audio" (sejajar dengan index.html) =====
   good = suara jawaban BENAR (cling) | bad = suara jawaban SALAH (tetot)
   bgm  = 3 musik latar, diputar bergantian (1 -> 2 -> 3 -> ulang)
   Jika nama/ekstensi file kamu berbeda, ubah tulisan di dalam tanda kutip. */
const AUDIO_FILES = {good:'cling.mp3', bad:'tetot.mp3', bgm:['background1.mp3','background2.mp3','background3.mp3']};
const PRAISE = ['Luar biasa! Kamu benar-benar Penjaga Bumi sejati! 🌍🏆','Keren banget! Kemampuanmu sangat mantap! 🌟','Hebat! Bumi aman karena ada pahlawan sepertimu! 💚','Sempurna! Pertahankan semangat belajarmu! 🎉','Mantap! Kamu layak jadi duta lingkungan sekaligus jagoan matematika! 🌱'];
const MOTIV = ['Jangan menyerah! Setiap kesalahan adalah langkah menuju paham. 💪','Bumi saja butuh waktu untuk pulih, kamu pun boleh belajar pelan-pelan. 🌱','Coba baca pembahasan lagi, lalu main sekali lagi. Kamu pasti bisa! ✨','Pahlawan bumi tidak lahir instan. Teruslah berlatih! 🌍','Skor hanya angka. Yang penting kamu mau terus mencoba! 🔥','Satu langkah kecil hari ini, lompatan besar esok hari. Semangat! 🚀','Eliminasi dan substitusi akan terasa mudah kalau sering dilatih. 📘','Kegagalan itu bibit yang akan tumbuh jadi keberhasilan. 🌿','Percayalah pada dirimu, kamu lebih mampu dari yang kamu kira! 💚','Istirahat sebentar, tarik napas, lalu kita selamatkan bumi lagi! 🌤️'];
const avatars=['🦊','🐼','🐸','🐯','🐧','🐱','🐻','🦁'];
let player='',avatar='🦊',questions=[],qIndex=0,score=0,lives=3,choice=null,locked=false,motivDeck=[];
const $=id=>document.getElementById(id);
/* ---- pengaturan: musik, efek suara, level, warna latar ---- */
const LV={mudah:'MUDAH',medium:'MEDIUM',susah:'SUSAH'},THEMES=['hitam','hijau','kuning','biru'];
let S={voice:true,music:true,sfx:true,bgm:'auto',level:'mudah',theme:'hijau'};
try{Object.assign(S,JSON.parse(localStorage.getItem('ecoSet')||'{}'))}catch(e){}
if(!['auto','1','2','3'].includes(String(S.bgm)))S.bgm='auto';S.bgm=String(S.bgm);if(!THEMES.includes(S.theme))S.theme='hijau';
function saveS(){try{localStorage.setItem('ecoSet',JSON.stringify(S))}catch(e){}}
function applyS(){document.documentElement.dataset.theme=S.theme;$('swMusic').classList.toggle('on',S.music);$('swSfx').classList.toggle('on',S.sfx);$('swVoice').classList.toggle('on',S.voice);
document.querySelectorAll('#levelSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.level));
document.querySelectorAll('#bgmSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.bgm));document.querySelectorAll('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.theme))}
function setOpt(k){S[k]=!S[k];if(k==='voice'&&!S.voice)try{speechSynthesis.cancel()}catch(e){};if(k==='music'){S.music?startBgm():stopBgm()}saveS();applyS()}
function setLevel(v){const ch=v!==S.level;S.level=v;saveS();applyS();if(ch&&$('game').classList.contains('active'))startGame()}
function setBgm(v){S.bgm=v;bgmI=v==='auto'?Math.floor(Math.random()*BGM.length):+v-1;stopBgm();saveS();applyS();startBgm()}
function setTheme(t){S.theme=t;saveS();applyS()}
/* ---- audio ---- */
const SFX={};['good','bad'].forEach(k=>{const a=new Audio(AUDIO_FILES[k]);a.preload='auto';a.onerror=()=>{a.broken=true;console.warn('File audio tidak ditemukan: '+AUDIO_FILES[k])};SFX[k]=a});
let bgmI=S.bgm==='auto'?Math.floor(Math.random()*AUDIO_FILES.bgm.length):+S.bgm-1;
const BGM=AUDIO_FILES.bgm.map((f,i)=>{const a=new Audio(f);a.preload='auto';a.volume=.25;
 a.onerror=()=>{a.broken=true;console.warn('File audio tidak ditemukan: '+f);if(S.music&&bgmI===i)startBgm()};
 a.onended=()=>{if(S.bgm==='auto')bgmI=(i+1)%BGM.length;a.currentTime=0;startBgm()};return a});
function curBgm(){if(S.bgm!=='auto'){const a=BGM[+S.bgm-1];return a&&!a.broken?a:null}
 for(let n=0;n<BGM.length;n++){const a=BGM[(bgmI+n)%BGM.length];if(!a.broken){bgmI=(bgmI+n)%BGM.length;return a}}return null}
function stopBgm(){BGM.forEach(a=>a.pause())}
function startBgm(){if(!S.music||$('game').classList.contains('active'))return;const a=curBgm();if(!a||!a.paused)return;const p=a.play();if(p)p.catch(()=>{})}
function sfx(k){if(!S.sfx)return;const a=SFX[k];if(a.broken)return;try{a.currentTime=0;const p=a.play();if(p)p.catch(()=>{})}catch(e){}}
/* ---- efek visual ---- */
function burst(ok){const set=ok?['✅','⭐','✨','🌟','💚','🎉']:['❌','✖️','❌','💥','❌'];const f=document.createElement('div');f.className='fx';
for(let i=0;i<34;i++){const s=document.createElement('span'),ang=Math.random()*6.283,r=120+Math.random()*Math.min(innerWidth,700)*.5;s.textContent=set[i%set.length];
s.style.setProperty('--dx',Math.cos(ang)*r+'px');s.style.setProperty('--dy',Math.sin(ang)*r+'px');s.style.setProperty('--r',(Math.random()*360-180)+'deg');s.style.animationDelay=(Math.random()*.15)+'s';s.style.fontSize=(1.4+Math.random()*1.6)+'rem';f.appendChild(s)}
const fl=document.createElement('div');fl.className='flash '+(ok?'good':'bad');document.body.append(f,fl);setTimeout(()=>{f.remove();fl.remove()},1500);
if(!ok){const p=$('game').firstElementChild;p.classList.remove('shake');void p.offsetWidth;p.classList.add('shake')}}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');document.body.classList.toggle('playing',id==='game');if(id==='game')stopBgm();else startBgm();window.scrollTo(0,0)}
function openModal(id){$(id).classList.add('show')}
function closeModal(id){$(id).classList.remove('show')}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function init(){$('avatarGrid').innerHTML=avatars.map((a,i)=>`<button class="avatar ${i===0?'selected':''}" onclick="chooseAvatar('${a}',this)">${a}</button>`).join('')}
function chooseAvatar(a,el){avatar=a;document.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));el.classList.add('selected')}
function enterLobby(){let n=$('playerName').value.trim();if(n.length<4){$('welcomeError').textContent='Nama pemain minimal 4 huruf.';return} $('welcomeError').textContent='';player=n;$('helloName').textContent=player;$('menuPlayer').textContent=player;$('menuAvatar').textContent=avatar;startBgm();showScreen('home')}
function changePlayer(){$('playerName').value=player;showScreen('welcome')}
/* ===== DATA CERITA =====
 'scene|teks' = narasi saat tokoh berjalan | [soal, [opsi], indexJawaban, pembahasan/petunjuk, 1=SPLDV] */
// Percakapan sehari-hari yang muncul di sela narasi, disesuaikan dengan lokasi.
const TALK={
 home:[['rani','Bima, jangan cuma mengeluh. Ayo kita lihat isinya dulu.'],['bima','Iya, Kak. Aku bantu pisahkan satu per satu.'],['kakek','Nah, begitu. Kalau dikerjakan bersama, pekerjaan terasa lebih ringan.']],
 street:[['bima','Tong hijau untuk sisa makanan, kuning untuk barang yang bisa didaur ulang, ya?'],['rani','Betul. Baca tulisan di tongnya juga supaya tidak tertukar.'],['kakek','Perhatikan jenis sampahnya. Jangan asal memasukkan.']],
 tps:[['bima','Bu Marni, karung ini sudah kami pisahkan sesuai jenisnya.'],['kakek','Timbang satu per satu agar berat dan harganya jelas.'],['rani','Aku catat hasil timbangannya, Kek.']],
 market:[['bima','Kak, uang hasil jual sampah cukup untuk membeli buku itu?'],['rani','Kita hitung dulu. Jangan sampai uangnya kurang.'],['kakek','Biasakan mencatat pemasukan dan pengeluaran.']],
 work:[['rani','Kek, alat-alatnya sudah siap. Kita mulai dari mana?'],['kakek','Kita siapkan bahannya, lalu kerjakan tahap demi tahap.'],['bima','Aku bisa membantu menyiapkan bahan dan mencatat jumlahnya.']],
 park:[['bima','Taman ini jadi lebih nyaman setelah sampahnya dibersihkan.'],['rani','Iya. Kalau semua warga ikut menjaga, hasilnya akan bertahan lama.'],['kakek','Kebiasaan baik dimulai dari hal kecil yang dilakukan setiap hari.']]
};
const ANSWER_LINES=['Perhitungannya sudah sesuai. Kita lanjutkan pekerjaan berikutnya.','Hasilnya cocok dengan data yang kita punya.','Sekarang kita bisa melanjutkan langkah berikutnya.'];
const CH=[
{n:'Chapter 1: Membuang & Menjual Sampah',d:'Memilah sampah dan memodelkan berat serta harga jualnya menggunakan SPLDV.',steps:[
'home|Minggu pagi di Desa Sumberjaya, Rani terbangun oleh teriakan adiknya, Bima. "Kak! Tempat sampah dapur penuh dan baunya bukan main!"',
'home|Di dapur, satu kantong plastik menggembung berisi kulit pisang, botol bekas, kardus mi, dan baterai remote yang mati. Semuanya tercampur jadi satu.',
['Kulit pisang dan sisa sayur termasuk sampah jenis apa?',['Organik','Anorganik','B3','Residu logam'],0,'Sampah yang berasal dari makhluk hidup dan mudah membusuk disebut organik.'],
'home|Kakek Darto, mantan petugas kebersihan, muncul di pintu sambil membawa tongkat. "Hari ini Kakek ajari kalian cara membuang sampah yang benar."',
'street|Mereka bertiga berjalan menyusuri gang. Di pojok jalan berdiri tiga tong: hijau untuk organik, kuning untuk anorganik, dan merah untuk bahan berbahaya.',
['Baterai bekas remote sebaiknya dibuang ke tong warna apa?',['Hijau','Kuning','Merah','Boleh bebas'],2,'Baterai mengandung bahan kimia berbahaya (B3), jadi masuk tong merah.'],
['Botol plastik bekas minuman termasuk sampah jenis apa?',['Organik','Anorganik','B3','Cair'],1,'Plastik tidak mudah membusuk, tetapi bisa didaur ulang, jadi anorganik.'],
'street|Di dekat selokan, Pak RT mengeruk tumpukan plastik. "Gara-gara sampah sembarangan, bulan lalu air meluap sampai ke halaman," keluhnya.',
['Apa akibat paling nyata dari membuang sampah ke selokan?',['Saluran tersumbat dan banjir','Udara jadi segar','Tanah makin subur','Air jadi jernih'],0,'Sampah menyumbat aliran air sehingga air meluap saat hujan.'],
['Singkatan 3R dalam pengelolaan sampah adalah ...',['Reduce, Reuse, Recycle','Repair, Rest, Run','Read, Write, Rest','Rinse, Rub, Rain'],0,'3R = Reduce (kurangi), Reuse (pakai ulang), Recycle (daur ulang).'],
'street|Kakek menjelaskan 3R. Bima mencatat sambil berjalan dan hampir menabrak tiang listrik. Rani menahan tawa sambil menarik tas adiknya.',
['Contoh Reduce (mengurangi sampah) yang tepat adalah ...',['Membawa tas belanja sendiri','Membakar sampah','Membeli plastik sekali pakai','Membuang makanan sisa'],0,'Reduce berarti mengurangi sampah dari sumbernya.'],
'tps|Sampailah mereka di tempat pengepul Bu Marni. Papan harga: botol Rp3.000/kg, kardus Rp2.000/kg, kaleng Rp6.000/kg, koran Rp1.500/kg. Bu Marni mengajak mereka membentuk dua persamaan dari berat dan total uang.',
['Bu Marni mencatat dua jenis sampah dengan total berat 10 kg. Harga botol Rp3.000/kg dan kardus Rp2.000/kg. Total uangnya Rp26.000. Jika x = kg botol dan y = kg kardus, berapa kg botol yang dijual?',['4 kg','5 kg','6 kg','7 kg'],2,'Model SPLDV: x + y = 10 dan 3.000x + 2.000y = 26.000. Kalikan persamaan pertama dengan 2.000: 2.000x + 2.000y = 20.000. Kurangkan dari persamaan kedua: 1.000x = 6.000, jadi x = 6 kg dan y = 4 kg.',1],
'tps|Bima membawa satu karung berisi kardus dan kaleng. Berat totalnya 5 kg dan Bu Marni membayar Rp22.000. Mereka harus mencari berat masing-masing jenis sampah.',
['Bima membawa kardus dan kaleng dengan total berat 5 kg. Harga kardus Rp2.000/kg dan kaleng Rp6.000/kg. Total uangnya Rp22.000. Jika x = kg kardus dan y = kg kaleng, berapa kg kaleng?',['1 kg','2 kg','3 kg','4 kg'],2,'Model SPLDV: x + y = 5 dan 2.000x + 6.000y = 22.000. Kalikan persamaan pertama dengan 2.000: 2.000x + 2.000y = 10.000. Kurangkan: 4.000y = 12.000, jadi y = 3 kg dan x = 2 kg.',1],
'tps|Bu Marni menimbang botol dan kaleng milik Rani. Total beratnya 8 kg dan pembayaran Rp36.000. "Kita bisa mencari berat tiap jenis dengan dua persamaan," jelasnya.',
['Rani menimbang botol dan kaleng dengan total berat 8 kg. Harga botol Rp3.000/kg dan kaleng Rp6.000/kg. Total pembayaran Rp36.000. Jika x = kg botol dan y = kg kaleng, berapa kg kaleng?',['2 kg','3 kg','4 kg','5 kg'],2,'Model SPLDV: x + y = 8 dan 3.000x + 6.000y = 36.000. Kalikan persamaan pertama dengan 3.000: 3.000x + 3.000y = 24.000. Kurangkan: 3.000y = 12.000, jadi y = 4 kg dan x = 4 kg.',1],
['Mengapa sampah perlu dipilah sebelum dijual?',['Agar bersih, tidak bercampur, dan harganya lebih baik','Supaya terlihat banyak','Supaya cepat membusuk','Agar bisa dibakar'],0,'Sampah yang terpilah dan bersih lebih mudah diproses dan dihargai lebih tinggi.'],
'tps|Rani bertanya kenapa botol berminyak dihargai murah. Bu Marni menunjuk bak cuci: "Semua harus bersih dulu sebelum dilebur di pabrik."',
['Sebelum dijual, botol bekas yang kotor sebaiknya ...',['Dibilas bersih','Dibiarkan kotor','Dibakar','Dicampur organik'],0,'Botol bersih lebih mudah diolah dan tidak berbau.'],
['Pecahan kaca sebelum dibuang sebaiknya dibungkus dahulu karena ...',['Melindungi petugas dari luka','Agar terlihat cantik','Agar lebih berat','Agar tidak berbau'],0,'Pecahan kaca tajam dan bisa melukai petugas kebersihan.'],
'market|Hari itu Rani membawa botol dan kardus dengan total berat 15 kg. Dari catatan harga, total penjualannya Rp40.000. Di pasar kecil ujung kampung, ia melihat buku cerita.',
['Rani menjual botol dan kardus dengan total berat 15 kg. Harga botol Rp3.000/kg dan kardus Rp2.000/kg. Total penjualan Rp40.000. Jika x = kg botol dan y = kg kardus, berapa kg kardus yang dijual?',['3 kg','4 kg','5 kg','6 kg'],2,'Model SPLDV: x + y = 15 dan 3.000x + 2.000y = 40.000. Kalikan persamaan pertama dengan 2.000: 2.000x + 2.000y = 30.000. Kurangkan dari persamaan kedua: 1.000x = 10.000, jadi x = 10 kg dan y = 5 kg. Jadi kardus yang dijual 5 kg.',1],
'market|Aroma gorengan memenuhi udara. Bu Marni menyusul mereka dan bercerita tentang bank sampah di kota yang menabung sampah warga.',
['Bank sampah adalah tempat ...',['Menabung sampah terpilah yang dinilai dengan uang','Menyimpan uang saja','Membakar sampah','Membuang sampah sembarang'],0,'Warga menyetor sampah terpilah dan dicatat nilainya sebagai tabungan.'],
'market|"Seorang pelanggan menjual 10 kg botol, lalu menambahkan kardus dan kaleng dengan total berat 10 kg. Sisa pembayaran untuk dua jenis itu Rp36.000," cerita Bu Marni.',
['Setelah menjual 10 kg botol seharga Rp3.000/kg, seorang pelanggan membawa kardus dan kaleng tambahan dengan total berat 10 kg. Harga kardus Rp2.000/kg dan kaleng Rp6.000/kg. Sisa pembayaran untuk dua jenis itu Rp36.000. Jika x = kg kardus dan y = kg kaleng, berapa kg kaleng?',['3 kg','4 kg','5 kg','6 kg'],1,'Model SPLDV: x + y = 10 dan 2.000x + 6.000y = 36.000. Kalikan persamaan pertama dengan 2.000: 2.000x + 2.000y = 20.000. Kurangkan dari persamaan kedua: 4.000y = 16.000, jadi y = 4 kg dan x = 6 kg.',1],
['Sisa makanan yang ditumpuk dalam kantong tertutup lama-lama akan ...',['Berbau dan menghasilkan gas metana','Menjadi emas','Menjernihkan udara','Menjadi plastik'],0,'Pembusukan tanpa udara menghasilkan bau dan gas metana.'],
['Kebiasaan terbaik di rumah agar sampah mudah dikelola adalah ...',['Membuang di kolam','Membakar semua','Memilah sejak di sumbernya','Menunggu hujan'],2,'Memilah sejak awal membuat sampah mudah dijual atau diolah.'],
['Lampu neon bekas termasuk sampah ...',['B3','Organik','Kertas','Basah'],0,'Lampu neon mengandung merkuri, sehingga termasuk B3.'],
'market|Rani menutup hari dengan senyum. "Ternyata sampah yang bikin bau, kalau dipilah bisa jadi uang." Kakek menepuk bahunya. "Itu baru separuh cerita, Nak. Besok kita belajar mengolahnya."'
]},
{n:'Chapter 2: Mengolah Sampah Jadi Rupiah',d:'Mengolah sampah menjadi kompos dan produk daur ulang, lalu memodelkan hasilnya dengan SPLDV.',steps:[
'home|Senin sore, Rani dan Bima pulang membawa kabar. Sekolah mengadakan lomba "Kreasi Sampah" tingkat desa. Kakek langsung mengajak mereka ke bengkel di belakang rumah.',
'work|Bengkel Kakek penuh gunting, lem, benang, cat, dan sebuah ember besar bertutup. "Sampah organik tidak perlu dibuang, tapi diolah jadi kompos," kata Kakek.',
['Pupuk alami hasil pelapukan sisa sayur dan daun disebut ...',['Kompos','Ecobrick','Briket','Limbah cair'],0,'Kompos adalah pupuk alami dari penguraian sampah organik.'],
['Bahan yang boleh dimasukkan ke komposter adalah ...',['Sisa sayur dan daun kering','Plastik bungkus','Styrofoam','Pecahan kaca'],0,'Hanya bahan organik yang bisa diurai mikroorganisme.'],
'work|Bima bertanya mengapa semua bahan harus ditimbang dan dicatat. Kakek menjawab, "Pengusaha yang baik selalu mencatat modal, hasil, dan keuntungannya, supaya tahu apakah usahanya untung atau rugi."',
'work|Mereka mengumpulkan 15 kg sisa dapur tetangga. Kakek menjelaskan bahwa proses pengomposan menyusutkan bahan. Dari bahan yang terkumpul, Kakek menghasilkan dua kualitas kompos. Kompos halus dijual Rp7.000/kg dan kompos campuran Rp5.000/kg. Totalnya 8 kg dengan pendapatan Rp52.000.',
['Kakek menghasilkan dua kualitas kompos: kompos halus seharga Rp7.000/kg dan kompos campuran seharga Rp5.000/kg. Totalnya 8 kg dengan pendapatan Rp52.000. Jika x = kg kompos halus dan y = kg kompos campuran, berapa kg kompos halus?',['4 kg','5 kg','6 kg','7 kg'],2,'Model SPLDV: x + y = 8 dan 7.000x + 5.000y = 52.000. Kalikan persamaan pertama dengan 5.000: 5.000x + 5.000y = 40.000. Kurangkan: 2.000x = 12.000, jadi x = 6 kg dan y = 2 kg.',1],
['Ciri kompos yang sudah matang adalah ...',['Gelap, remah, dan tidak berbau busuk','Berbau busuk menyengat','Penuh belatung','Sangat panas'],0,'Kompos matang berwarna gelap, gembur, dan berbau tanah.'],
['Mengapa tumpukan kompos perlu diaduk berkala?',['Agar udara masuk dan penguraian merata','Agar cepat dingin','Agar bahan lari','Supaya berbusa'],0,'Mikroorganisme pengurai membutuhkan udara.'],
'work|Selama menunggu kompos matang sekitar empat sampai enam minggu, Kakek mengajak mereka membuat ecobrick dari botol plastik yang diisi padat dengan plastik bersih dan kering.',
['Ecobrick adalah ...',['Botol diisi padat plastik bersih dan kering untuk bahan bangunan atau perabot','Botol berisi air minum','Botol yang dibuang ke sungai','Botol yang dibakar'],0,'Ecobrick memadatkan plastik agar bisa dijadikan bangku atau dinding taman.'],
'work|Di sudut bengkel, tumpukan bungkus sachet warna-warni menggunung. Bima mengaku bosan melihatnya, tetapi mata Rani berbinar seperti menemukan harta karun.',
'work|Rani lalu mengumpulkan bungkus kopi sachet. Setelah dicuci dan dijahit, bungkus itu berubah jadi tas belanja unik. Mereka membuat dua model tas: tas besar Rp25.000 dan tas kecil Rp20.000. Hari itu terjual 6 tas dengan pendapatan Rp140.000.',
['Mengapa bungkus plastik harus dicuci dan dikeringkan sebelum dijahit?',['Agar tidak bau dan berjamur','Agar lebih berat','Agar berwarna','Agar mudah terbakar'],0,'Sisa kopi dan lembap membuat bau serta jamur.'],
['Rani membuat dua model tas daur ulang. Tas besar dijual Rp25.000 dan tas kecil Rp20.000. Total terjual 6 tas dengan pendapatan Rp140.000. Jika x = jumlah tas besar dan y = jumlah tas kecil, berapa tas besar yang terjual?',['2 tas','3 tas','4 tas','5 tas'],2,'Model SPLDV: x + y = 6 dan 25.000x + 20.000y = 140.000. Kalikan persamaan pertama dengan 20.000: 20.000x + 20.000y = 120.000. Kurangkan: 5.000x = 20.000, jadi x = 4 tas dan y = 2 tas.',1],
['Mengubah sampah menjadi produk bernilai lebih tinggi disebut ...',['Upcycle','Buang','Bakar','Timbun'],0,'Upcycle menambah nilai barang bekas lewat kreativitas.'],
'work|Dua hari kemudian, tas buatan Rani selesai. Bu Guru yang mampir ke rumah terkagum-kagum dan mengabarkan bahwa lomba akan diadakan di lapangan desa hari Rabu.',
'park|Rabu sore, mereka membawa hasil karya ke taman desa. Ibu-ibu PKK memesan buku tulis dari kertas daur ulang yang Bima buat dari bubur kertas bekas.',
['Langkah awal membuat kertas daur ulang adalah ...',['Merendam dan menghancurkan kertas jadi bubur','Membakar kertas','Mengubur kertas','Mewarnai kertas utuh'],0,'Kertas direndam lalu dihancurkan jadi bubur sebelum dicetak ulang.'],
'park|Bima menjelaskan bahwa 30 produk yang dibuat terdiri dari buku dan pembatas buku. Harga buku Rp4.000, sedangkan pembatas buku Rp2.000. Total pendapatan yang tercatat Rp100.000.',
['Bima membuat 30 produk daur ulang berupa buku dan pembatas buku. Buku dijual Rp4.000 dan pembatas buku Rp2.000. Total pendapatan Rp100.000. Jika x = jumlah buku dan y = jumlah pembatas buku, berapa buku yang dibuat?',['10 buku','15 buku','20 buku','25 buku'],2,'Model SPLDV: x + y = 30 dan 4.000x + 2.000y = 100.000. Kalikan persamaan pertama dengan 2.000: 2.000x + 2.000y = 60.000. Kurangkan: 2.000x = 40.000, jadi x = 20 buku dan y = 10 pembatas buku.',1],
['Manfaat utama kompos bagi tanaman adalah ...',['Menyuburkan tanah dan mengurangi pupuk kimia','Membuat tanaman plastik','Mematikan akar','Menambah sampah'],0,'Kompos menambah unsur hara dan memperbaiki struktur tanah.'],
'park|Di bazar desa, Rani dan Bima memajang 15 produk gabungan berupa pot dan ecobrick. Pot dijual Rp8.000 per buah, sedangkan ecobrick Rp6.000. Total penjualan mencapai Rp102.000.',
'work|Kakek menunjukkan hasil produksi bengkel. Ada pot hias dan ecobrick yang akan dijual di bazar. Mereka mencatat jumlah kedua produk dan total uang penjualannya untuk mengetahui berapa banyak pot yang dibuat.',
['Tepi kaleng yang tajam sebaiknya ...',['Diamplas atau dilapisi agar aman','Dibiarkan','Dijilat','Dipakai langsung'],0,'Keselamatan utama. Tepi tajam bisa melukai tangan.'],
['Di bengkel, Rani membuat pot dan ecobrick sebanyak 15 produk. Pot dijual Rp8.000 dan ecobrick Rp6.000. Total pendapatan Rp102.000. Jika x = jumlah pot dan y = jumlah ecobrick, berapa pot yang dibuat?',['3 pot','6 pot','9 pot','12 pot'],1,'Model SPLDV: x + y = 15 dan 8.000x + 6.000y = 102.000. Kalikan persamaan pertama dengan 6.000: 6.000x + 6.000y = 90.000. Kurangkan: 2.000x = 12.000, jadi x = 6 pot dan y = 9 ecobrick.',1],
['Alat keselamatan yang tepat saat mengolah sampah adalah ...',['Sarung tangan dan masker','Sandal jepit saja','Tanpa alat','Payung'],0,'Sarung tangan dan masker mencegah luka dan penyakit.'],
'work|Kakek duduk di bangku kayu sambil menyeruput teh. "Ingat, Nak. Barang bagus bukan hanya soal untung. Kita juga ikut menjaga bumi supaya tetap hijau."',
'work|Setelah kompos matang, Kakek mengemasnya dalam dua ukuran karung. Karung besar dijual Rp15.000 dan karung kecil Rp10.000. Hari itu terjual 10 karung dengan total pendapatan Rp120.000.',
['Bank sampah mengemas kompos dalam dua ukuran. Karung besar dijual Rp15.000 dan karung kecil Rp10.000. Dalam satu hari terjual 10 karung dengan pendapatan Rp120.000. Jika x = karung besar dan y = karung kecil, berapa karung besar yang terjual?',['2 karung','3 karung','4 karung','5 karung'],2,'Model SPLDV: x + y = 10 dan 15.000x + 10.000y = 120.000. Kalikan persamaan pertama dengan 10.000: 10.000x + 10.000y = 100.000. Kurangkan: 5.000x = 20.000, jadi x = 4 karung dan y = 6 karung.',1],
['Cara terbaik menaikkan penjualan produk olahan adalah ...',['Foto menarik dan cerita bahan daur ulangnya','Menyembunyikan produk','Menjual tanpa label','Menaikkan harga tanpa alasan'],0,'Cerita dan tampilan yang menarik menambah minat pembeli.'],
['Mengapa produk olahan lebih menguntungkan daripada dijual mentah?',['Ada nilai tambah dari tenaga dan kreativitas','Karena lebih berat','Karena gratis','Karena tidak laku'],0,'Nilai tambah membuat harga jual lebih tinggi.'],
'park|Malam itu di bawah lampu taman, Rani menghitung semua hasil kerja keras mereka. Bima tertidur di pangkuan Kakek. "Besok," bisik Rani, "kita ajak seluruh desa membuat bank sampah."'
]},
{n:'Chapter 3: Bank Sampah & Kesimpulan',d:'Menerapkan SPLDV untuk mengelola hasil bank sampah dan menyusun rencana desa.',steps:[
'street|Sabtu pagi, spanduk "Bank Sampah Sumberjaya" terpasang di balai desa. Warga berdatangan membawa karung sampah yang sudah dipilah. Rani berdiri gugup di depan mikrofon.',
'street|"Teman-teman," kata Rani, "kami belajar dua hal. Sampah dipilah lalu dijual, atau diolah jadi barang baru agar nilainya lebih tinggi." Warga bertepuk tangan.',
['Urutan pengelolaan sampah yang paling tepat adalah ...',['Memilah, menjual yang laku, mengolah sisanya','Membakar lalu menimbun','Menumpuk lalu membuang','Mencampur semua'],0,'Ini inti Chapter 1 dan 2.'],
['Kulit buah dan sisa sayur di bank sampah akan dijadikan ...',['Kompos','Tas','Kertas','Pot'],0,'Organik diolah menjadi kompos.'],
'street|Satu per satu warga menyetorkan sampahnya. Ada yang membawa botol, ada yang membawa kardus, dan ada pula ibu-ibu yang membawa ember penuh sisa sayur dari dapur.',
'tps|Bu Marni hadir sebagai penimbang resmi. "Seminggu ini kita punya botol dan kaleng sebanyak 12 kg. Dari dua jenis itu, pendapatan kita Rp54.000. Ayo cari berat masing-masing," ujarnya sambil membuka buku catatan.',
['Warga membawa botol dan kaleng dengan total berat 12 kg. Harga botol Rp3.000/kg dan kaleng Rp6.000/kg. Total hasil penjualan dua jenis sampah itu Rp54.000. Jika x = kg botol dan y = kg kaleng, berapa kg kaleng?',['4 kg','5 kg','6 kg','7 kg'],2,'Model SPLDV: x + y = 12 dan 3.000x + 6.000y = 54.000. Kalikan persamaan pertama dengan 3.000: 3.000x + 3.000y = 36.000. Kurangkan: 3.000y = 18.000, jadi y = 6 kg dan x = 6 kg.',1],
['Mengapa baterai dan lampu bekas harus dipisahkan?',['Termasuk B3 yang berbahaya jika tercampur','Karena berat','Karena cantik','Karena mahal'],0,'B3 bisa mencemari tanah dan air.'],
'tps|Pak RT bertanya, "Mana yang lebih menguntungkan, menjual mentah atau mengolah dulu?" Rani menunjukkan catatan. Dua puluh produk olahan terjual. Tas berharga Rp10.000 dan pot Rp6.000, dengan total pendapatan Rp160.000.',
['Warga menjual 20 produk olahan yang terdiri dari tas seharga Rp10.000 dan pot seharga Rp6.000. Total pendapatan Rp160.000. Jika x = jumlah tas dan y = jumlah pot, berapa jumlah tas yang terjual?',['5 tas','8 tas','10 tas','12 tas'],2,'Model SPLDV: x + y = 20 dan 10.000x + 6.000y = 160.000. Kalikan persamaan pertama dengan 6.000: 6.000x + 6.000y = 120.000. Kurangkan: 4.000x = 40.000, jadi x = 10 tas dan y = 10 pot.',1],
['Manfaat utama bank sampah bagi desa adalah ...',['Lingkungan bersih dan warga mendapat tambahan penghasilan','Sampah bertambah','Banjir bertambah','Tidak ada manfaat'],0,'Bersih dan menghasilkan uang.'],
['Prinsip 3R yang paling diutamakan terlebih dahulu adalah ...',['Reduce','Recycle','Membuang','Membakar'],0,'Mengurangi sampah dari awal adalah langkah terbaik.'],
['Contoh Reuse yang benar adalah ...',['Memakai botol minum isi ulang','Membeli botol baru tiap hari','Membakar botol','Membuang botol'],0,'Reuse berarti memakai kembali.'],
'tps|Pak Lurah ikut menyimak dan mencatat dengan serius. "Bank sampah ini bisa jadi contoh untuk desa-desa lain," katanya, membuat Rani tersipu bangga.',
['Mengapa hasil bank sampah perlu dicatat rapi?',['Agar tabungan warga jelas dan dipercaya','Agar sampah bertambah','Agar tidak ada yang tahu','Agar cepat membusuk'],0,'Pencatatan yang rapi membuat bank sampah transparan dan dipercaya.'],
'market|Warga sepakat membagi dana Rp90.000 untuk pendidikan lingkungan dan kegiatan sosial. Dana pendidikan direncanakan dua kali dana sosial.',
['Warga membagi dana Rp90.000 untuk pendidikan lingkungan dan kegiatan sosial. Dana pendidikan dua kali dana sosial. Jika x = dana pendidikan dan y = dana sosial, berapa dana sosial?',['Rp20.000','Rp25.000','Rp30.000','Rp40.000'],2,'Model SPLDV: x + y = 90.000 dan x = 2y. Substitusi x = 2y ke persamaan pertama: 2y + y = 90.000, sehingga 3y = 90.000 dan y = Rp30.000. Jadi dana sosial Rp30.000 dan dana pendidikan Rp60.000.',1],
['Mengapa seluruh warga perlu ikut terlibat?',['Karena hasil terbaik muncul dari kerja sama','Karena disuruh saja','Agar ramai saja','Agar sampah berpindah'],0,'Kerja sama membuat sampah terkelola rutin.'],
'market|Hari semakin siang, warung-warung ramai. Rani dan Bima membantu Bu Sari memilah sisa makanan warungnya ke dalam ember hijau dengan penuh semangat.',
'market|Bu Sari menawarkan 45 kg bahan organik. Sebagian diolah menjadi kompos seharga Rp7.000/kg dan sisanya menjadi mulsa seharga Rp5.000/kg. Total pendapatan keduanya Rp261.000.',
['Dari 45 kg bahan organik, warga membuat kompos dan mulsa. Kompos dijual Rp7.000/kg dan mulsa Rp5.000/kg. Total pendapatan Rp261.000. Jika x = kg kompos dan y = kg mulsa, berapa kg kompos yang dihasilkan?',['12 kg','15 kg','18 kg','21 kg'],2,'Model SPLDV: x + y = 45 dan 7.000x + 5.000y = 261.000. Kalikan persamaan pertama dengan 5.000: 5.000x + 5.000y = 225.000. Kurangkan: 2.000x = 36.000, jadi x = 18 kg kompos dan y = 27 kg mulsa.',1],
['Dampak jika seluruh warga memilah sampah adalah ...',['Sampah ke TPA berkurang','Sampah makin menumpuk','Banjir tambah parah','Udara kotor'],0,'Sampah yang dimanfaatkan tidak perlu menumpuk di TPA.'],
'park|Sore datang perlahan. Anak-anak kampung bermain di taman yang kini bersih, tanpa ada lagi bau menyengat dari selokan seperti dulu.',
'park|Di taman, Kakek memandang desa yang kini jauh lebih bersih. "Dari 120 kg sampah minggu ini, berat yang dimanfaatkan dan yang belum dimanfaatkan berbeda 60 kg," katanya sambil tersenyum.',
['Dari 120 kg sampah desa, sebagian dimanfaatkan dan sisanya belum dimanfaatkan. Selisih berat keduanya 60 kg. Jika x = kg sampah yang dimanfaatkan dan y = kg yang belum dimanfaatkan, berapa persen sampah yang dimanfaatkan?',['60%','70%','75%','80%'],2,'Model SPLDV: x + y = 120 dan x − y = 60. Jumlahkan kedua persamaan: 2x = 180, jadi x = 90 kg dan y = 30 kg. Persentase dimanfaatkan = 90/120 × 100% = 75%.',1],
['Pengepul biasanya menolak botol yang sangat kotor karena ...',['Sulit diproses dan menurunkan kualitas','Terlalu cantik','Terlalu ringan','Terlalu mahal'],0,'Kebersihan memengaruhi kualitas dan harga.'],
['Langkah pertama mendirikan bank sampah di desa adalah ...',['Sosialisasi dan mengajak warga memilah','Membakar sampah','Membeli truk','Menutup selokan'],0,'Dimulai dari kesadaran dan kebiasaan warga.'],
['Kebiasaan ramah lingkungan paling mudah dimulai dari ...',['Diri sendiri dan keluarga','Orang lain saja','Menunggu pemerintah','Besok saja'],0,'Perubahan dimulai dari kebiasaan kecil sendiri.'],
['Kesimpulan terbaik dari petualangan Rani adalah ...',['Sampah dipilah, dijual, dan diolah bisa jadi manfaat dan uang','Sampah tidak berguna','Sampah cukup dibakar','Sampah urusan orang lain'],0,'Sampah bukan akhir. Ia bisa jadi awal yang baru.'],
'park|Kakek mengeluarkan sebuah lencana kecil dari saku bajunya. "Ini milik Kakek dulu, saat masih bertugas. Sekarang jadi milikmu, Penjaga Bumi." Rani menerimanya dengan mata berkaca-kaca.',
'park|Rani menatap langit jingga. "Aku sadar, sampah bukan akhir. Ia bisa jadi awal baru." Bima berteriak, "Kak Rani, kita jadi juara lomba!" Desa Sumberjaya pun tak lagi sama.'
]}];

/* ===== MESIN PETUALANGAN ===== */
const MAXLIFE=5,GY=250,FY=410,CS=1.8,cv=$('cv'),g=cv.getContext('2d');
let streak=0,firstOk=0,wrongCount=0,parts=[],banner=null,C=0,steps=[],si=0,scene='home',ox=0,ph=0,mode='menu',txt='',typed=0,wait=0,speaking=false,cu=null,bub=null,trans=0,jmp={},lastT=0,sgn=1,cq=null,tried=false,qn=0,qt=0,prog=0,storyHistory=[],dialogueQueue=[],pose='walk',poseUntil=0,actionCaption='',lastDialogue=null;
try{prog=+localStorage.ecoProg||0}catch(e){}
const rnd=a=>a[Math.floor(Math.random()*a.length)];
/* ---- suara sintetis (tanpa file) ---- */
let AC;function ac(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,ty,v,t0,f2){if(!S.sfx)return;const a=ac();if(!a)return;const o=a.createOscillator(),n=a.createGain(),t=a.currentTime+(t0||0);o.type=ty||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);n.gain.setValueAtTime(v||.1,t);n.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(n);n.connect(a.destination);o.start(t);o.stop(t+d)}
function stepSnd(){if(!S.sfx)return;const a=ac();if(!a)return;const L=a.sampleRate*.06,b=a.createBuffer(1,L,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*(1-i/L);const s=a.createBufferSource(),n=a.createGain(),f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=600;n.gain.value=.2;s.buffer=b;s.connect(f);f.connect(n);n.connect(a.destination);s.start()}
const laughS=()=>[0,.17,.34,.51].forEach((t,i)=>tone(560-i*45,.14,'square',.06,t,400-i*30));
const bird=()=>{tone(2300,.08,'sine',.04,0,3100);tone(2700,.08,'sine',.04,.12,3400)};
const whoosh=()=>tone(250,.5,'sawtooth',.03,0,1400);
function sfx2(ok){const a=SFX[ok?'good':'bad'];if(a&&!a.broken)sfx(ok?'good':'bad');else ok?[660,880,1320].forEach((f,i)=>tone(f,.25,'triangle',.1,i*.09)):tone(220,.5,'sawtooth',.08,0,110)}
/* ---- suara narator & dialog (Text-to-Speech peramban) ---- */
function stopSpeech(){speaking=false;cu=null;try{speechSynthesis.cancel()}catch(e){}}
function speak(t,w){speaking=false;try{if(!S.voice||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='id-ID';u.rate=w==='n'?.95:1.05;u.pitch={n:1,bima:1.9,kakek:.72,rani:1.25}[w]||1;cu=u;speaking=true;u.onend=u.onerror=()=>{if(cu===u)speaking=false};setTimeout(()=>{if(cu===u)speaking=false},30000);speechSynthesis.speak(u)}catch(e){speaking=false}}
function say(who,t,d){bub={who,t:d||3.5,text:t};speak(t,who)}
/* ---- alur game ---- */
function startGame(){$('chList').innerHTML=CH.map((c,i)=>`<button class="menu-btn" ${i>prog?'disabled':''} onclick="startChapter(${i})"><span>${['🏘️','♻️','🌍'][i]}</span>${c.n}<small>${i>prog?'🔒 Selesaikan chapter sebelumnya terlebih dahulu':c.d}</small></button>`).join('');showScreen('chapters')}
function startChapter(i){document.body.classList.remove('ending');ac();C=i;steps=CH[i].steps;si=0;storyHistory=[];dialogueQueue=[];pose='walk';score=0;streak=0;firstOk=0;parts=[];banner=null;qn=0;qt=steps.filter(s=>typeof s!=='string').length;scene='home';bub=null;ox=0;
$('actionCaption').textContent='Mereka bersiap memulai perjalanan.';$('playingAs').textContent=player+' '+avatar;$('qTitle').textContent=CH[i].n;$('score').textContent=0;$('fade').classList.remove('on');showScreen('game');next()}
function showStory(text,who='narrator',sceneKey=scene,action='walk'){
 txt=text;typed=0;wait=0;mode='story';pose=action;poseUntil=performance.now()+3600;lastDialogue={text,who,scene:sceneKey,action};
 const names={rani:'Rani',bima:'Bima',kakek:'Kakek Darto',narrator:'Narasi'};
 $('box').innerHTML=`<b class="speaker-name">${names[who]||'Narasi'}</b><span class="dialogue-line"></span>`;
 $('actionCaption').textContent=actionText(action);
 if(who!=='narrator')speak(text,who);else speak(text,'n');
}
function actionText(a){return ({walk:'🚶 Mereka berjalan bersama.',sort:'♻️ Rani dan Bima memilah sampah.',hold:'🧺 Bima sedang memegang karung.',write:'✍️ Rani sedang mencatat hasil.',throw:'🗑️ Sampah dimasukkan ke tempat yang sesuai.',point:'👉 Kakek sedang menunjukkan sesuatu.',crouch:'🧎 Rani memeriksa sampah di dekat tanah.',pick:'🤲 Mereka mengambil sampah untuk dipilah.',sit:'🪑 Mereka duduk beristirahat.'})[a]||'Mereka melanjutkan kegiatan.'}
function actionFor(text){const t=text.toLowerCase();if(/mencatat|menulis|catat/.test(t))return 'write';if(/memegang|membawa karung|menjinjing|mengangkat/.test(t))return 'hold';if(/membuang|memasukkan ke tong|memasukkan sampah/.test(t))return 'throw';if(/memilah|memisahkan/.test(t))return 'sort';if(/menunjuk|menunjukkan|menjelaskan/.test(t))return 'point';if(/jongkok|berjongkok|memeriksa.*tanah/.test(t))return 'crouch';if(/mengambil|memungut/.test(t))return 'pick';if(/duduk|beristirahat/.test(t))return 'sit';return 'walk'}
function next(){
 stopSpeech();
 if(dialogueQueue.length){const d=dialogueQueue.shift();showStory(d.text,d.who,scene,d.action||'walk');return}
 if(si>=steps.length)return endCh();
 const s=steps[si++];$('progress').style.width=(si/steps.length*100)+'%';
 if(typeof s==='string'){
  const [sc,t]=s.split('|');
  storyHistory.push({scene:sc,text:t});$('prevDialogueBtn').disabled=storyHistory.length<2;
  if(sc!==scene||si===1){scene=sc;trans=1;whoosh();banner={t:3.4,text:'📍 '+LOC[sc]}}
  const pool=TALK[sc]||TALK.home;
  const action=actionFor(t);
  const offset=si%pool.length;dialogueQueue=[pool[offset],pool[(offset+1)%pool.length]].map((d,i)=>({who:d[0],text:d[1],action:i===0?action:'walk'}));
  showStory(t,'narrator',sc,action);
  $('qp').innerHTML='<div class="question-box idle">💬 Dengarkan percakapan mereka. Ketuk teks untuk melanjutkan.</div>';
 } else ask(s)
}
function ask(s){$('prevDialogueBtn').disabled=true;mode='q';cq=s;tried=false;wrongCount=0;qn++;$('qTag').textContent=`SOAL ${qn} / ${qt}`;$('box').textContent='⏸ Perjalanan berhenti. Jawab pertanyaan di bawah untuk melanjutkan.';
$('qp').innerHTML=`<div class="question-box"><span class="tag">${s[4]?'🧮 SOAL SPLDV':'💡 PEMAHAMAN'}</span><h3>${s[0]}</h3></div><div class="answers">${s[1].map((o,i)=>`<button class="answer" onclick="ans(${i},this)"><span class="ab">${String.fromCharCode(65+i)}</span><span>${o}</span></button>`).join('')}</div><div class="feedback" id="feedback">Pilih satu jawaban yang menurutmu benar.</div><div class="actions"><button class="btn-main hidden" id="nextBtn" onclick="next()">LANJUTKAN PERJALANAN →</button></div>`;
$('qp').scrollIntoView({behavior:'smooth',block:'nearest'})}
function ans(i,b){if(mode!=='q')return;const q=cq,all=document.querySelectorAll('.answer');
if(i===q[2]){mode='a';const pt=tried?5:10;score+=pt;if(tried)streak=0;else{streak++;firstOk++}all.forEach(x=>x.disabled=true);b.classList.add('good');
$('feedback').innerHTML=`<b style="color:#8df0ae">BENAR! +${pt} POIN</b><br>`+q[3];
sfx2(true);burst(true);say('kakek',rnd(ANSWER_LINES),2.8);pop(480,FY-205,'+'+pt,'#ffe36b');sparkle(480,FY-110);$('nextBtn').classList.remove('hidden')}
else{tried=true;wrongCount++;streak=0;b.disabled=true;b.classList.add('bad');sfx2(false);burst(false);laughS();
const tease=wrongCount>=2?'Hahaha! Sudah dua kali masih salah juga? Ayo, coba pikirkan baik-baik sebelum memilih!':'Hehehe! Wah, jawabanmu belum tepat. Coba lagi, jangan asal pilih!';
$('feedback').innerHTML=`<b style="color:#ffb3a8">BELUM TEPAT</b><br><b style="color:#ffd27a">Bima: “${tease}”</b><br>Kakek: “Coba perhatikan petunjuk ini.”<br>${q[3]}<br><small>Kamu masih bisa memilih jawaban lain. Jawaban benar setelah mencoba lebih dari sekali mendapat 5 poin.</small>`;
 say('bima',tease,3.5);setTimeout(()=>{if(mode==='q')say('kakek','Coba perhatikan petunjuknya. '+q[3],6)},1900)}
$('score').textContent=score}
function endCh(){mode='end';stopSpeech();const last=C===CH.length-1,tot=qt*10,pct=score/tot,st=pct>=.85?3:pct>=.6?2:1;
if(C+1>prog&&!last){prog=C+1;try{localStorage.ecoProg=prog}catch(e){}}
const M=pct>=.85?['Luar biasa! Kamu benar-benar Penjaga Bumi sejati!','Kakek bangga sekali padamu. Pertahankan semangatmu, Nak!']:pct>=.6?['Bagus sekali! Sedikit lagi sempurna. Terus semangat ya!','Kamu sudah paham banyak hal. Teliti lagi di bagian hitungan ya.']:pct>=.35?['Tidak apa-apa, Nak. Setiap kesalahan adalah langkah menuju paham. Yuk terus belajar!','Perhatikan ceritanya baik-baik, petunjuk jawabannya ada di sana.']:['Jangan menyerah! Bumi saja butuh waktu untuk pulih, kamu pun boleh belajar pelan-pelan.','Kakek percaya kamu bisa. Kita jalan bersama lagi ya!'];
$('ft').innerHTML=`<div class="stars">${[0,1,2].map(i=>`<span style="animation-delay:${4.5+i*.5}s" class="${i<st?'on':''}">★</span>`).join('')}</div><h2>${CH[C].n} selesai!</h2><p class="kk">🧓 Kakek: "${rnd(M)}"</p>`;
$('fb2').textContent='Lanjutkan ke Chapter Selanjutnya →';$('fb2').classList.toggle('hidden',last);$('fb2').onclick=()=>{if(!last&&mode==='end')startChapter(C+1)};$('fb3').textContent='🏠 Kembali ke Lobby';$('fb3').onclick=()=>{document.body.classList.remove('ending');mode='menu';stopSpeech();$('fade').classList.remove('on');showScreen('home')};
const bar=$('fb2').parentElement;bar.classList.add('endbar');let sb=$('endScore');if(!sb){sb=document.createElement('div');sb.id='endScore';bar.prepend(sb)}sb.innerHTML=`<b>⭐ Skor ${score} / ${tot}</b><small>Benar percobaan pertama: ${firstOk} dari ${qt}</small>`;
document.body.classList.add('ending');const eb=[$('fb2'),$('fb3')];eb.forEach(b=>b.disabled=true);setTimeout(()=>{if(mode==='end')eb.forEach(b=>b.disabled=false)},5200);
$('fade').classList.add('on');[523,659,784,1047].forEach((f,i)=>tone(f,.5,'triangle',.1,i*.18));if(pct>=.6)burst(true)}
const LOC={home:'Rumah Rani',street:'Gang Kampung',tps:'Tempat Pengepul Bu Marni',market:'Pasar Desa',work:'Bengkel Kakek',park:'Taman Desa'};
function pop(x,y,t,c){parts.push({x,y,vx:0,vy:-45,l:1.4,m:1.4,t,c})}
function sparkle(x,y){for(let i=0;i<16;i++){const a=Math.random()*6.28,v=60+Math.random()*130;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-50,l:.95,m:.95,t:'✦',c:rnd(['#ffe36b','#8df0ae','#fff'])})}}
function puff(x,y){parts.push({x,y,vx:-70,vy:-14,l:.55,m:.55,r:6,c:'rgba(255,255,255,.65)'})}
function previousDialogue(){if(!lastDialogue||mode==='end')return;stopSpeech();dialogueQueue=[];scene=lastDialogue.scene;showStory(lastDialogue.text,lastDialogue.who,lastDialogue.scene,lastDialogue.action);typed=txt.length;wait=0}
function quitGame(){mode='menu';stopSpeech();startGame()}
$('box').onclick=()=>{if(mode!=='story')return;if(typed<txt.length)typed=txt.length;else next()};
/* ---- gambar ---- */
const PAL={home:['#7fd0f2','#fff1c9','#7dbb62','#e6d3a3'],street:['#9ccfe8','#f2ecd5','#8fb46f','#bdb59a'],tps:['#c9c3a8','#efe6c8','#968f6c','#a89f7e'],market:['#f6c97a','#fde9bd','#b9a461','#d9c38b'],work:['#b8dcc0','#eef5de','#86b26e','#cdbf99'],park:['#f08a5d','#ffd29a','#6fae6a','#c7b98a']};
function rep(sp,gap,fn){const o=(ox*sp)%gap,b=Math.floor(ox*sp/gap);for(let k=-1;k*gap-o<960+gap;k++)fn(k*gap-o,b+k)}
function hill(c,off,amp,sp,y){g.fillStyle=c;g.beginPath();g.moveTo(0,480);for(let x=0;x<=960;x+=20)g.lineTo(x,y+Math.sin((x+ox*sp)/100+off)*amp);g.lineTo(960,480);g.fill()}
function cloud(x,y){g.beginPath();g.arc(x,y,20,0,7);g.arc(x+26,y-10,28,0,7);g.arc(x+58,y,20,0,7);g.fill()}
function tree(x,s){g.fillStyle='#6b4a2b';g.fillRect(x-5*s,-45*s,10*s,45*s);g.fillStyle='#3f8f4f';g.beginPath();g.arc(x,-62*s,30*s,0,7);g.arc(x-18*s,-45*s,20*s,0,7);g.arc(x+18*s,-45*s,20*s,0,7);g.fill()}
function bin(x,c,l){g.fillStyle=c;g.fillRect(x,-52,36,52);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-3,-58,42,8);g.fillStyle='#fff';g.font='bold 12px sans-serif';g.fillText(l,x+6,-24)}
function prop(k){if(k==='home'){g.fillStyle='#f1e2c0';g.fillRect(0,-95,120,95);g.fillStyle='#b4533b';g.beginPath();g.moveTo(-12,-95);g.lineTo(60,-148);g.lineTo(132,-95);g.fill();g.fillStyle='#6b4a2b';g.fillRect(48,-55,26,55);g.fillStyle='#9fd6ee';g.fillRect(12,-72,24,24);g.fillRect(88,-72,24,24);bin(145,'#3a9a52','Org')}
else if(k==='street'){bin(0,'#3a9a52','Org');bin(46,'#e0b82a','Ana');bin(92,'#c9473a','B3');g.fillStyle='#4e5f58';g.fillRect(150,-110,5,110);g.fillStyle='#ffe58a';g.beginPath();g.arc(152,-114,10,0,7);g.fill()}
else if(k==='tps'){g.fillStyle='#7a6f55';g.fillRect(0,-85,150,85);g.fillStyle='#fdf3d0';g.fillRect(10,-78,130,24);g.fillStyle='#1d2b26';g.font='bold 14px sans-serif';g.fillText('PENGEPUL',38,-61);['#4aa3d9','#c9a46b','#b5b5b5','#4aa3d9','#d9d9d9'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(8+i*27,-40,23,40)})}
else if(k==='market'){g.fillStyle='#c9473a';g.fillRect(0,-95,120,18);g.fillStyle='#fff';for(let i=0;i<5;i++)g.fillRect(i*24,-95,12,18);g.fillStyle='#6b4a2b';g.fillRect(6,-77,5,77);g.fillRect(109,-77,5,77);g.fillStyle='#e8a21a';g.fillRect(10,-32,100,32);g.fillStyle='#d94;';g.fillStyle='#e0603a';for(let i=0;i<4;i++){g.beginPath();g.arc(25+i*24,-38,9,0,7);g.fill()}}
else if(k==='work'){g.fillStyle='#8a6a45';g.fillRect(0,-85,130,85);g.fillStyle='#4e5f58';g.fillRect(-9,-98,148,14);g.fillStyle='#fdf3d0';g.fillRect(14,-66,52,32);g.fillStyle='#3a9a52';g.fillRect(150,-60,40,60);g.fillStyle='#2b6e3a';g.fillRect(146,-66,48,9)}
else{g.fillStyle='#6b4a2b';g.fillRect(0,-28,70,8);g.fillRect(4,-20,6,20);g.fillRect(60,-20,6,20);g.fillRect(0,-48,70,6);g.fillStyle='#4e5f58';g.fillRect(105,-100,5,100);g.fillStyle='#ffe58a';g.beginPath();g.arc(108,-104,10,0,7);g.fill();['#e85d75','#f5c542','#d77fe0'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(140+i*14,-10-i%2*5,6,0,7);g.fill()})}}
function person(x,y,s,o){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,2,26,7,0,0,7);g.fill();
g.translate(0,-(o.j||0));const sw=Math.sin(o.p)*13;g.translate(0,o.w?Math.abs(Math.sin(o.p))*-4:Math.sin(lastT/450)*-1.5);g.lineCap='round';g.lineJoin='round';
g.strokeStyle=o.l||'#3b3b4f';g.lineWidth=8;g.beginPath();if(o.pose==='crouch'||o.pose==='pick'){g.moveTo(-6,-30);g.lineTo(-17,-17);g.lineTo(-22,-3);g.moveTo(6,-30);g.lineTo(17,-17);g.lineTo(22,-3)}else if(o.pose==='sit'){g.moveTo(-6,-30);g.lineTo(-18,-10);g.lineTo(-29,-8);g.moveTo(6,-30);g.lineTo(18,-10);g.lineTo(29,-8)}else{g.moveTo(-6,-30);g.lineTo(-6+sw,-3);g.moveTo(6,-30);g.lineTo(6-sw,-3)}g.stroke();
g.strokeStyle='#3a2a20';g.lineWidth=10;g.beginPath();g.moveTo(-8+sw,-1);g.lineTo(-2+sw,-1);g.moveTo(4-sw,-1);g.lineTo(10-sw,-1);g.stroke();
g.strokeStyle='#f3c9a3';g.lineWidth=7;g.beginPath();
if(o.pose==='write'){g.moveTo(-15,-58);g.lineTo(-20,-43);g.lineTo(3,-49);g.moveTo(15,-58);g.lineTo(12,-43)}
else if(o.pose==='hold'){g.moveTo(-15,-58);g.lineTo(-23,-39);g.lineTo(-7,-30);g.moveTo(15,-58);g.lineTo(23,-39);g.lineTo(7,-30)}
else if(o.pose==='throw'){g.moveTo(-15,-58);g.lineTo(-20,-40);g.moveTo(15,-58);g.lineTo(29,-68);g.lineTo(40,-83)}
else if(o.pose==='point'){g.moveTo(-15,-58);g.lineTo(-20,-38);g.moveTo(15,-58);g.lineTo(31,-72);g.lineTo(48,-76)}
else if(o.pose==='crouch'||o.pose==='pick'){g.moveTo(-15,-58);g.lineTo(-22,-37);g.lineTo(-34,-22);g.moveTo(15,-58);g.lineTo(23,-38);g.lineTo(31,-23)}
else{g.moveTo(-15,-58);g.lineTo(-17-sw*.7,-36);g.moveTo(15,-58);g.lineTo(17+sw*.7,-36)}g.stroke();
if(o.pose==='write'){g.fillStyle='#f5e7b0';g.fillRect(-2,-51,20,15);g.strokeStyle='#8a6a45';g.lineWidth=1;g.strokeRect(-2,-51,20,15);g.beginPath();g.moveTo(2,-47);g.lineTo(14,-47);g.moveTo(2,-43);g.lineTo(12,-43);g.stroke()}
if(o.pose==='hold'){g.fillStyle='#9b7045';g.fillRect(-10,-34,20,20);g.fillStyle='#d5b078';g.fillRect(-7,-31,14,14)}
if(o.pose==='throw'){g.fillStyle='#e8d7a4';g.beginPath();g.arc(45,-86,6,0,7);g.fill();g.strokeStyle='#e8d7a4';g.lineWidth=2;g.beginPath();g.moveTo(30,-77);g.lineTo(39,-83);g.stroke()}
g.fillStyle=o.c;g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.beginPath();g.roundRect(-16,-66,32,40,10);g.fill();g.stroke();
g.fillStyle='#f3c9a3';g.beginPath();g.arc(0,-86,21,0,7);g.fill();g.stroke();
if(o.k==='r'){g.fillStyle='#2a1a10';g.beginPath();g.arc(0,-88,22,Math.PI,0);g.fill();g.beginPath();g.arc(-25,-78,8,0,7);g.arc(25,-78,8,0,7);g.fill();g.fillStyle='#e8405a';g.beginPath();g.arc(-21,-93,5,0,7);g.arc(21,-93,5,0,7);g.fill()}
else if(o.k==='b'){g.fillStyle='#2a1a10';g.fillRect(-21,-92,6,14);g.fillStyle='#2a7fd0';g.beginPath();g.arc(0,-90,22,Math.PI,0);g.fill();g.fillRect(-2,-93,30,6)}
else{g.fillStyle='#f2f2f2';g.beginPath();g.arc(0,-90,22,Math.PI,0);g.fill();g.fillRect(-22,-90,6,16);g.fillRect(16,-90,6,16);g.beginPath();g.ellipse(0,-67,12,9,0,0,7);g.fill();g.strokeStyle='#444';g.lineWidth=2;g.beginPath();g.arc(-7,-86,6,0,7);g.moveTo(13,-86);g.arc(7,-86,6,0,7);g.stroke();g.strokeStyle='#6b4a2b';g.lineWidth=4;g.beginPath();g.moveTo(26,-48);g.lineTo(28,-2);g.stroke()}
g.fillStyle='#222';g.beginPath();g.ellipse(-7,-85,3,4.5,0,0,7);g.ellipse(7,-85,3,4.5,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(-8,-88,2,2);g.fillRect(6,-88,2,2);
g.fillStyle='rgba(245,120,120,.45)';g.beginPath();g.arc(-13,-77,4,0,7);g.arc(13,-77,4,0,7);g.fill();
g.strokeStyle='#8a3b2a';g.lineWidth=2;g.beginPath();if(o.m){g.ellipse(0,-76,5,5,0,0,7);g.fillStyle='#8a3b2a';g.fill()}else if(o.e){g.arc(0,-79,6,.1,3.04);g.stroke();g.beginPath();g.fillStyle='#fff';g.arc(0,-78,5,.1,3.04);g.fill()}else g.arc(0,-79,4,.2,2.9);g.stroke();g.restore()}
function wrap(t,mw){const w=t.split(' ');let L=[],c='';w.forEach(x=>{const n=c?c+' '+x:x;if(g.measureText(n).width>mw&&c){L.push(c);c=x}else c=n});L.push(c);return L}
function bubble(x,y,t){g.font='bold 19px Nunito,sans-serif';const L=wrap(t,330),w=Math.max(...L.map(l=>g.measureText(l).width))+26,h=L.length*25+14,bx=Math.min(Math.max(x-w/2,8),952-w),by=Math.max(6,y-h-16);g.fillStyle='#fff';g.beginPath();g.roundRect(bx,by,w,h,12);g.fill();g.beginPath();g.moveTo(x-8,by+h-1);g.lineTo(x,by+h+13);g.lineTo(x+8,by+h-1);g.fill();g.fillStyle='#1d2b26';L.forEach((l,i)=>g.fillText(l,bx+13,by+26+i*25))}
function draw(){const p=PAL[scene];let gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);g.fillStyle=gr;g.fillRect(0,0,960,480);
g.fillStyle='#fff6b0';g.beginPath();g.arc(810,95,44,0,7);g.fill();g.fillStyle='rgba(255,255,255,.85)';rep(.12,340,(x,i)=>cloud(x,55+(i%3)*38));
g.strokeStyle='rgba(40,50,60,.55)';g.lineWidth=2;rep(.3,470,(x,i)=>{const y=80+Math.abs(i%4)*24,f=Math.sin(lastT/160+i)*5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+7,y-f-4,x+14,y);g.quadraticCurveTo(x+21,y-f-4,x+28,y);g.stroke()});hill('#8ec7a0',0,24,.08,205);hill('#6fae86',2,18,.22,250);
g.save();g.translate(0,GY+18);rep(.5,210,(x,i)=>{if(scene!=='tps')tree(x,.7+Math.abs(i%3)*.12)});g.restore();
g.fillStyle=p[2];g.fillRect(0,GY+18,960,300);g.fillStyle=p[3];g.fillRect(0,GY+95,960,92);
rep(1,620,(x)=>{g.save();g.translate(x,GY+62);g.scale(1.15,1.15);prop(scene);g.restore()});
if(scene==='street'||scene==='tps')rep(1,150,(x,i)=>{g.fillStyle=Math.abs(i)%2?'#5aa3d9':'#c9a46b';g.fillRect(x,GY+150+Math.abs(i)%3*8,12,18)});
const w=mode==='story',J=k=>0;
const activePose=performance.now()<poseUntil?pose:'walk';
const pk=activePose==='point'?'point':'walk',pb=['hold','throw'].includes(activePose)?activePose:'walk',pr=['write','sort','crouch','pick','sit'].includes(activePose)?activePose:'walk';
person(165,FY,1.05*CS,{c:'#8a6a45',k:'k',p:ph+3,w,l:'#5b4a3a',pose:pk});person(320,FY,.8*CS,{c:'#f0b429',k:'b',p:ph+1.5,w,pose:pb});person(480,FY,CS,{c:'#e8506a',k:'r',p:ph,w,pose:pr});
if(bub){const X={kakek:165,bima:320,rani:480}[bub.who],H={kakek:1.05,bima:.8,rani:1}[bub.who];if(X)bubble(X,FY-108*H*CS-4,bub.text)}
if(mode==='q'||mode==='a'){g.fillStyle='rgba(10,20,40,.18)';g.fillRect(0,0,960,480);if(mode==='q'){g.font='bold 46px Nunito,sans-serif';g.fillStyle='#ffe36b';g.fillText('?',468+Math.sin(lastT/200)*3,FY-205)}}
parts.forEach(p=>{g.globalAlpha=Math.max(0,p.l/p.m);if(p.t){g.fillStyle=p.c;g.font='bold 28px Nunito,sans-serif';g.fillText(p.t,p.x,p.y)}else{g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r*(2-p.l/p.m),0,7);g.fill()}g.globalAlpha=1});
let vg=g.createRadialGradient(480,240,240,480,240,600);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=vg;g.fillRect(0,0,960,480);
if(banner){const a=Math.min(1,banner.t*2,(3.4-banner.t)*3);g.globalAlpha=Math.max(0,a);g.font='bold 20px Nunito,sans-serif';const w=g.measureText(banner.text).width+36;g.fillStyle='rgba(15,48,58,.9)';g.beginPath();g.roundRect(16-(1-a)*40,16,w,40,20);g.fill();g.fillStyle='#fdf6dc';g.fillText(banner.text,34-(1-a)*40,43);g.globalAlpha=1}
if(trans>0){g.fillStyle=`rgba(0,0,0,${trans})`;g.fillRect(0,0,960,480)}}
function loop(t){const dt=Math.min(.05,(t-lastT)/1000||0);lastT=t;
if($('game').classList.contains('active')){
if(mode==='story'){ox+=85*dt;ph+=dt*9;typed=Math.min(txt.length,typed+dt*(S.voice?20:34));const s=Math.sign(Math.sin(ph));if(s!==sgn){sgn=s;stepSnd();puff(462,FY)}
if(Math.random()<dt*.15&&scene!=='tps')bird();const line=$('box').querySelector('.dialogue-line');if(line)line.textContent=txt.slice(0,typed|0);else $('box').textContent=txt.slice(0,typed|0);
if(typed>=txt.length){wait+=dt;if(!speaking&&wait>(S.voice&&window.speechSynthesis?1:2+txt.length/70))next()}}
if(bub){bub.t-=dt;if(bub.t<=0)bub=null}if(banner){banner.t-=dt;if(banner.t<=0)banner=null}parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t==='✦')p.vy+=220*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);trans=Math.max(0,trans-dt*1.4);for(const k in jmp)jmp[k]=Math.max(0,jmp[k]-dt*1.6);draw()}
requestAnimationFrame(loop)}
requestAnimationFrame(loop);

function openDeveloper(){$('devCard').innerHTML='<h3>'+esc(DEV.group)+'</h3>'+DEV.members.map((n,i)=>(i+1)+'. '+esc(n)).join('<br>');openModal('team')}
document.querySelectorAll('.modal-bg').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-bg.show').forEach(m=>m.classList.remove('show'))});
init();applyS();
startBgm();['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>startBgm(),{once:true}));

(function(){const st=document.createElement('style');st.textContent=`
#fade{padding-bottom:96px}
#fade .endbar{position:absolute;left:0;right:0;bottom:0;margin:0;padding:12px 16px;background:var(--deep);border-top:2px solid var(--line2);display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
#fade .endbar #endScore{display:flex;flex-direction:column;text-align:left;color:#fff;font-weight:900;font-size:1.15rem;line-height:1.3}
#fade .endbar #endScore small{font-size:.78rem;font-weight:700;color:#bfd5ce}
#fade .endbar .btnrow,#fade .endbar button{margin:0}
#fade .endbar button:disabled{opacity:.35}
body.ending .game-bottom-actions{pointer-events:none;opacity:.35}
@media(max-width:560px){#fade .endbar{flex-direction:column;align-items:stretch;text-align:center}#fade .endbar #endScore{text-align:center}#fade .endbar button{width:100%}}
`;document.head.appendChild(st)})();
