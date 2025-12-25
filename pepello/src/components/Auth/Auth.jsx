import React, { useState, useEffect } from "react";
// react-icons paketinin yüklü olduğundan emin ol, yoksa hata verir.
// Eğer yüklü değilse terminale: npm install react-icons yazmalısın.
import { FiTrello, FiUser, FiMail, FiLock, FiCalendar } from "react-icons/fi";
import "./Auth.css";

const Auth = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Sayfa yüklendiğinde bu çalışır.
  useEffect(() => {
    console.log("Auth bileşeni yüklendi! (Eğer bunu görüyorsan kod güncel)");
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. Butona tıklandı. İşlem başlıyor...");

    // Backend adresi
    const BASE_URL = "http://localhost:8080/auth";

    try {
      let endpoint = "";
      let bodyData = {};

      if (isRegistering) {
        console.log("2. Mod: Kayıt Ol");
        endpoint = `${BASE_URL}/register`;

        // Form verisi kontrolü
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.password ||
          !formData.birthDate
        ) {
          alert("Lütfen tüm alanları doldurun!");
          return;
        }

        bodyData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          birthday: formData.birthDate,
        };
      } else {
        console.log("2. Mod: Giriş Yap");
        endpoint = `${BASE_URL}/login`;

        if (!formData.email || !formData.password) {
          alert("Email ve şifre girmelisiniz!");
          return;
        }

        bodyData = {
          email: formData.email,
          password: formData.password,
        };
      }

      console.log(`3. İstek gönderiliyor: ${endpoint}`);
      console.log("Gönderilen Veri:", JSON.stringify(bodyData));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      console.log("4. Sunucudan cevap geldi. Durum kodu:", response.status);

      const data = await response.json();
      console.log("Gelen Veri:", data);

      if (!response.ok) {
        throw new Error(data.error || "İşlem başarısız oldu");
      }

      // --- BAŞARILI ---
      console.log("5. Başarılı! Token kaydediliyor...");
      localStorage.setItem("token", data.token);

      const displayName = isRegistering
        ? formData.firstName
        : formData.email.split("@")[0];

      alert(`Hoşgeldin ${displayName}! Giriş başarılı.`);
      onLogin(displayName);
    } catch (error) {
      console.error("HATA:", error);
      alert("Bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiTrello size={32} color="#fff" />
          </div>
          <h1>Pepello</h1>
          <p>
            {isRegistering
              ? "Hemen ücretsiz hesap oluştur."
              : "Projelerine kaldığın yerden devam et."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* --- KAYIT OLMA ALANLARI --- */}
          {isRegistering && (
            <>
              <div className="form-row">
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Ad"
                    value={formData.firstName}
                    onChange={handleChange}
                    required={isRegistering} // Sadece kayıt modunda zorunlu
                  />
                </div>
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Soyad"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={isRegistering}
                  />
                </div>
              </div>

              <div className="input-group">
                <FiCalendar className="input-icon" />
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required={isRegistering}
                  style={{ color: formData.birthDate ? "#fff" : "#9fadbc" }}
                />
              </div>
            </>
          )}

          {/* --- ORTAK ALANLAR --- */}
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email" // Tipi email olsun ki tarayıcı kontrol etsin
              name="email"
              placeholder="E-posta Adresi"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div className="auth-footer">
          {isRegistering ? (
            <p>
              Zaten hesabın var mı?{" "}
              <span
                onClick={() => setIsRegistering(false)}
                style={{ cursor: "pointer", color: "#61bd4f" }}
              >
                Giriş Yap
              </span>
            </p>
          ) : (
            <p>
              Hesabın yok mu?{" "}
              <span
                onClick={() => setIsRegistering(true)}
                style={{ cursor: "pointer", color: "#61bd4f" }}
              >
                Kayıt Ol
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
