import React, { useState } from "react";
import {
  FiTrello,
  FiUsers,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"; // FiEdit2 kaldırıldı
import "./Sidebar.css";

const Sidebar = ({
  boards,
  activeBoardId,
  onSwitchBoard,
  onAddBoard,
  onRemoveBoard,
  onShowMembers,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`sidebar-area ${!isSidebarOpen ? "closed" : ""}`}>
      {/* Açma/Kapama Butonu */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
      </div>

      <div className="sidebar-content">
        {/* Menü Linkleri */}
        <div className="sidebar-menu-item active">
          <FiTrello style={{ marginRight: 10 }} />
          <span>Panolar</span>
        </div>

        <div className="sidebar-menu-item" onClick={onShowMembers}>
          <FiUsers style={{ marginRight: 10 }} />
          <span>Üyeler</span>
        </div>

        <div className="sidebar-divider"></div>

        {/* Çalışma Alanı Başlığı */}
        <div className="sidebar-section-header">
          <span>Çalışma Alanı</span>
          <FiPlus
            className="add-board-icon"
            onClick={onAddBoard}
            title="Yeni Pano Ekle"
          />
        </div>

        {/* Pano Listesi */}
        <div className="sidebar-board-list">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`sidebar-board-item ${
                activeBoardId === board.id ? "active" : ""
              }`}
              onClick={() => onSwitchBoard(board.id)}
            >
              <div className="board-info">
                <div className="board-color-icon"></div>
                <span className="board-name">{board.name}</span>
              </div>

              {/* SADECE SİLME BUTONU KALDI */}
              <div className="board-actions">
                <FiTrash2
                  className="action-icon delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBoard(board.id);
                  }}
                  title="Panoyu Sil"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
