// src/data.js
import { v4 as uuidv4 } from 'uuid';

const initialData = {
  lists: {
    'list-1': {
      id: 'list-1',
      title: 'Bugün',
      cards: [
        { id: uuidv4(), content: 'React projesini kur' },
        { id: uuidv4(), content: 'Github reposu oluştur' },
      ]
    },
    'list-2': {
      id: 'list-2',
      title: 'Bu Hafta',
      cards: [
        { id: uuidv4(), content: 'Drag and Drop kütüphanesini araştır' },
        { id: uuidv4(), content: 'Tasarım taslağını çıkar' },
        { id: uuidv4(), content: 'Veritabanı şemasını çiz' },
      ]
    },
    'list-3': {
      id: 'list-3',
      title: 'Daha Sonra',
      cards: []
    }
  },
  // Listelerin hangi sırada gösterileceğini tutan dizi
  listIds: ['list-1', 'list-2', 'list-3'],
};

export default initialData;