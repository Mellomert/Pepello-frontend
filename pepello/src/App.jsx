import React, { useState, useEffect } from "react";
import "./App.css";
import Board from "./components/Board/Board";
import Auth from "./components/Auth/Auth";
import Sidebar from "./components/Sidebar/Sidebar";
import TeamSelect from "./components/TeamSelect/TeamSelect";
import { v4 as uuidv4 } from "uuid";
import {
  FiX,
  FiTrash2,
  FiSearch,
  FiImage,
  FiGrid,
  FiLogOut,
} from "react-icons/fi";

// Varsayılan Üyeler (İleride burası da backend'den çekilebilir)
const INITIAL_MEMBERS = [
  { id: "m1", name: "Mert Pepele", initials: "MP", color: "#579dff" },
  { id: "m2", name: "Ali Yılmaz", initials: "AY", color: "#ff9f1a" },
  { id: "m3", name: "Ayşe Demir", initials: "AD", color: "#eb5a46" },
];

// ARKA PLAN SEÇENEKLERİ
const BG_OPTIONS = [
  {
    type: "color",
    value: "linear-gradient(135deg, #89609e 0%, #a66a98 100%)",
    name: "Mor",
  },
  { type: "color", value: "#0079bf", name: "Mavi" },
  { type: "color", value: "#d29034", name: "Turuncu" },
  { type: "color", value: "#519839", name: "Yeşil" },
  { type: "color", value: "#b04632", name: "Kırmızı" },
  {
    type: "image",
    value:
      "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=2000&q=80",
    name: "Dağlar",
  },
  {
    type: "image",
    value:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
    name: "Vadi",
  },
  {
    type: "image",
    value:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80",
    name: "Yıldızlar",
  },
];

function App() {
  // --- KULLANICI STATE ---
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("pepello-user") || null
  );

  // Aktif seçili takım
  const [activeTeam, setActiveTeam] = useState(null);

  // --- PANOLAR STATE (Backend'den gelecek) ---
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [activeBoardId, setActiveBoardId] = useState(
    () => localStorage.getItem("pepello-active-board") || null
  );

  // Header Kontrolleri
  const [searchString, setSearchString] = useState("");
  const [boardBackground, setBoardBackground] = useState(BG_OPTIONS[0].value);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);

  // Üye Yönetimi
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const token = localStorage.getItem("token");

  // --- 1. PROJELERİ BACKEND'DEN ÇEKME ---
  // Backend Endpoint: /api/team/{teamId}/projects
  useEffect(() => {
    if (!activeTeam || !token) return;

    const fetchProjects = async () => {
      setLoadingBoards(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/team/${activeTeam.id}/projects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Gelen Projeler:", data);
          setBoards(data);

          // Eğer hiç proje yoksa seçimi kaldır, varsa ve eski seçim listede yoksa ilkini seç
          if (data.length === 0) {
            setActiveBoardId(null);
          } else {
            const exists = data.find((b) => b.id === activeBoardId);
            if (!exists) setActiveBoardId(data[0].id);
          }
        } else {
          console.error("Projeler alınamadı. Hata Kodu:", response.status);
        }
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchProjects();
  }, [activeTeam, token]); // Takım değiştiğinde çalışır

  // --- 2. YENİ PANO OLUŞTURMA ---
  // Backend Endpoint: /api/project
  const addBoard = async () => {
    const name = prompt("Yeni pano ismi:");
    if (name && activeTeam) {
      try {
        const response = await fetch("http://localhost:8080/api/project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // DİKKAT: Backend 'projectName' bekliyor (name değil!)
          body: JSON.stringify({
            projectName: name,
            projectDescription: "Yeni oluşturulan proje", // Opsiyonel açıklama
            teamId: activeTeam.id, // Backend ilişkiyi kurmak için bunu bekleyebilir
          }),
        });

        if (response.ok) {
          const newProject = await response.json();
          // Listeye ekle ve o panoya git
          setBoards([...boards, newProject]);
          setActiveBoardId(newProject.id);
        } else {
          console.error("Hata Detayı:", await response.text());
          alert("Pano oluşturulamadı! Hata: " + response.status);
        }
      } catch (error) {
        console.error(error);
        alert("Sunucu hatası!");
      }
    }
  };

  // --- EKRAN AYARLARI (UI) ---
  useEffect(() => {
    if (!activeBoardId) return;
    localStorage.setItem(`pepello-last-board-${activeTeam?.id}`, activeBoardId);

    // Arkaplanı localStorage'dan al
    const savedBg = localStorage.getItem(`pepello-bg-${activeBoardId}`);
    setBoardBackground(savedBg || BG_OPTIONS[0].value);
    setSearchString("");
  }, [activeBoardId]);

  useEffect(
    () => localStorage.setItem(`pepello-bg-${activeBoardId}`, boardBackground),
    [boardBackground, activeBoardId]
  );

  useEffect(() => {
    const activeBoard = boards.find((b) => b.id === activeBoardId);
    document.title = activeBoard
      ? `${activeBoard.projectName || activeBoard.name} | Pepello`
      : "Pepello";
  }, [activeBoardId, boards]);

  // --- YARDIMCI METODLAR ---

  const handleLogin = (username) => {
    setCurrentUser(username);
    localStorage.setItem("pepello-user", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTeam(null);
    // TÜM VERİLERİ TEMİZLE
    localStorage.removeItem("pepello-user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId"); // User ID'yi siliyoruz
    window.location.reload();
  };

  const removeBoard = (boardId) => {
    // SİLME İŞLEMİ (Şimdilik sadece Frontend'den siliyoruz)
    // İleride: DELETE /api/project/{id}
    if (boards.length === 1) {
      alert("Takımda en az bir pano kalmalı!");
      return;
    }
    if (window.confirm("Bu panoyu silmek istediğine emin misin?")) {
      const newBoards = boards.filter((b) => b.id !== boardId);
      setBoards(newBoards);
      if (newBoards.length > 0) setActiveBoardId(newBoards[0].id);
    }
  };

  const renameBoard = (boardId, newName) => {
    // İsim güncelleme (Frontend)
    const newBoards = boards.map((b) =>
      b.id === boardId ? { ...b, projectName: newName, name: newName } : b
    );
    setBoards(newBoards);
  };

  const addMember = (name) => {
    const newMember = {
      id: uuidv4(),
      name: name,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (memberId) => {
    if (window.confirm("Bu üyeyi silmek istediğine emin misin?")) {
      setMembers(members.filter((m) => m.id !== memberId));
    }
  };

  // --- RENDER ---

  // 1. Giriş Kontrolü
  if (!currentUser) return <Auth onLogin={handleLogin} />;

  // 2. Takım Seçimi (activeTeam yoksa)
  if (!activeTeam) {
    return (
      <TeamSelect onSelectTeam={setActiveTeam} currentUser={currentUser} />
    );
  }

  // 3. Ana Uygulama
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const getBoardStyle = () => {
    if (!activeBoardId) return { backgroundColor: "#1d2125" };
    if (boardBackground.startsWith("http")) {
      return {
        backgroundImage: `url(${boardBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return { background: boardBackground };
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header-area">
        <div className="header-left">
          <button
            onClick={() => setActiveTeam(null)}
            className="btn-secondary"
            style={{ marginRight: "12px", background: "transparent" }}
            title="Takımlara Dön"
          >
            <FiGrid size={20} />
          </button>
          <span className="app-logo">Pepello</span>
          <span
            style={{
              fontSize: "13px",
              color: "#9fadbc",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
              paddingLeft: "12px",
              marginLeft: "12px",
              height: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {activeTeam.name || activeTeam.teamName}
          </span>
        </div>

        <div className="header-right">
          {activeBoardId && (
            <input
              className="header-board-title"
              value={
                activeBoard ? activeBoard.projectName || activeBoard.name : ""
              }
              onChange={(e) => renameBoard(activeBoardId, e.target.value)}
              placeholder="Pano İsmi"
            />
          )}
          {activeBoardId && (
            <div style={{ position: "relative" }}>
              <button
                className="btn-secondary"
                onClick={() => setIsBgMenuOpen(!isBgMenuOpen)}
                title="Arka Planı Değiştir"
                style={{ height: "32px", width: "32px" }}
              >
                <FiImage size={16} />
              </button>
              {isBgMenuOpen && (
                <div
                  className="bg-menu-dropdown"
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: 0,
                    zIndex: 2000,
                    background: "#282e33",
                    padding: "10px",
                    borderRadius: "8px",
                    width: "220px",
                    border: "1px solid #384148",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#9fadbc",
                    }}
                  >
                    Arka Planlar
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    {BG_OPTIONS.map((bg, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setBoardBackground(bg.value);
                          setIsBgMenuOpen(false);
                        }}
                        style={{
                          height: "40px",
                          cursor: "pointer",
                          background:
                            bg.type === "color" ? bg.value : `url(${bg.value})`,
                          backgroundSize: "cover",
                          borderRadius: "4px",
                          border: "1px solid rgba(0,0,0,0.2)",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="header-search">
            <FiSearch className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Ara..."
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </div>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(255,255,255,0.2)",
              margin: "0 4px",
            }}
          ></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#0079bf",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <Sidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSwitchBoard={setActiveBoardId}
          onAddBoard={addBoard}
          onRemoveBoard={removeBoard}
          onRenameBoard={renameBoard}
          onShowMembers={() => setIsMembersModalOpen(true)}
        />
        <main className="board-area" style={getBoardStyle()}>
          {loadingBoards ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9fadbc",
              }}
            >
              Projeler Yükleniyor...
            </div>
          ) : activeBoardId ? (
            <Board
              key={activeBoardId}
              boardId={activeBoardId}
              currentUser={currentUser}
              members={members}
              addMember={addMember}
              searchString={searchString}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9fadbc",
              }}
            >
              {boards.length === 0
                ? "Bu takımda henüz proje yok. '+' butonuna basarak yeni pano oluştur."
                : "Soldan bir pano seç."}
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>Pepello &copy; 2025</span>
          <span className="footer-divider">•</span>
          <span>Takım: {activeTeam.name || activeTeam.teamName}</span>
        </div>
        <div className="footer-right">
          <span className="status-dot"></span>
          <span>Sistem Çevrimiçi</span>
        </div>
      </footer>

      {/* ÜYE MODALI */}
      {isMembersModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsMembersModalOpen(false)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="members-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="members-header">
              <h3>{activeTeam.name || activeTeam.teamName} Üyeleri</h3>
              <button
                className="members-close-btn"
                onClick={() => setIsMembersModalOpen(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="members-body">
              <div className="members-input-group">
                <input
                  type="text"
                  className="members-input"
                  placeholder="Yeni üye adı..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    addMember(newMemberName) & setNewMemberName("")
                  }
                  autoFocus
                />
                <button
                  className="members-add-btn"
                  onClick={() => {
                    addMember(newMemberName);
                    setNewMemberName("");
                  }}
                >
                  Ekle
                </button>
              </div>
              <div className="members-list">
                {members.map((m) => (
                  <div key={m.id} className="member-item">
                    <div className="member-info">
                      <div
                        className="member-avatar"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.initials}
                      </div>
                      <span className="member-name">{m.name}</span>
                    </div>
                    <button
                      className="member-delete-btn"
                      onClick={() => removeMember(m.id)}
                      title="Üyeyi Sil"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
