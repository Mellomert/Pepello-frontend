import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import confetti from "canvas-confetti";
import CardDetail from "../CardDetail/CardDetail";
import List from "../List/List";
import { FiPlus, FiX } from "react-icons/fi";
import "./Board.css";

const Board = ({ currentUser, boardId, members, addMember, searchString }) => {
  // --- STATE ---
  const [data, setData] = useState({
    lists: {},
    listIds: [],
  });
  const [loading, setLoading] = useState(true);

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [activeCard, setActiveCard] = useState(null);

  const token = localStorage.getItem("token");

  // --- 1. DASHBOARD VERİSİNİ ÇEKME ---
  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/project/${boardId}/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const dashboardData = await response.json();
        const states = dashboardData.states || [];
        const tasks = dashboardData.tasks || [];

        const newLists = {};
        const newListIds = [];

        // Listeleri oluştur
        states.forEach((state) => {
          newListIds.push(state.id);
          newLists[state.id] = {
            id: state.id,
            title: state.stateName,
            cards: [],
          };
        });

        // Taskları dağıt
        tasks.forEach((task) => {
          const stateId = task.state?.id;
          if (stateId && newLists[stateId]) {
            const formattedCard = {
              id: task.id,
              content: task.taskTitle || "İsimsiz Kart",
              description: task.taskDescription || "",
              ...task,
            };
            newLists[stateId].cards.push(formattedCard);
          }
        });

        setData({
          lists: newLists,
          listIds: newListIds,
        });
      } else {
        console.error("Dashboard verisi çekilemedi:", response.status);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) fetchBoardData();
  }, [boardId]);

  // --- 2. LİSTE EKLEME ---
  const addList = async () => {
    if (!listTitle.trim()) return;
    try {
      const response = await fetch("http://localhost:8080/api/state/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: boardId,
          stateName: listTitle,
          icon: "c08d82ee-bd03-4c60-88d0-7863a0655f06",
          color: "blue",
        }),
      });
      if (response.ok) {
        setListTitle("");
        setIsAddingList(false);
        fetchBoardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. KART EKLEME ---
  const addCard = async (listId, content) => {
    try {
      const response = await fetch("http://localhost:8080/api/task/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stateId: listId,
          projectId: boardId,
          taskTitle: content,
          taskDescription: "Açıklama girilmedi",
          media: null,
          assignee: null,
        }),
      });
      if (response.ok) fetchBoardData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. KART GÜNCELLEME (DÜZELTİLDİ: PATCH + ID in URL) ---
  const updateCard = async (listId, cardId, newFields) => {
    // 1. Frontend'de Hızlı Güncelle (Optimistic UI)
    const list = data.lists[listId];
    const cardIndex = list.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const currentCard = list.cards[cardIndex];
    const updatedCard = { ...currentCard, ...newFields };
    const newCards = [...list.cards];
    newCards[cardIndex] = updatedCard;

    const newList = { ...list, cards: newCards };
    setData({ ...data, lists: { ...data.lists, [listId]: newList } });

    // 2. Backend İsteği
    // Sadece içerik veya açıklama değiştiğinde istek atıyoruz
    if (newFields.content || newFields.description) {
      try {
        await fetch(`http://localhost:8080/api/task/${cardId}`, {
          method: "PATCH", // İsteğin üzerine PATCH yapıldı
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Backend TaskUpdateRequest yapısına uygun veriler
            taskTitle:
              newFields.content !== undefined
                ? newFields.content
                : currentCard.taskTitle,
            taskDescription:
              newFields.description !== undefined
                ? newFields.description
                : currentCard.taskDescription || "Açıklama",
            stateId: listId,
          }),
        });
      } catch (err) {
        console.error("Kart güncelleme hatası:", err);
      }
    }
  };

  // --- 5. KART TAŞIMA (Listeler Arası) ---
  const moveCardToAnotherList = async (cardId, sourceListId, destListId) => {
    const result = {
      draggableId: cardId,
      source: { droppableId: sourceListId, index: 0 },
      destination: { droppableId: destListId, index: 0 },
      type: "DEFAULT",
    };
    await onDragEnd(result);
    setActiveCard({ listId: destListId, cardId: cardId });
  };

  // --- 6. SÜRÜKLE & BIRAK ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    if (type === "list") {
      const newListIds = Array.from(data.listIds);
      newListIds.splice(source.index, 1);
      newListIds.splice(destination.index, 0, draggableId);
      setData({ ...data, listIds: newListIds });
      return;
    }

    const startList = data.lists[source.droppableId];
    const finishList = data.lists[destination.droppableId];
    const startCards = Array.from(startList.cards);
    const [movedCard] = startCards.splice(source.index, 1);

    if (startList === finishList) {
      startCards.splice(destination.index, 0, movedCard);
      const newList = { ...startList, cards: startCards };
      setData({ ...data, lists: { ...data.lists, [newList.id]: newList } });
    } else {
      const finishCards = Array.from(finishList.cards);
      finishCards.splice(destination.index, 0, movedCard);
      const newStartList = { ...startList, cards: startCards };
      const newFinishList = { ...finishList, cards: finishCards };
      setData({
        ...data,
        lists: {
          ...data.lists,
          [newStartList.id]: newStartList,
          [newFinishList.id]: newFinishList,
        },
      });

      if (
        finishList.title &&
        finishList.title.toLowerCase().includes("bitti")
      ) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }

    try {
      await fetch(`http://localhost:8080/api/task/${draggableId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStateId: finishList.id }),
      });
    } catch (err) {
      console.error("Taşıma hatası:", err);
      fetchBoardData();
    }
  };

  // --- SİLME ---
  const removeList = async (listId) => {
    if (!window.confirm("Listeyi silmek istiyor musun?")) return;
    try {
      await fetch(`http://localhost:8080/api/state/${listId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBoardData();
    } catch (err) {
      console.error(err);
    }
  };

  const removeCard = async (listId, cardId) => {
    try {
      await fetch(`http://localhost:8080/api/task/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBoardData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateListTitle = async (listId, newTitle) => {
    const list = data.lists[listId];
    list.title = newTitle;
    setData({ ...data });
    try {
      await fetch(`http://localhost:8080/api/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: listId, stateName: newTitle }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const duplicateCard = async (listId, cardId) => {
    alert("Kopyalama özelliği henüz backend'de aktif değil.");
  };

  if (loading)
    return <div style={{ color: "white", padding: "20px" }}>Yükleniyor...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-lists" direction="horizontal" type="list">
        {(provided) => (
          <div
            className="board-container"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {data.listIds.map((listId, index) => {
              const list = data.lists[listId];
              if (!list) return null;
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
                      onCardClick={(lid, cid) =>
                        setActiveCard({ listId: lid, cardId: cid })
                      }
                      searchString={searchString}
                      updateListTitle={updateListTitle}
                      currentUser={currentUser}
                    />
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            <div className="add-list-wrapper">
              {isAddingList ? (
                <div className="add-list-form">
                  <input
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

      {activeCard && data.lists[activeCard.listId] && (
        <CardDetail
          card={data.lists[activeCard.listId].cards.find(
            (c) => c.id === activeCard.cardId
          )}
          listTitle={data.lists[activeCard.listId].title}
          listId={activeCard.listId}
          onClose={() => setActiveCard(null)}
          currentUser={currentUser}
          updateCard={updateCard}
          removeCard={removeCard}
          allLists={data.lists}
          moveCardToAnotherList={moveCardToAnotherList}
          duplicateCard={duplicateCard}
          allMembers={members}
          addMember={() => alert("Üyeyi ana ekrandan eklemelisiniz.")}
        />
      )}
    </DragDropContext>
  );
};

export default Board;
