import React, { useState, useEffect } from "react";
import "./App.css";
import Board from "./components/Board/Board";
import Auth from "./components/Auth/Auth";
import Sidebar from "./components/Sidebar/Sidebar";
import TeamSelect from "./components/TeamSelect/TeamSelect";
import { v4 as uuidv4 } from "uuid";
import {
  FiGrid,
  FiSearch,
  FiImage,
  FiLogOut,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const INITIAL_MEMBERS = [];

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
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("pepello-user") || null
  );

  const [activeTeam, setActiveTeam] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [activeBoardId, setActiveBoardId] = useState(
    () => localStorage.getItem("pepello-active-board") || null
  );

  const [searchString, setSearchString] = useState("");
  const [boardBackground, setBoardBackground] = useState(BG_OPTIONS[0].value);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);

  // --- ÜYE STATE ---
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const token = localStorage.getItem("token");

  // --- 1. PROJELERİ ÇEKME ---
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
          const mappedBoards = data.map((project) => ({
            ...project,
            name: project.projectName,
            id: project.id,
          }));

          setBoards(mappedBoards);

          if (mappedBoards.length === 0) {
            setActiveBoardId(null);
          } else {
            const exists = mappedBoards.find((b) => b.id === activeBoardId);
            if (!exists) setActiveBoardId(null);
          }
        } else {
          setBoards([]);
        }
      } catch (error) {
        console.error("Bağlantı hatası:", error);
        setBoards([]);
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchProjects();
  }, [activeTeam, token]);

  // --- 2. ÜYELERİ ÇEKME ---
  const fetchMembers = async () => {
    if (!activeTeam || !token) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/team/${activeTeam.id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedMembers = data.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          initials: `${user.firstName?.charAt(0) || ""}${
            user.lastName?.charAt(0) || ""
          }`.toUpperCase(),
          color: "#579dff",
        }));
        setMembers(mappedMembers);
      }
    } catch (err) {
      console.error("Üyeler çekilemedi:", err);
    }
  };

  useEffect(() => {
    if (activeTeam) fetchMembers();
  }, [activeTeam]);

  // --- 3. YENİ PANO OLUŞTURMA ---
  const addBoard = async () => {
    const name = prompt("Yeni pano ismi:");
    if (name && activeTeam) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const bodyData = {
          teamId: activeTeam.id,
          projectName: name,
          projectDescription: "Yeni oluşturulan proje",
          icon: null,
          startDate: today,
          endDate: today,
        };

        const response = await fetch("http://localhost:8080/api/project/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        });

        if (response.ok) {
          const newProject = await response.json();
          const mappedProject = { ...newProject, name: newProject.projectName };
          setBoards([...boards, mappedProject]);
          setActiveBoardId(mappedProject.id);
        } else {
          alert("Pano oluşturulamadı! Hata: " + response.status);
        }
      } catch (error) {
        console.error(error);
        alert("Sunucu hatası!");
      }
    }
  };

  // --- 4. ÜYE EKLEME (DİREKT E-POSTA İLE) ---
  const addMember = async (email) => {
    if (!email.trim()) return;

    try {
      // Endpoint: POST /api/team/{teamId}/add-member-by-email
      const response = await fetch(
        `http://localhost:8080/api/team/${activeTeam.id}/add-member-by-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Backend'in { "email": "..." } formatında body beklediğini varsayıyoruz
          body: JSON.stringify({ email: email }),
        }
      );

      if (response.ok) {
        alert("Üye başarıyla eklendi!");
        fetchMembers(); // Listeyi güncelle
        setNewMemberName("");
      } else {
        const errText = await response.text();
        console.error("Üye ekleme hatası:", errText);
        // Backend'den dönen hatayı veya genel durum kodunu göster
        alert(`Üye eklenemedi. (${response.status})`);
      }
    } catch (err) {
      console.error("Bağlantı hatası:", err);
      alert("İşlem başarısız. Sunucuya ulaşılamadı.");
    }
  };

  // --- 5. ÜYE SİLME ---
  const removeMember = async (memberId) => {
    if (window.confirm("Bu üyeyi takımdan çıkarmak istediğine emin misin?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/team/${activeTeam.id}/members/${memberId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          setMembers(members.filter((m) => m.id !== memberId));
        } else {
          alert("Üye silinemedi.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- UI ---
  useEffect(() => {
    if (!activeBoardId) return;
    localStorage.setItem(`pepello-last-board-${activeTeam?.id}`, activeBoardId);
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
    document.title = activeBoard ? `${activeBoard.name} | Pepello` : "Pepello";
  }, [activeBoardId, boards]);

  const handleLogin = (username) => {
    setCurrentUser(username);
    localStorage.setItem("pepello-user", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTeam(null);
    localStorage.removeItem("pepello-user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const removeBoard = async (boardId) => {
    if (boards.length === 1) {
      alert("Takımda en az bir pano kalmalı!");
      return;
    }
    if (window.confirm("Bu panoyu silmek istediğine emin misin?")) {
      const newBoards = boards.filter((b) => b.id !== boardId);
      setBoards(newBoards);
      if (newBoards.length > 0) setActiveBoardId(newBoards[0].id);
      else setActiveBoardId(null);
    }
  };

  const renameBoard = (boardId, newName) => {
    const newBoards = boards.map((b) =>
      b.id === boardId ? { ...b, name: newName, projectName: newName } : b
    );
    setBoards(newBoards);
  };

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  if (!activeTeam) {
    return (
      <TeamSelect onSelectTeam={setActiveTeam} currentUser={currentUser} />
    );
  }

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
                ? "Bu takımda henüz pano yok. '+' butonuna basarak yeni bir pano oluştur."
                : "Soldan bir pano seç."}
            </div>
          )}
        </main>
      </div>

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
                  placeholder="Üye E-postası..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addMember(newMemberName)
                  }
                  autoFocus
                />
                <button
                  className="members-add-btn"
                  onClick={() => {
                    addMember(newMemberName);
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
                      <span className="member-name">
                        {m.name}{" "}
                        <small style={{ color: "#999", marginLeft: 5 }}>
                          ({m.email})
                        </small>
                      </span>
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
