import { firestoreService } from '../services/firestoreService';

export const initializeInventoryData = async () => {
  try {
    // Check if inventory already has data
    const existingItems = await firestoreService.getInventoryItems();
    
    if (existingItems.length === 0) {
      console.log('Inicializando dados de estoque...');
      await firestoreService.initializeSampleInventory();
      console.log('Dados de estoque inicializados com sucesso!');
      return true;
    } else {
      console.log('Dados de estoque já existem, pulando inicialização.');
      return false;
    }
  } catch (error) {
    console.error('Erro ao inicializar dados de estoque:', error);
    throw error;
  }
};
