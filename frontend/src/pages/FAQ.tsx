import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Package, CreditCard, Truck, ShieldCheck, Users, Clock } from 'lucide-react';
import { cn } from '../lib/cn';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'Pengiriman Umum',
    icon: <Package className="w-5 h-5" />,
    items: [
      {
        question: 'Berapa lama estimasi waktu pengiriman KurBhan?',
        answer: 'Estimasi waktu pengiriman tergantung pada jenis layanan dan rute. Reguler: 2-4 hari (satu pulau), 4-7 hari (lintas pulau). Express: 1-2 hari. Same Day: di hari yang sama untuk area terjangkau. Estimasi ini dapat berubah karena kondisi cuaca, lalu lintas, atau faktor operasional lainnya.'
      },
      {
        question: 'Bagaimana cara melacak paket saya?',
        answer: 'Anda dapat melacak paket melalui halaman Tracking di website KurBhan. Masukkan nomor resi (format: KB-YYYYMMDD-XXXXXX) pada kolom pencarian. Sistem akan menampilkan status terkini dan riwayat perjalanan paket Anda secara real-time.'
      },
      {
        question: 'Apa saja jenis armada yang tersedia di KurBhan?',
        answer: 'KurBhan menyediakan berbagai jenis armada: Mobil Box Kecil (hingga 1 ton), Mobil Box Sedang (hingga 3 ton), Mobil Box Besar (hingga 5 ton), Truk Tronton Hino (hingga 20 ton), Kargo Laut Lintas Pulau (Kapal Ro-Ro), dan Kargo Udara Kilat (Express Flight).'
      },
      {
        question: 'Apakah KurBhan melayani pengiriman lintas pulau?',
        answer: 'Ya, KurBhan melayani pengiriman ke seluruh Indonesia termasuk lintas pulau. Kami menggunakan armada darat, laut (kapal Ro-Ro), dan udara (kargo kilat) untuk memastikan paket Anda sampai ke tujuan di mana pun di Indonesia.'
      },
      {
        question: 'Bagaimana cara menghitung biaya pengiriman?',
        answer: 'Biaya pengiriman dihitung berdasarkan berat volumetrik atau berat aktual (mana yang lebih besar), jarak tempuh, jenis armada, dan tingkat layanan. Anda dapat menggunakan Kalkulator Tarif di halaman Booking untuk mendapatkan estimasi biaya secara instan sebelum melakukan pemesanan.'
      },
    ],
  },
  {
    title: 'Pembayaran',
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'KurBhan menerima berbagai metode pembayaran: Transfer Bank (BCA, BLU by BCA, Mandiri, BNI, BRI), Virtual Account (BCA VA, Mandiri VA, BNI VA, BRI VA), dan Cash on Delivery (COD). Untuk COD, dikenakan DP minimal 50% saat penjemputan barang.'
      },
      {
        question: 'Bagaimana sistem COD (Cash on Delivery) di KurBhan?',
        answer: 'Untuk pengiriman COD, pengirim wajib membayar DP (Down Payment) minimal 50% dari total biaya pengiriman saat penjemputan barang. Sisa pembayaran dilunasi oleh penerima saat barang diantarkan. Kurir kami akan mencatat pembayaran secara digital.'
      },
      {
        question: 'Berapa lama batas waktu pembayaran Virtual Account?',
        answer: 'Pembayaran melalui Virtual Account memiliki batas waktu 24 jam sejak nomor VA diterbitkan. Jika pembayaran tidak dilakukan dalam waktu tersebut, pesanan akan otomatis dibatalkan dan Anda perlu membuat pesanan baru.'
      },
      {
        question: 'Apakah saya akan mendapat konfirmasi setelah pembayaran?',
        answer: 'Ya, setelah pembayaran terverifikasi, Anda akan mendapatkan konfirmasi berupa status "TERVERIFIKASI" pada halaman Dashboard. Untuk transfer bank manual, verifikasi dilakukan oleh tim admin kami dalam 1x24 jam kerja.'
      },
    ],
  },
  {
    title: 'Armada & Kurir',
    icon: <Truck className="w-5 h-5" />,
    items: [
      {
        question: 'Bagaimana proses penjemputan barang?',
        answer: 'Setelah pembayaran diverifikasi (atau DP untuk COD), kurir kami akan menjemput barang di alamat yang telah Anda tentukan. Anda akan mendapat notifikasi saat kurir menuju lokasi penjemputan. Pastikan barang sudah dikemas dengan baik sebelum penjemputan.'
      },
      {
        question: 'Apakah saya bisa memilih jadwal penjemputan?',
        answer: 'Saat ini penjemputan dilakukan berdasarkan urutan antrian setelah pembayaran terverifikasi. Kami berusaha menjemput barang di hari yang sama untuk pesanan sebelum pukul 14:00 WIB, atau di hari kerja berikutnya untuk pesanan setelah pukul 14:00 WIB.'
      },
      {
        question: 'Bagaimana cara menjadi kurir/driver KurBhan?',
        answer: 'Untuk bergabung sebagai kurir KurBhan, Anda dapat mendaftar melalui aplikasi driver kami (segera hadir) atau menghubungi tim rekrutmen kami. Persyaratan: memiliki SIM yang sesuai, kendaraan dalam kondisi baik, dan berdomisili di area operasional KurBhan.'
      },
    ],
  },
  {
    title: 'Keamanan & Klaim',
    icon: <ShieldCheck className="w-5 h-5" />,
    items: [
      {
        question: 'Bagaimana jika paket saya rusak atau hilang?',
        answer: 'KurBhan bertanggung jawab atas keamanan paket selama dalam pengiriman. Jika terjadi kerusakan atau kehilangan, Anda dapat mengajukan klaim melalui halaman Dashboard dengan menyertakan nomor resi dan bukti foto. Proses klaim akan ditangani dalam 3-5 hari kerja.'
      },
      {
        question: 'Apakah ada asuransi pengiriman?',
        answer: 'Saat ini KurBhan memberikan jaminan dasar untuk setiap pengiriman. Untuk barang bernilai tinggi, kami menyarankan untuk menambahkan packing ekstra dan menuliskan label "FRAGILE" pada kemasan. Fitur asuransi tambahan akan segera tersedia.'
      },
      {
        question: 'Bisakah saya membatalkan pengiriman?',
        answer: 'Pengiriman dapat dibatalkan selama status masih PENDING (belum dijemput kurir). Setelah status berubah menjadi PICKED_UP atau lebih, pembatalan tidak dapat dilakukan. Refund untuk pembatalan akan diproses dalam 3-7 hari kerja.'
      },
    ],
  },
  {
    title: 'Akun & Bisnis',
    icon: <Users className="w-5 h-5" />,
    items: [
      {
        question: 'Apakah ada harga khusus untuk pelaku bisnis/UMKM?',
        answer: 'Ya, KurBhan menyediakan program khusus untuk pelaku bisnis dan UMKM. Dengan volume pengiriman tertentu, Anda bisa mendapatkan tarif khusus yang lebih kompetitif. Hubungi tim bisnis kami untuk informasi lebih lanjut tentang program kemitraan.'
      },
      {
        question: 'Bagaimana cara mendaftar akun KurBhan?',
        answer: 'Anda dapat mendaftar melalui halaman Register di website KurBhan. Cukup masukkan nama lengkap, email, nomor telepon, dan buat password. Setelah registrasi berhasil, Anda langsung bisa mulai membuat pengiriman.'
      },
      {
        question: 'Apakah data saya aman di KurBhan?',
        answer: 'Keamanan data pengguna adalah prioritas kami. KurBhan menggunakan enkripsi untuk seluruh data sensitif, autentikasi JWT yang aman, dan tidak menyimpan data pembayaran secara langsung. Kami mematuhi standar keamanan data yang berlaku.'
      },
    ],
  },
  {
    title: 'Estimasi & Tarif',
    icon: <Clock className="w-5 h-5" />,
    items: [
      {
        question: 'Mengapa tarif KurBhan bisa lebih murah dari kompetitor?',
        answer: 'KurBhan menerapkan model tarif transparan tanpa biaya tersembunyi. Kami mengoptimalkan rute pengiriman, menggunakan teknologi kalkulasi volumetrik yang akurat, dan memiliki jaringan armada sendiri sehingga dapat menekan biaya operasional. Anda bahkan bisa membandingkan tarif kami dengan kompetitor secara langsung di halaman Booking.'
      },
      {
        question: 'Apa itu berat volumetrik dan bagaimana cara menghitungnya?',
        answer: 'Berat volumetrik adalah perhitungan berat berdasarkan dimensi paket (Panjang × Lebar × Tinggi dalam cm) dibagi 6.000. Biaya pengiriman dihitung dari berat mana yang lebih besar antara berat aktual dan berat volumetrik. Ini memastikan tarif yang adil untuk paket berukuran besar tapi ringan.'
      },
    ],
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn("faq-accordion", isOpen && "open")}>
      <button type="button" className="faq-accordion-trigger" onClick={onToggle}>
        <span className="faq-question">{item.question}</span>
        <ChevronDown className={cn("faq-chevron", isOpen && "rotate")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="faq-answer-wrap"
          >
            <p className="faq-answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="faq-root">
      <div className="faq-header">
        <span className="section-eyebrow">PUSAT BANTUAN</span>
        <h1 className="faq-title">Pertanyaan yang Sering Diajukan</h1>
        <p className="faq-subtitle">
          Temukan jawaban untuk pertanyaan umum seputar layanan logistik dan pengiriman KurBhan.
        </p>
      </div>

      <div className="faq-grid">
        {FAQ_DATA.map((category) => (
          <div key={category.title} className="faq-category">
            <div className="faq-category-header">
              <div className="faq-category-icon">{category.icon}</div>
              <h2 className="faq-category-title">{category.title}</h2>
            </div>
            <div className="faq-list">
              {category.items.map((item) => {
                const key = `${category.title}-${item.question}`;
                return (
                  <FAQAccordion
                    key={key}
                    item={item}
                    isOpen={openItems.has(key)}
                    onToggle={() => toggleItem(key)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-contact-box">
        <HelpCircle className="w-6 h-6 text-[var(--kb-hazard)]" />
        <div>
          <h3 className="faq-contact-title">Masih punya pertanyaan?</h3>
          <p className="faq-contact-text">
            Hubungi tim support KurBhan melalui email <strong>support@kurbhan.co.id</strong> atau 
            telepon <strong>021-5050-KBHN</strong> (Senin–Sabtu, 08:00–20:00 WIB).
          </p>
        </div>
      </div>
    </div>
  );
}

