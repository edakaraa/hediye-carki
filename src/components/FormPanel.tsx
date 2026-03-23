import type { ChangeEvent, FC, Dispatch, SetStateAction } from 'react';

// Sabit seçenekler
const availableAges = ["0-12", "13-17", "18-25", "26-40", "41-60", "60+"];
const availableGenders = ["Kadın", "Erkek", "Fark etmez"];
const availableBudgets = ["100-250₺", "250-500₺", "500-1K₺", "1K-2.5K₺", "2.5K₺+"];
const availableOccasions = ["Doğum Günü", "Yılbaşı", "Sevgililer Günü", "Mezuniyet", "Evlilik", "Teşekkür", "Sürpriz"];

// Dinamik çark için mevcut ilgi alanları (Kategoriler)
const availableInterests = ["Teknoloji", "Spor", "Kitap", "Müzik", "Yemek", "Moda", "Seyahat", "Sanat", "Oyun", "Doğa", "Ev & Yaşam", "Kişisel Bakım", "Hobi & Aktivite", "Deneyim", "Aksesuar & Stil", "Yiyecek & İçecek"];

type FormData = {
  yas: string;
  cinsiyet: string;
  ilgiAlanlari: string[];
  butce: string;
  vesile: string;
  ekstraNot: string;
};

type SingleKey = 'yas' | 'cinsiyet' | 'butce' | 'vesile';
type FormDataStringKey = SingleKey | 'ekstraNot';

interface FormPanelProps {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  handleSpin: () => void;
  isSpinning: boolean;
  aiLoading: boolean;
}

const FormPanel: FC<FormPanelProps> = ({ formData, setFormData, handleSpin, isSpinning, aiLoading }) => {
  // Input değişikliklerini işle
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const key = e.target.name as FormDataStringKey;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Çoklu seçim toggle (İlgi Alanları için)
  const handleToggleMultiple = (value: string) => {
    setFormData((prev) => {
      const updatedArray = prev.ilgiAlanlari.includes(value)
        ? prev.ilgiAlanlari.filter((i) => i !== value)
        : [...prev.ilgiAlanlari, value];
      return { ...prev, ilgiAlanlari: updatedArray };
    });
  };

  // Tekli seçim toggle (Yaş, Cinsiyet, Bütçe, Vesile için)
  const handleToggleSingle = (key: SingleKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // En az 2 kategori seçilmiş mi kontrolü
  const canSpin = formData.ilgiAlanlari.length >= 2;

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Kişi Bilgileri</h2>

      {/* Yaş Aralığı */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">YAŞ ARALIĞI</label>
        <div className="flex flex-wrap gap-2">
          {availableAges.map(age => (
            <button
              key={age}
              onClick={() => handleToggleSingle('yas', age)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${formData.yas === age ? 'bg-amber-400 text-black font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Cinsiyet */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">CİNSİYET</label>
        <div className="flex flex-wrap gap-2">
          {availableGenders.map(gender => (
            <button
              key={gender}
              onClick={() => handleToggleSingle('cinsiyet', gender)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${formData.cinsiyet === gender ? 'bg-amber-400 text-black font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* İlgi Alanları (Dinamik Çark Kategorileri) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">
          HEDİYEYİ ALAN KİŞİNİN İLGİ ALANLARI{" "}
          <span className="text-xs text-slate-500">(Çarka Eklenecek Kategoriler - En az 2 tane)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map(interest => (
            <button
              key={interest}
              onClick={() => handleToggleMultiple(interest)}
              // Kullanıcı istediği kadar kategori seçebilir (spin için min 2 şart)
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                formData.ilgiAlanlari.includes(interest)
                  ? "bg-amber-400 text-black font-medium"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Bütçe */}
       <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">BÜTÇE ARALIĞI</label>
        <div className="flex flex-wrap gap-2">
          {availableBudgets.map(budget => (
            <button
              key={budget}
              onClick={() => handleToggleSingle('butce', budget)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${formData.butce === budget ? 'bg-amber-400 text-black font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {budget}
            </button>
          ))}
        </div>
      </div>

      {/* Vesile */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">VESİLE</label>
        <div className="flex flex-wrap gap-2">
          {availableOccasions.map(occasion => (
            <button
              key={occasion}
              onClick={() => handleToggleSingle('vesile', occasion)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${formData.vesile === occasion ? 'bg-amber-400 text-black font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      {/* Ekstra Not (Opsiyonel) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">EKSTRA NOT (OPSİYONEL)</label>
        <textarea
          name="ekstraNot"
          value={formData.ekstraNot}
          onChange={handleInputChange}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          placeholder="Örn: 'Kahveye bayılıyor, evde çalışıyor, minimalist zevki var...'"
        />
      </div>

      {/* Spin Butonu */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || aiLoading || !canSpin}
        className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:bg-amber-400/70 text-black font-bold text-lg rounded-xl transition-all shadow-xl shadow-amber-950/20"
      >
        ✦ Çarkı Çevir
      </button>
       {!canSpin && (
            <p className="text-xs text-center text-slate-500 mt-2">Çarkı çevirmek için sol taraftan en az iki ilgi alanı seçmelisiniz.</p>
       )}
    </div>
  );
};

export default FormPanel;