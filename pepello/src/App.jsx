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

  // --- PANOLAR STATE ---
  // Not: Panolar şimdilik LocalStorage'da tutuluyor.
  // Backend'e pano bağlama işini bir sonraki aşamada yapacağız.
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem("pepello-boards-list");
    return saved ? JSON.parse(saved) : [];
  });

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

  // Seçili takıma ait panoları filtrele (ID Eşleşmesi Önemli!)
  // Backend'den gelen ID sayı (int) olabilir, o yüzden '==' kullanıyoruz.
  const teamBoards = activeTeam
    ? boards.filter((b) => b.teamId == activeTeam.id)
    : [];

  const activeBoard = teamBoards.find((b) => b.id === activeBoardId);

  // --- EFFECTLER ---

  // Takım değişince, o takımın ilk panosunu seç (veya boş bırak)
  useEffect(() => {
    if (activeTeam && teamBoards.length > 0) {
      const lastActive = localStorage.getItem(
        `pepello-last-board-${activeTeam.id}`
      );
      if (lastActive && teamBoards.find((b) => b.id === lastActive)) {
        setActiveBoardId(lastActive);
      } else {
        setActiveBoardId(teamBoards[0].id);
      }
    } else {
      setActiveBoardId(null);
    }
  }, [activeTeam]);

  // Pano değişince arkaplanı ve üyeleri yükle
  useEffect(() => {
    if (!activeBoardId) return;
    localStorage.setItem(`pepello-last-board-${activeTeam?.id}`, activeBoardId);

    const savedBg = localStorage.getItem(`pepello-bg-${activeBoardId}`);
    setBoardBackground(savedBg || BG_OPTIONS[0].value);

    const savedMembers = localStorage.getItem(
      `pepello-members-${activeBoardId}`
    );
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    else setMembers(INITIAL_MEMBERS);

    setSearchString("");
  }, [activeBoardId]);

  // Veri Kaydetme (LocalStorage)
  useEffect(
    () => localStorage.setItem(`pepello-bg-${activeBoardId}`, boardBackground),
    [boardBackground, activeBoardId]
  );
  useEffect(
    () =>
      localStorage.setItem(
        `pepello-members-${activeBoardId}`,
        JSON.stringify(members)
      ),
    [members, activeBoardId]
  );
  useEffect(() => {
    localStorage.setItem("pepello-boards-list", JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    document.title = activeBoard ? `${activeBoard.name} | Pepello` : "Pepello";
  }, [activeBoard]);

  // --- FONKSİYONLAR ---

  const handleLogin = (username) => {
    setCurrentUser(username);
    localStorage.setItem("pepello-user", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTeam(null);
    localStorage.removeItem("pepello-user");
    localStorage.removeItem("token");
    window.location.reload();
  };

  const addBoard = () => {
    const name = prompt("Yeni pano ismi:");
    if (name && activeTeam) {
      // Not: teamId artık backend'den gelen gerçek ID olacak (sayı veya string)
      const newBoard = { id: `b${Date.now()}`, name, teamId: activeTeam.id };
      setBoards([...boards, newBoard]);
      setActiveBoardId(newBoard.id);
    }
  };

  const removeBoard = (boardId) => {
    if (teamBoards.length === 1) {
      alert("Takımda en az bir pano kalmalı!");
      return;
    }
    if (window.confirm("Bu panoyu silmek istediğine emin misin?")) {
      const newBoards = boards.filter((b) => b.id !== boardId);
      setBoards(newBoards);
      const remaining = newBoards.filter((b) => b.teamId == activeTeam.id);
      if (remaining.length > 0) setActiveBoardId(remaining[0].id);
    }
  };

  const renameBoard = (boardId, newName) => {
    const newBoards = boards.map((b) =>
      b.id === boardId ? { ...b, name: newName } : b
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

  // 1. Kullanıcı Giriş Yapmamışsa -> Auth Ekranı
  if (!currentUser) return <Auth onLogin={handleLogin} />;

  // 2. Takım Seçilmemişse -> TeamSelect Ekranı (Backend'den veri çeker)
  if (!activeTeam) {
    return (
      <TeamSelect onSelectTeam={setActiveTeam} currentUser={currentUser} />
    );
  }

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

  // 3. Ana Uygulama (Dashboard)
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
            {activeTeam.name}
          </span>
        </div>

        <div className="header-right">
          {activeBoardId && (
            <input
              className="header-board-title"
              value={activeBoard ? activeBoard.name : ""}
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
          boards={teamBoards}
          activeBoardId={activeBoardId}
          onSwitchBoard={setActiveBoardId}
          onAddBoard={addBoard}
          onRemoveBoard={removeBoard}
          onRenameBoard={renameBoard}
          onShowMembers={() => setIsMembersModalOpen(true)}
        />
        <main className="board-area" style={getBoardStyle()}>
          {activeBoardId ? (
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
              Bir pano seçin veya oluşturun.
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>Pepello &copy; 2025</span>
          <span className="footer-divider">•</span>
          <span>Takım: {activeTeam.name}</span>
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
              <h3>{activeTeam.name} Üyeleri</h3>
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
