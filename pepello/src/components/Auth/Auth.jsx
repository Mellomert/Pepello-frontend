import React, { useState } from "react";
import { FiTrello, FiUser, FiMail, FiLock, FiCalendar } from "react-icons/fi";
import "./Auth.css";

const Auth = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false); // Giriş mi Kayıt mı?

  // Form Verileri
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

    if (isRegistering) {
      // KAYIT OLMA MODU
      const { firstName, lastName, email, password, birthDate } = formData;

      if (firstName && lastName && email && password && birthDate) {
        const response = await fetch("http://localhost:8080/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
      } else {
        alert("Lütfen tüm alanları doldurun!");
      }
    } else {
      // GİRİŞ YAPMA MODU (Basitlik için sadece isim/email ile alıyoruz)
      // Normalde burada email/şifre kontrolü yapılır.
      // Şimdilik sadece Ad veya Email girilmesi yeterli.
      if (formData.email || formData.firstName) {
        // Eğer email girdiyse @ işaretinden öncesini isim yapalım, yoksa ismi kullanalım
        const displayName = formData.firstName || formData.email.split("@")[0];
        onLogin(displayName);
      }
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
                    required
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
                    required
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
                  required
                  style={{ color: formData.birthDate ? "#fff" : "#9fadbc" }}
                />
              </div>
            </>
          )}

          {/* --- ORTAK ALANLAR (Email & Şifre) --- */}
          {/* Giriş modunda sadece Kullanıcı Adı/Email soruyoruz basitlik için */}

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type={isRegistering ? "email" : "text"}
              name="email"
              placeholder={
                isRegistering ? "E-posta Adresi" : "E-posta veya Kullanıcı Adı"
              }
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
              <span onClick={() => setIsRegistering(false)}>Giriş Yap</span>
            </p>
          ) : (
            <p>
              Hesabın yok mu?{" "}
              <span onClick={() => setIsRegistering(true)}>Kayıt Ol</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
