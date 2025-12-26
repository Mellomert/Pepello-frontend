import React, { useState, useEffect } from "react";
import { FiChevronRight, FiPlus, FiLogOut } from "react-icons/fi";
import "./TeamSelect.css";

const TeamSelect = ({ onSelectTeam, currentUser }) => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // --- 1. Takımları Backend'den Çekme ---
  const fetchTeams = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/user/${userId}/teams`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        console.error("Yetki Hatası! Token geçersiz.");
        setError("Oturum izni yok. Çıkış yapıp tekrar deneyin.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
        console.log("Gelen Takımlar:", data);
      } else {
        setError("Takımlar yüklenemedi. Durum: " + response.status);
      }
    } catch (err) {
      console.error("Takım çekme hatası:", err);
      setError("Bağlantı hatası oluştu. Backend açık mı?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // --- 2. Yeni Takım Oluşturma ---
  const handleCreate = async () => {
    if (!newTeamName.trim()) return;

    try {
      const bodyData = {
        owner: userId,
        icon: null, // İkon zorunlu değilse null gönder
        name: newTeamName, // DİKKAT: Oluştururken 'name' gönderiyoruz (Request objesine bağlı)
        description: "Yeni oluşturulan takım",
      };

      const response = await fetch("http://localhost:8080/api/team/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        await fetchTeams();
        setNewTeamName("");
      } else {
        alert("Takım oluşturulurken hata oluştu. Kod: " + response.status);
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya ulaşılamadı.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pepello-user");
    localStorage.removeItem("userId");
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
                  {/* DÜZELTME BURADA: team.name yerine team.teamName kullanıldı */}
                  <div className="team-avatar">
                    {team.teamName
                      ? team.teamName.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <span className="team-name">
                    {team.teamName || "İsimsiz Takım"}
                  </span>
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
