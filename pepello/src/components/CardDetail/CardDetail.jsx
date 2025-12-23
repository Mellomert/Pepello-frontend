import React, { useState, useEffect } from "react";
import {
  FiX,
  FiActivity,
  FiAlignLeft,
  FiCreditCard,
  FiUser,
  FiTag,
  FiCheckSquare,
  FiClock,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiImage,
  FiCopy,
  FiTrash,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";
import "./CardDetail.css";

const COVER_COLORS = [
  "#7BC86C",
  "#F5D3CE",
  "#FFAF3F",
  "#EF7564",
  "#CD8DE5",
  "#5BA4CF",
  "#29CCE5",
  "#6DECA9",
  "#FF8ED4",
  "#172B4D",
];

const AVAILABLE_LABELS = [
  { id: "l1", color: "#61bd4f", name: "Tamamlandı" },
  { id: "l2", color: "#f2d600", name: "Dikkat" },
  { id: "l3", color: "#eb5a46", name: "Acil" },
  { id: "l4", color: "#c377e0", name: "Tasarım" },
  { id: "l5", color: "#0079bf", name: "Yazılım" },
];

const CardDetail = ({
  card,
  listTitle,
  onClose,
  updateCard,
  listId,
  removeCard,
  allLists,
  moveCardToAnotherList,
  currentUser,
  duplicateCard,
  allMembers,
  addMember,
}) => {
  if (!card) return null;

  const [title, setTitle] = useState(card.content);
  const [description, setDescription] = useState(card.description || "");
  const [comment, setComment] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  const [isMemberPopoverOpen, setIsMemberPopoverOpen] = useState(false);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isCoverPopoverOpen, setIsCoverPopoverOpen] = useState(false);

  const activities = card.activities || [];
  const members = card.members || [];
  const labels = card.labels || [];
  const dueDate = card.dueDate || "";
  const checklist = card.checklist || [];
  const coverColor = card.coverColor || "";
  const coverImage = card.coverImage || "";

  useEffect(() => {
    setTitle(card.content);
    setDescription(card.description || "");
  }, [card]);

  const saveTitle = () => {
    if (title !== card.content) updateCard(listId, card.id, { content: title });
  };
  const saveDescription = () => {
    if (description !== card.description)
      updateCard(listId, card.id, { description });
  };

  const handleListChange = (e) => {
    const newDestListId = e.target.value;
    if (newDestListId !== listId)
      moveCardToAnotherList(card.id, listId, newDestListId);
  };

  const addComment = () => {
    if (!comment.trim()) return;
    const newActivity = {
      id: uuidv4(),
      text: comment,
      user: currentUser || "Sen",
      date: new Date().toLocaleString(),
      type: "comment",
    };
    updateCard(listId, card.id, { activities: [newActivity, ...activities] });
    setComment("");
  };

  const deleteActivity = (activityId) => {
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;
    const newActivities = activities.filter((act) => act.id !== activityId);
    updateCard(listId, card.id, { activities: newActivities });
  };

  const handleDeleteCard = () => {
    if (window.confirm("Bu kartı silmek istediğine emin misin?")) {
      removeCard(listId, card.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    duplicateCard(listId, card.id);
    onClose();
  };

  const toggleMember = (member) => {
    const newMembers = members.find((m) => m.id === member.id)
      ? members.filter((m) => m.id !== member.id)
      : [...members, member];
    updateCard(listId, card.id, { members: newMembers });
  };

  const handleAddNewMember = () => {
    if (newMemberName.trim()) {
      addMember(newMemberName);
      setNewMemberName("");
    }
  };

  const toggleLabel = (label) => {
    const newLabels = labels.find((l) => l.id === label.id)
      ? labels.filter((l) => l.id !== label.id)
      : [...labels, label];
    updateCard(listId, card.id, { labels: newLabels });
  };

  const handleDateChange = (e) => {
    updateCard(listId, card.id, { dueDate: e.target.value });
    setIsDatePopoverOpen(false);
  };

  const addChecklistItem = () => {
    if (!checklistInput.trim()) return;
    const newItem = { id: uuidv4(), text: checklistInput, isCompleted: false };
    updateCard(listId, card.id, { checklist: [...checklist, newItem] });
    setChecklistInput("");
  };

  const toggleChecklistItem = (itemId) => {
    const newChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    updateCard(listId, card.id, { checklist: newChecklist });
    const allDone =
      newChecklist.length > 0 && newChecklist.every((i) => i.isCompleted);
    if (allDone)
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.7 },
        zIndex: 9999,
      });
  };

  const deleteChecklistItem = (itemId) => {
    updateCard(listId, card.id, {
      checklist: checklist.filter((item) => item.id !== itemId),
    });
  };
  const handleSelectCover = (color) => {
    updateCard(listId, card.id, { coverColor: color, coverImage: "" });
  };
  const handleSaveImage = () => {
    if (!imageInput.trim()) return;
    updateCard(listId, card.id, { coverImage: imageInput, coverColor: "" });
    setImageInput("");
  };
  const removeCover = () => {
    updateCard(listId, card.id, { coverColor: "", coverImage: "" });
  };

  const completedCount = checklist.filter((c) => c.isCompleted).length;
  const progress =
    checklist.length === 0
      ? 0
      : Math.round((completedCount / checklist.length) * 100);

  const headerCoverStyle = coverImage
    ? {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: coverColor };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* KAPAK ALANI */}
        {(coverColor || coverImage) && (
          <div className="modal-cover-display" style={headerCoverStyle}></div>
        )}

        {/* --- HEADER --- */}
        <div className="modal-header-area">
          <FiCreditCard className="modal-icon-large" />
          <div className="modal-title-box">
            <input
              className="modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
            />
            <div className="modal-list-info">
              <span>Şu listede: </span>
              <select
                className="modal-list-select"
                value={listId}
                onChange={handleListChange}
              >
                {Object.values(allLists).map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- ANA GÖVDE (Grid Yapısı: Sol İçerik + Sağ Menü) --- */}
        <div className="modal-grid-layout">
          {/* SOL KOLON (Ana İçerik) */}
          <div className="modal-main-column">
            {/* Meta Veriler (Üyeler, Etiketler...) */}
            {(members.length > 0 || labels.length > 0 || dueDate) && (
              <div className="modal-meta-data">
                {members.length > 0 && (
                  <div className="meta-group">
                    <h4 className="meta-label">Üyeler</h4>
                    <div className="meta-items">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          className="user-avatar"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.initials}
                        </div>
                      ))}
                      <div
                        className="add-meta-btn"
                        onClick={() =>
                          setIsMemberPopoverOpen(!isMemberPopoverOpen)
                        }
                      >
                        <FiPlus />
                      </div>
                    </div>
                  </div>
                )}
                {labels.length > 0 && (
                  <div className="meta-group">
                    <h4 className="meta-label">Etiketler</h4>
                    <div className="meta-items">
                      {labels.map((l) => (
                        <div
                          key={l.id}
                          className="label-badge"
                          style={{ backgroundColor: l.color }}
                        >
                          {l.name}
                        </div>
                      ))}
                      <div
                        className="add-meta-btn"
                        onClick={() =>
                          setIsLabelPopoverOpen(!isLabelPopoverOpen)
                        }
                      >
                        <FiPlus />
                      </div>
                    </div>
                  </div>
                )}
                {dueDate && (
                  <div className="meta-group">
                    <h4 className="meta-label">Bitiş Tarihi</h4>
                    <div
                      className="date-badge"
                      onClick={() => setIsDatePopoverOpen(true)}
                    >
                      <FiCheckSquare style={{ marginRight: 5 }} />{" "}
                      {new Date(dueDate).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Açıklama */}
            <div className="modal-section">
              <div className="section-header">
                <FiAlignLeft className="modal-icon" />
                <h3>Açıklama</h3>
              </div>
              <textarea
                className="modal-description-input"
                placeholder="Daha ayrıntılı bir açıklama ekleyin..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
              />
            </div>

            {/* Checklist */}
            <div className="modal-section">
              <div className="section-header">
                <FiCheckSquare className="modal-icon" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <h3>Kontrol Listesi</h3>
                  {checklist.length > 0 && (
                    <button
                      className="btn-text-danger"
                      onClick={() =>
                        updateCard(listId, card.id, { checklist: [] })
                      }
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
              {checklist.length > 0 && (
                <div className="progress-bar-wrapper">
                  <span className="progress-percent">{progress}%</span>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        backgroundColor:
                          progress === 100 ? "#61bd4f" : "#579dff",
                      }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="checklist-items">
                {checklist.map((item) => (
                  <div key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="checklist-checkbox"
                    />
                    <span
                      className={`checklist-text ${
                        item.isCompleted ? "completed" : ""
                      }`}
                    >
                      {item.text}
                    </span>
                    <FiTrash2
                      className="checklist-delete-icon"
                      onClick={() => deleteChecklistItem(item.id)}
                    />
                  </div>
                ))}
              </div>
              <div className="add-checklist-wrapper">
                <input
                  type="text"
                  className="checklist-input-new"
                  placeholder="Bir öğe ekle..."
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                />
                <button className="btn-primary" onClick={addChecklistItem}>
                  Ekle
                </button>
              </div>
            </div>

            {/* Etkinlik */}
            <div className="modal-section">
              <div className="section-header">
                <FiActivity className="modal-icon" />
                <h3>Etkinlik</h3>
              </div>
              <div className="activity-new-comment">
                <div
                  className="user-avatar"
                  style={{ backgroundColor: "#579dff" }}
                >
                  {currentUser ? currentUser.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Yorum yaz..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                  />
                  {/* Yorum kaydet butonu eklenebilir ama enter yetiyor */}
                </div>
              </div>
              <div className="activity-list">
                {activities.map((act) => (
                  <div className="activity-item" key={act.id}>
                    <div
                      className="user-avatar-small"
                      style={{
                        background:
                          act.type === "system" ? "#384148" : "#579dff",
                      }}
                    >
                      {act.user ? act.user.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="activity-content">
                      <span className="activity-user">{act.user}</span>{" "}
                      <span className="activity-date">{act.date}</span>
                      <div className="activity-text">
                        {act.text}
                        {act.type === "comment" && (
                          <FiTrash
                            className="activity-delete"
                            onClick={() => deleteActivity(act.id)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAĞ KOLON (Sidebar Menü) */}
          <div className="modal-sidebar-column">
            <div className="sidebar-group">
              <h4 className="sidebar-title">Karta Ekle</h4>

              <div className="popover-wrapper">
                <button
                  className="sidebar-button"
                  onClick={() => setIsMemberPopoverOpen(!isMemberPopoverOpen)}
                >
                  <FiUser /> Üyeler
                </button>
                {isMemberPopoverOpen && (
                  <div className="popover-menu">
                    <div className="popover-header">
                      <span>Üyeler</span>
                      <FiX
                        className="popover-close"
                        onClick={() => setIsMemberPopoverOpen(false)}
                      />
                    </div>
                    <div className="popover-content">
                      {allMembers.map((m) => (
                        <div
                          key={m.id}
                          className="popover-row"
                          onClick={() => toggleMember(m)}
                        >
                          <div
                            className="user-avatar-small"
                            style={{ backgroundColor: m.color }}
                          >
                            {m.initials}
                          </div>
                          <span>{m.name}</span>
                          {members.find((x) => x.id === m.id) && <FiCheck />}
                        </div>
                      ))}
                      <div className="popover-input-row">
                        <input
                          placeholder="Yeni kişi..."
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                        />
                        <button onClick={handleAddNewMember}>+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="popover-wrapper">
                <button
                  className="sidebar-button"
                  onClick={() => setIsLabelPopoverOpen(!isLabelPopoverOpen)}
                >
                  <FiTag /> Etiketler
                </button>
                {isLabelPopoverOpen && (
                  <div className="popover-menu">
                    <div className="popover-header">
                      <span>Etiketler</span>
                      <FiX
                        className="popover-close"
                        onClick={() => setIsLabelPopoverOpen(false)}
                      />
                    </div>
                    <div className="popover-content">
                      {AVAILABLE_LABELS.map((l) => (
                        <div
                          key={l.id}
                          className="popover-row"
                          onClick={() => toggleLabel(l)}
                        >
                          <div
                            className="label-color-box"
                            style={{ background: l.color }}
                          ></div>
                          <span>{l.name}</span>
                          {labels.find((x) => x.id === l.id) && <FiCheck />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="popover-wrapper">
                <button
                  className="sidebar-button"
                  onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                >
                  <FiClock /> Tarihler
                </button>
                {isDatePopoverOpen && (
                  <div className="popover-menu">
                    <div className="popover-header">
                      <span>Tarih</span>
                      <FiX
                        className="popover-close"
                        onClick={() => setIsDatePopoverOpen(false)}
                      />
                    </div>
                    <div className="popover-content p-2">
                      <input
                        type="date"
                        className="date-input"
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="popover-wrapper">
                <button
                  className="sidebar-button"
                  onClick={() => setIsCoverPopoverOpen(!isCoverPopoverOpen)}
                >
                  <FiImage /> Kapak
                </button>
                {isCoverPopoverOpen && (
                  <div className="popover-menu">
                    <div className="popover-header">
                      <span>Kapak</span>
                      <FiX
                        className="popover-close"
                        onClick={() => setIsCoverPopoverOpen(false)}
                      />
                    </div>
                    <div className="popover-content">
                      <div className="color-grid">
                        {COVER_COLORS.map((c) => (
                          <div
                            key={c}
                            className="color-btn"
                            style={{ background: c }}
                            onClick={() => handleSelectCover(c)}
                          ></div>
                        ))}
                      </div>
                      <input
                        placeholder="Resim URL..."
                        className="url-input"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                      />
                      <button className="btn-full" onClick={handleSaveImage}>
                        Resim Ekle
                      </button>
                      <button className="btn-text" onClick={removeCover}>
                        Kaldır
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-group">
              <h4 className="sidebar-title">Eylemler</h4>
              <button className="sidebar-button" onClick={handleDuplicate}>
                <FiCopy /> Kopyala
              </button>
              <button
                className="sidebar-button btn-danger"
                onClick={handleDeleteCard}
              >
                <FiTrash /> Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
