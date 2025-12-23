import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { FiClock, FiAlignLeft, FiCheckSquare } from "react-icons/fi";
import "./Card.css";

const Card = ({ card, index, onClick }) => {
  // Kapak stili belirleme
  const coverStyle = card.coverImage
    ? {
        backgroundImage: `url(${card.coverImage})`,
        height: "140px", // Resimse daha yüksek
      }
    : card.coverColor
    ? {
        backgroundColor: card.coverColor,
        height: "32px", // Renkse ince şerit
      }
    : null;

  // Badge (Rozet) kontrolleri
  const hasDescription = card.description && card.description.trim().length > 0;
  const hasChecklist = card.checklist && card.checklist.length > 0;
  const completedChecklist = card.checklist
    ? card.checklist.filter((i) => i.isCompleted).length
    : 0;

  // Tarih badge rengi (Gecikmişse kırmızı vb. yapılabilir, şimdilik standart)
  // İstersen burada gün kontrolü yapıp rengi değiştirebilirsin.
  const dateBadgeStyle = card.dueDate
    ? { backgroundColor: "#eb5a46", color: "#fff" }
    : {};

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="card-container"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
          onClick={() => onClick(card.id)}
        >
          {/* --- KAPAK ALANI --- */}
          {/* Eğer kapak varsa bu div görünür */}
          {coverStyle && (
            <div className="card-cover-preview" style={coverStyle}></div>
          )}

          <div className="card-content-area">
            {/* ETİKETLER */}
            {card.labels && card.labels.length > 0 && (
              <div className="card-labels">
                {card.labels.map((label) => (
                  <div
                    key={label.id}
                    className="card-label"
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  ></div>
                ))}
              </div>
            )}

            {/* KART BAŞLIĞI */}
            <div className="card-title">{card.content}</div>

            {/* ALT BİLGİLER (Badges & Members) */}
            <div className="card-footer">
              <div className="card-badges">
                {/* Tarih Badge */}
                {card.dueDate && (
                  <div className="card-badge is-due" style={dateBadgeStyle}>
                    <FiClock size={14} />
                    <span>
                      {new Date(card.dueDate).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}

                {/* Açıklama Badge */}
                {hasDescription && (
                  <div className="card-badge" title="Açıklama var">
                    <FiAlignLeft size={14} />
                  </div>
                )}

                {/* Checklist Badge */}
                {hasChecklist && (
                  <div
                    className={`card-badge ${
                      completedChecklist === card.checklist.length
                        ? "is-completed"
                        : ""
                    }`}
                    title="Kontrol Listesi"
                  >
                    <FiCheckSquare size={14} />
                    <span>
                      {completedChecklist}/{card.checklist.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Üyeler */}
              {card.members && card.members.length > 0 && (
                <div className="card-members">
                  {card.members.map((member) => (
                    <div
                      key={member.id}
                      className="card-member-avatar"
                      style={{ backgroundColor: member.color }}
                      title={member.name}
                    >
                      {member.initials}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
