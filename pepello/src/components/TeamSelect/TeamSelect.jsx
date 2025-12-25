import React, { useState, useEffect } from "react";
import { FiUsers, FiChevronRight, FiPlus, FiLogOut } from "react-icons/fi";
import "./TeamSelect.css";

const TeamSelect = ({ onSelectTeam, currentUser }) => {
  const [teams, setTeams] = useState([]); // Takımlar artık State içinde
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token'ı alıyoruz
  const token = localStorage.getItem("token");

  // --- 1. Takımları Backend'den Çekme Fonksiyonu ---
  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/team/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Backend'e kim olduğumuzu söylüyoruz
        },
      });

      /* // BU KISMI GEÇİCİ OLARAK KAPATIYORUZ Kİ HATAYI GÖRELİM
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      */

      if (response.ok) {
        const data = await response.json();
        setTeams(data); // Gelen veriyi state'e atıyoruz
      } else {
        setError("Takımlar yüklenemedi.");
      }
    } catch (err) {
      console.error("Takım çekme hatası:", err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa açılınca takımları çek
  useEffect(() => {
    fetchTeams();
  }, []);

  // --- 2. Yeni Takım Oluşturma Fonksiyonu ---
  const handleCreate = async () => {
    if (!newTeamName.trim()) return;

    try {
      const response = await fetch("http://localhost:8080/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (response.ok) {
        // Başarılıysa listeyi güncelle ve inputu temizle
        await fetchTeams();
        setNewTeamName("");
      } else {
        alert("Takım oluşturulurken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Çıkış Yapma Yardımcısı
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pepello-user");
    window.location.reload();
  };

  if (loading)
    return (
      <div className="team-select-container" style={{ color: "white" }}>
        Yükleniyor...
      </div>
    );

  return (
    <div className="team-select-container">
      <div className="team-select-card">
        <div className="team-select-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Hoş geldin, {currentUser}!</h2>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9fadbc",
              }}
              title="Çıkış Yap"
            >
              <FiLogOut size={20} />
            </button>
          </div>
          <p>Çalışmak istediğin takımı seç.</p>
        </div>

        {error && (
          <div style={{ color: "#ff6b6b", marginBottom: "10px" }}>{error}</div>
        )}

        <div className="team-list">
          {teams.length === 0 ? (
            <div style={{ padding: "10px", color: "#9fadbc" }}>
              Henüz bir takımın yok.
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="team-item"
                onClick={() => onSelectTeam(team)}
              >
                <div className="team-info">
                  <div className="team-avatar">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="team-name">{team.name}</span>
                </div>
                <FiChevronRight className="team-arrow" size={20} />
              </div>
            ))
          )}
        </div>

        <div className="create-team-wrapper">
          <input
            type="text"
            className="team-input"
            placeholder="Yeni bir takım oluştur..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button className="btn-create-team" onClick={handleCreate}>
            <FiPlus /> Oluştur
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelect;
