import React, { useState } from "react";
import { FiUsers, FiChevronRight, FiPlus } from "react-icons/fi";
import "./TeamSelect.css";

const TeamSelect = ({ teams, onSelectTeam, onCreateTeam, currentUser }) => {
  const [newTeamName, setNewTeamName] = useState("");

  const handleCreate = () => {
    if (newTeamName.trim()) {
      onCreateTeam(newTeamName);
      setNewTeamName("");
    }
  };

  return (
    <div className="team-select-container">
      <div className="team-select-card">
        <div className="team-select-header">
          <h2>Hoş geldin, {currentUser}!</h2>
          <p>Çalışmak istediğin takımı seç.</p>
        </div>

        <div className="team-list">
          {teams.map((team) => (
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
          ))}
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
