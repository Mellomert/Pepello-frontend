import React, { useState, useEffect } from "react";
import "./App.css";
import Board from "./components/Board/Board";
import Auth from "./components/Auth/Auth";
import Sidebar from "./components/Sidebar/Sidebar";
import TeamSelect from "./components/TeamSelect/TeamSelect"; // YENİ BİLEŞEN
import { v4 as uuidv4 } from "uuid";
import {
  FiX,
  FiTrash2,
  FiSearch,
  FiImage,
  FiLogOut,
  FiGrid,
} from "react-icons/fi";

// Varsayılan Üyeler
const INITIAL_MEMBERS = [
  { id: "m1", name: "Mert Pepele", initials: "MP", color: "#579dff" },
  { id: "m2", name: "Ali Yılmaz", initials: "AY", color: "#ff9f1a" },
  { id: "m3", name: "Ayşe Demir", initials: "AD", color: "#eb5a46" },
];

// Varsayılan Takımlar (İlk açılış için)
const INITIAL_TEAMS = [
  { id: "t1", name: "Kişisel Alan" },
  { id: "t2", name: "Pepello Şirketi" },
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

  // --- TAKIM STATE (YENİ) ---
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("pepello-teams");
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [activeTeam, setActiveTeam] = useState(null); // Başlangıçta takım seçili değil

  // --- PANOLAR STATE ---
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem("pepello-boards-list");
    let parsedBoards = saved
      ? JSON.parse(saved)
      : [
          { id: "b1", name: "Pepello Projesi", teamId: "t1" }, // Varsayılan teamId ekledik
          { id: "b2", name: "Kişisel Planlar", teamId: "t1" },
          { id: "b3", name: "Pazarlama", teamId: "t2" },
        ];

    // Eski verilerde teamId yoksa onlara varsayılan takımı ata (Migration)
    parsedBoards = parsedBoards.map((b) =>
      b.teamId ? b : { ...b, teamId: INITIAL_TEAMS[0].id }
    );
    return parsedBoards;
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

  // Seçili takıma ait panoları filtrele
  const teamBoards = activeTeam
    ? boards.filter((b) => b.teamId === activeTeam.id)
    : [];

  // Aktif panoyu bul (Eğer listede varsa)
  const activeBoard = teamBoards.find((b) => b.id === activeBoardId);

  // --- EFFECTLER ---

  // Takım değişince, o takımın ilk panosunu seç (veya boş bırak)
  useEffect(() => {
    if (activeTeam && teamBoards.length > 0) {
      // Eğer daha önce bu takımda bir pano seçildiyse onu hatırla, yoksa ilkini seç
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

  // Veri Kaydetme
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
    localStorage.setItem("pepello-teams", JSON.stringify(teams));
  }, [boards, teams]);

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
    setActiveTeam(null); // Çıkış yapınca takım seçimini de sıfırla
    localStorage.removeItem("pepello-user");
  };

  const handleCreateTeam = (teamName) => {
    const newTeam = { id: `t${Date.now()}`, name: teamName };
    setTeams([...teams, newTeam]);
  };

  const addBoard = () => {
    const name = prompt("Yeni pano ismi:");
    if (name && activeTeam) {
      const newBoard = { id: `b${Date.now()}`, name, teamId: activeTeam.id }; // teamId ekledik
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

      // Sildikten sonra aynı takımdaki diğer panoya geç
      const remainingTeamBoards = newBoards.filter(
        (b) => b.teamId === activeTeam.id
      );
      if (remainingTeamBoards.length > 0)
        setActiveBoardId(remainingTeamBoards[0].id);
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

  // --- RENDER MANTIĞI ---

  // 1. Giriş Yapılmamışsa -> Auth
  if (!currentUser) return <Auth onLogin={handleLogin} />;

  // 2. Takım Seçilmemişse -> TeamSelect
  if (!activeTeam) {
    return (
      <TeamSelect
        teams={teams}
        onSelectTeam={setActiveTeam}
        onCreateTeam={handleCreateTeam}
        currentUser={currentUser}
      />
    );
  }

  const getBoardStyle = () => {
    // 1. Pano seçili değilse düz renk
    if (!activeBoardId) {
      return { backgroundColor: "#1d2125" };
    }

    // 2. Eğer bir RESİM ise (URL içeriyorsa)
    if (boardBackground.startsWith("http")) {
      return {
        backgroundImage: `url(${boardBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // 3. Renk veya Gradient ise (Sadece background kullanıyoruz, size/pos çakışması olmasın diye)
    return { background: boardBackground };
  };

  // 3. Her şey tamsa -> Ana Uygulama (Dashboard)
  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header-area">
        {/* SOL TARAFTA: Sadece Takıma Dönüş, Logo ve Takım İsmi */}
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

        {/* SAĞ TARAFTA: Pano İsmi, Arka Plan, Arama, Profil, Çıkış */}
        <div className="header-right">
          {/* 1. PANO İSMİ (Burada olmalı!) */}
          {activeBoardId && (
            <input
              className="header-board-title"
              value={activeBoard ? activeBoard.name : ""}
              onChange={(e) => renameBoard(activeBoardId, e.target.value)}
              placeholder="Pano İsmi"
            />
          )}

          {/* 2. ARKA PLAN BUTONU */}
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

          {/* 3. ARAMA */}
          <div className="header-search">
            <FiSearch className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Ara..."
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </div>

          {/* Ayırıcı */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(255,255,255,0.2)",
              margin: "0 4px",
            }}
          ></div>

          {/* 4. PROFIL ve ÇIKIŞ */}
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
          boards={teamBoards} // Sadece o takıma ait panoları gönderiyoruz
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
                {members.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#9fadbc",
                      padding: "20px",
                    }}
                  >
                    Henüz üye yok.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
