import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";
import CardDetail from "../CardDetail/CardDetail";
import initialData from "../../data";
import List from "../List/List";
import { FiPlus, FiX } from "react-icons/fi"; // FiSearch ve FiImage SİLİNDİ (App.jsx'te kullanılıyor)
import "./Board.css";

// Varsayılan Etiketler
const INITIAL_LABELS = [
  { id: "l1", color: "#61bd4f", name: "Tamamlandı" },
  { id: "l2", color: "#f2d600", name: "Dikkat" },
  { id: "l3", color: "#eb5a46", name: "Acil" },
  { id: "l4", color: "#c377e0", name: "Tasarım" },
  { id: "l5", color: "#0079bf", name: "Yazılım" },
];

const Board = ({
  currentUser,
  boardId,
  members,
  addMember,
  searchString, // App.jsx'ten gelen arama verisi
}) => {
  // --- 1. VERİYİ BOARD ID'YE GÖRE ÇEKME ---
  const [data, setData] = useState(() => {
    const storageKey = `pepello-board-${boardId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Eski verilerde labels yoksa ekle (Migration)
      if (!parsed.labels) {
        return { ...parsed, labels: INITIAL_LABELS };
      }
      return parsed;
    }
    // Hiç veri yoksa başlangıç verisi
    return { ...initialData, labels: INITIAL_LABELS };
  });

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [activeCard, setActiveCard] = useState(null);

  // Veri değişince kaydet
  useEffect(() => {
    localStorage.setItem(`pepello-board-${boardId}`, JSON.stringify(data));
  }, [data, boardId]);

  // Aktivite Logu Oluşturucu
  const createActivity = (text) => {
    return {
      id: uuidv4(),
      text: text,
      user: currentUser || "Anonim",
      date: new Date().toLocaleString("tr-TR"),
      type: "system",
    };
  };

  const onCardClick = (listId, cardId) => {
    setActiveCard({ listId, cardId });
  };

  const updateListTitle = (listId, newTitle) => {
    const list = data.lists[listId];
    list.title = newTitle;
    setData({
      ...data,
      lists: { ...data.lists, [listId]: list },
    });
  };

  // Kartları Sıralama
  const sortCards = (listId, sortType) => {
    const list = data.lists[listId];
    const cards = [...list.cards];

    if (sortType === "name") {
      cards.sort((a, b) => a.content.localeCompare(b.content, "tr"));
    } else if (sortType === "date") {
      cards.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    const newList = { ...list, cards };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });
  };

  // --- SÜRÜKLEME BİTİNCE ---
  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // LİSTE TAŞIMA
    if (type === "list") {
      const newListIds = Array.from(data.listIds);
      newListIds.splice(source.index, 1);
      newListIds.splice(destination.index, 0, draggableId);
      setData({ ...data, listIds: newListIds });
      return;
    }

    // KART TAŞIMA
    const startList = data.lists[source.droppableId];
    const finishList = data.lists[destination.droppableId];

    // -- KONFETİ EFEKTİ --
    if (startList !== finishList) {
      const finishListTitle = finishList.title.toLowerCase();
      if (
        finishListTitle.includes("tamamlandı") ||
        finishListTitle.includes("done") ||
        finishListTitle.includes("bitti")
      ) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#61bd4f", "#f2d600", "#0079bf", "#eb5a46"],
        });
      }
    }

    // Aynı Liste
    if (startList === finishList) {
      const newCardIds = Array.from(startList.cards);
      const [movedCard] = newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, movedCard);
      const newList = { ...startList, cards: newCardIds };
      setData({ ...data, lists: { ...data.lists, [newList.id]: newList } });
      return;
    }

    // Farklı Liste
    const startCardIds = Array.from(startList.cards);
    const [movedCard] = startCardIds.splice(source.index, 1);

    // Log
    const logActivity = createActivity(
      `bu kartı ${startList.title} listesinden ${finishList.title} listesine taşıdı.`
    );
    const updatedMovedCard = {
      ...movedCard,
      activities: [logActivity, ...(movedCard.activities || [])],
    };

    const finishCardIds = Array.from(finishList.cards);
    finishCardIds.splice(destination.index, 0, updatedMovedCard);

    const newStartList = { ...startList, cards: startCardIds };
    const newFinishList = { ...finishList, cards: finishCardIds };
    setData({
      ...data,
      lists: {
        ...data.lists,
        [newStartList.id]: newStartList,
        [newFinishList.id]: newFinishList,
      },
    });
  };

  // Aktif kart verisini bulma
  let activeCardData = null;
  let activeListTitle = "";
  if (activeCard) {
    const list = data.lists[activeCard.listId];
    if (list) {
      activeCardData = list.cards.find((c) => c.id === activeCard.cardId);
      activeListTitle = list.title;
    }
  }

  // --- CRUD İŞLEMLERİ ---

  const addCard = (listId, content) => {
    const newCardId = uuidv4();
    const newCard = { id: newCardId, content };
    const list = data.lists[listId];
    const newList = { ...list, cards: [...list.cards, newCard] };
    setData({ ...data, lists: { ...data.lists, [newList.id]: newList } });
  };

  const updateCard = (listId, cardId, newFields) => {
    const list = data.lists[listId];
    const cardIndex = list.cards.findIndex((c) => c.id === cardId);
    const oldCard = list.cards[cardIndex];

    // Loglama mantığı
    let logActivity = null;
    if (
      newFields.labels &&
      newFields.labels.length > (oldCard.labels?.length || 0)
    ) {
      logActivity = createActivity("bir etiket ekledi.");
    } else if (newFields.dueDate && newFields.dueDate !== oldCard.dueDate) {
      logActivity = createActivity(
        `tarihi ${new Date(newFields.dueDate).toLocaleDateString(
          "tr-TR"
        )} olarak değiştirdi.`
      );
    } else if (newFields.coverColor && !oldCard.coverColor) {
      logActivity = createActivity("karta kapak rengi ekledi.");
    }

    let finalActivities = newFields.activities || oldCard.activities || [];
    if (logActivity) {
      finalActivities = [logActivity, ...finalActivities];
    }

    const newCard = {
      ...oldCard,
      ...newFields,
      activities: finalActivities,
    };

    const newCards = [...list.cards];
    newCards[cardIndex] = newCard;
    const newList = { ...list, cards: newCards };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });
  };

  const removeCard = (listId, cardId) => {
    const list = data.lists[listId];
    const newCards = list.cards.filter((card) => card.id !== cardId);
    const newList = { ...list, cards: newCards };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });
  };

  const removeList = (listId) => {
    if (!window.confirm("Listeyi silmek istediğine emin misin?")) return;
    const newListIds = data.listIds.filter((id) => id !== listId);
    const newLists = { ...data.lists };
    delete newLists[listId];
    setData({ ...data, listIds: newListIds, lists: newLists });
  };

  const duplicateList = (listId) => {
    const list = data.lists[listId];
    const newListId = uuidv4();
    const newCards = list.cards.map((card) => ({
      ...card,
      id: uuidv4(),
      activities: [],
    }));
    const newList = {
      id: newListId,
      title: `${list.title} (Kopya)`,
      cards: newCards,
    };
    const listIndex = data.listIds.indexOf(listId);
    const newListIds = [...data.listIds];
    newListIds.splice(listIndex + 1, 0, newListId);
    setData({
      ...data,
      lists: { ...data.lists, [newListId]: newList },
      listIds: newListIds,
    });
  };

  const clearList = (listId) => {
    if (!window.confirm("Bu listedeki TÜM kartlar silinecek. Emin misin?"))
      return;
    const list = data.lists[listId];
    const newList = { ...list, cards: [] };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });
  };

  const addList = () => {
    if (!listTitle.trim()) return;
    const newListId = uuidv4();
    const newList = { id: newListId, title: listTitle, cards: [] };
    setData({
      lists: { ...data.lists, [newListId]: newList },
      listIds: [...data.listIds, newListId],
    });
    setListTitle("");
    setIsAddingList(false);
  };

  const moveCardToAnotherList = (cardId, sourceListId, destListId) => {
    const sourceList = data.lists[sourceListId];
    const destList = data.lists[destListId];
    const logActivity = createActivity(
      `bu kartı ${sourceList.title} listesinden ${destList.title} listesine taşıdı.`
    );
    const sourceCards = [...sourceList.cards];
    const cardIndex = sourceCards.findIndex((c) => c.id === cardId);
    const [movedCard] = sourceCards.splice(cardIndex, 1);
    const updatedMovedCard = {
      ...movedCard,
      activities: [logActivity, ...(movedCard.activities || [])],
    };
    const destCards = [...destList.cards, updatedMovedCard];
    setData({
      ...data,
      lists: {
        ...data.lists,
        [sourceListId]: { ...sourceList, cards: sourceCards },
        [destListId]: { ...destList, cards: destCards },
      },
    });
    setActiveCard({ listId: destListId, cardId });
  };

  const duplicateCard = (listId, cardId) => {
    const list = data.lists[listId];
    const cardToCopy = list.cards.find((c) => c.id === cardId);
    if (!cardToCopy) return;
    const newCard = {
      ...cardToCopy,
      id: uuidv4(),
      content: `${cardToCopy.content} (Kopya)`,
      activities: [
        {
          id: uuidv4(),
          text: "Kart kopyalandı.",
          user: "Sistem",
          date: new Date().toLocaleString(),
          type: "system",
        },
      ],
    };
    const cardIndex = list.cards.findIndex((c) => c.id === cardId);
    const newCards = [...list.cards];
    newCards.splice(cardIndex + 1, 0, newCard);
    const newList = { ...list, cards: newCards };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-lists" direction="horizontal" type="list">
        {(provided) => (
          <div
            className="board-container"
            ref={provided.innerRef}
            {...provided.droppableProps}
            /* Board arka planı artık App.jsx'teki <main> tag'inde yönetiliyor */
          >
            {/* LİSTELER */}
            {data.listIds.map((listId, index) => {
              const list = data.lists[listId];
              return (
                <Draggable draggableId={list.id} index={index} key={list.id}>
                  {(provided) => (
                    <List
                      innerRef={provided.innerRef}
                      draggableProps={provided.draggableProps}
                      dragHandleProps={provided.dragHandleProps}
                      list={list}
                      addCard={addCard}
                      removeCard={removeCard}
                      removeList={removeList}
                      onCardClick={onCardClick}
                      searchString={searchString} // Filtreleme için App.jsx'ten gelen veri
                      updateListTitle={updateListTitle}
                      sortCards={sortCards}
                      currentUser={currentUser}
                      duplicateList={duplicateList}
                      clearList={clearList}
                    />
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {/* LİSTE EKLE BUTONU */}
            <div className="add-list-wrapper">
              {isAddingList ? (
                <div className="add-list-form">
                  <input
                    type="text"
                    className="list-input"
                    placeholder="Liste başlığı..."
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="add-list-actions">
                    <button className="btn-add-list" onClick={addList}>
                      Ekle
                    </button>
                    <button
                      className="btn-close-list"
                      onClick={() => setIsAddingList(false)}
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="add-list-btn"
                  onClick={() => setIsAddingList(true)}
                >
                  <FiPlus style={{ marginRight: "5px" }} /> Başka liste ekle
                </button>
              )}
            </div>
          </div>
        )}
      </Droppable>

      {/* KART DETAY MODALI */}
      {activeCardData && (
        <CardDetail
          card={activeCardData}
          listTitle={activeListTitle}
          listId={activeCard.listId}
          onClose={() => setActiveCard(null)}
          updateCard={updateCard}
          removeCard={removeCard}
          allLists={data.lists}
          moveCardToAnotherList={moveCardToAnotherList}
          currentUser={currentUser}
          duplicateCard={duplicateCard}
          allMembers={members}
          addMember={addMember}
        />
      )}
    </DragDropContext>
  );
};

export default Board;
