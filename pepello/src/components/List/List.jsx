import React, { useState, useRef, useEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import Card from "../Card/Card"; // <-- ÖNEMLİ: Az önce oluşturduğumuz Card bileşeni
import {
  FiMoreHorizontal,
  FiPlus,
  FiX,
  FiTrash2,
  FiCopy,
  FiArrowUp,
} from "react-icons/fi";
import "./List.css";

const List = ({
  list,
  addCard,
  removeCard, // Card bileşeninin içinde kullanmasak da prop drilling için gerekebilir
  removeList,
  onCardClick,
  searchString,
  updateListTitle,
  sortCards,
  duplicateList,
  clearList,
  innerRef,
  draggableProps,
  dragHandleProps,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Kart Ekleme State'leri
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardContent, setCardContent] = useState("");

  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Menü dışına tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Başlık güncellenince inputu da güncelle
  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() !== "" && title !== list.title) {
      updateListTitle(list.id, title);
    } else {
      setTitle(list.title);
    }
  };

  const handleAddCard = () => {
    if (cardContent.trim()) {
      addCard(list.id, cardContent);
      setCardContent("");
      setIsAddingCard(false);
    }
  };

  // ARAMA FİLTRESİ: App.jsx'ten gelen searchString'e göre kartları süz
  const filteredCards = list.cards.filter((card) =>
    card.content.toLowerCase().includes((searchString || "").toLowerCase())
  );

  return (
    <div className="list-container" ref={innerRef} {...draggableProps}>
      {/* HEADER (Sürükleme tutamacı burası) */}
      <div className="list-header" {...dragHandleProps}>
        {isEditingTitle ? (
          <input
            ref={inputRef}
            className="list-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            autoFocus
          />
        ) : (
          <h3 className="list-title" onClick={() => setIsEditingTitle(true)}>
            {list.title}
          </h3>
        )}

        {/* LİSTE MENÜSÜ */}
        <div className="list-menu-wrapper" ref={menuRef}>
          <button
            className="btn-icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FiMoreHorizontal />
          </button>

          {isMenuOpen && (
            <div className="list-menu-dropdown">
              <div className="menu-header">Liste İşlemleri</div>
              <div
                className="menu-item"
                onClick={() => {
                  sortCards(list.id, "date");
                  setIsMenuOpen(false);
                }}
              >
                <FiArrowUp /> Tarihe Göre Sırala
              </div>
              <div
                className="menu-item"
                onClick={() => {
                  sortCards(list.id, "name");
                  setIsMenuOpen(false);
                }}
              >
                <FiArrowUp /> İsme Göre Sırala
              </div>
              <div className="menu-divider"></div>
              <div
                className="menu-item"
                onClick={() => {
                  duplicateList(list.id);
                  setIsMenuOpen(false);
                }}
              >
                <FiCopy /> Listeyi Kopyala
              </div>
              <div
                className="menu-item"
                onClick={() => {
                  clearList(list.id);
                  setIsMenuOpen(false);
                }}
              >
                <FiTrash2 /> Tüm Kartları Sil
              </div>
              <div className="menu-divider"></div>
              <div
                className="menu-item danger"
                onClick={() => removeList(list.id)}
              >
                <FiTrash2 /> Listeyi Sil
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DROPPABLE ALAN (Kartların Listelendiği Yer) */}
      <Droppable droppableId={list.id} type="card">
        {(provided) => (
          <div
            className="card-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: "2px" }} // Boşken de sürüklenebilsin
          >
            {/* FİLTRELENMİŞ KARTLARI GÖSTER */}
            {filteredCards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onClick={(cardId) => onCardClick(list.id, cardId)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* FOOTER (Kart Ekleme) */}
      <div className="list-footer">
        {isAddingCard ? (
          <div className="add-card-form">
            <textarea
              className="card-textarea"
              placeholder="Bu kart için bir başlık girin..."
              rows={3}
              value={cardContent}
              onChange={(e) => setCardContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard();
                }
              }}
              autoFocus
            />
            <div className="add-card-actions">
              <button className="btn-primary" onClick={handleAddCard}>
                Kart Ekle
              </button>
              <button
                className="btn-close"
                onClick={() => setIsAddingCard(false)}
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-add-card"
            onClick={() => setIsAddingCard(true)}
          >
            <FiPlus style={{ marginRight: "6px" }} /> Kart ekle
          </button>
        )}
      </div>
    </div>
  );
};

export default List;
