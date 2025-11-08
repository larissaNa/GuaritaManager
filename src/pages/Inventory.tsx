import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useInventory } from '../hooks/useFirestore';
import { InventoryItem, ProductCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Inventory: React.FC = () => {
  const { inventory, loading, addInventoryItem, updateInventoryItem, deleteInventoryItem, addStockMovement } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickMovementModalOpen, setIsQuickMovementModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('hortifrut');
  const [searchTerm, setSearchTerm] = useState('');
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');
  const [formData, setFormData] = useState({
    category: 'hortifrut' as ProductCategory,
    customCategory: '',
    isCustomCategory: false,
    name: '',
    customName: '',
    isCustomProduct: false,
    currentQuantity: 0,
    minStockAlert: 5,
    unit: 'kg'
  });
  const [quickMovementData, setQuickMovementData] = useState({
    quantity: 0,
    observation: ''
  });

  const categories = [
  { value: 'hortifrut', label: 'Hortifrut', icon: '🥦' },
  { value: 'mercearia', label: 'Mercearia', icon: '🛒' },
  { value: 'bebidas-bar', label: 'Bebidas/Bar', icon: '🍹' },
  { value: 'peixes', label: 'Peixes', icon: '🐟' },
  { value: 'carnes', label: 'Carnes', icon: '🥩' },
  { value: 'frios-congelados', label: 'Frios/Congelados', icon: '🧊' },
  { value: 'descartaveis', label: 'Descartáveis', icon: '🥤' },
  { value: 'limpeza', label: 'Limpeza', icon: '🧹' },
  { value: 'material-administrativo', label: 'Material Administrativo', icon: '📎' },
];

// Pre-defined products for each category
const defaultProducts = {
  hortifrut: [
    'Abóbora', 'Batata Inglesa', 'Tomate', 'Cebola', 'Alface',
    'Mandioca', 'Cenoura', 'Repolho', 'Pimentão Verde', 'Pimentão Amarelo',
    'Pimentão Vermelho', 'Couve', 'Cheiro Verde', 'Coentro', 'Cebolinha',
    'Salsinha', 'Coco Verde', 'Alecrim', 'Tomilho', 'Abobrinha', 'Brócolis',
    'Pepino', 'Banana da Terra', 'Gengibre', 'Alho', 'Limão', 'Hortelã',
    'Maracujá', 'Laranja', 'Abacaxi', 'Acerola Polpa', 'Cajá Polpa',
    'Goiaba Polpa', 'Morango Fresco', 'Manjericão', 'Kiwi', 'Pimenta Dedo de Moça'
  ],
  mercearia: [
    'Arroz Comum', 'Arroz Arbório', 'Creme de Leite', 'Leite Longa Vida', 'Leite de Coco',
    'Leite Condensado', 'Farinha de Trigo', 'Farinha Panko', 'Farinha de Mandioca', 'Mandioca',
    'Azeite Extra Virgem', 'Sal', 'Sal Grosso', 'Açúcar', 'Café', 'Ketchup 5L', 'Cream Cheese',
    'Batata Palha', 'Batata Palito', 'Ervilha Congelada', 'Abóbora Congelada',
    'Massa de Pastel', 'Colorau', 'Pimenta do Reino', 'Pimenta Biquinho', 'Orégano',
    'Shoyu', 'Folha de Louro', 'Açafrão', 'Ovo de Codorna', 'Ovo de Granja',
    'Alho Frito', 'Manteiga 5kg', 'Óleo de Soja', 'Molho Barbecue', 'Vinagre',
    'Macarrão Espaguete', 'Macarrão Ninho', 'Palito de Espeto', 'Farinha de Rosca',
    'Morango Congelado', 'Azeite de Dendê', 'Feijão Branco', 'Feijão Preto', 'Feijão Carioca',
    'Chocolate Meio Amargo', 'Goiabada', 'Biscoito Maisena', 'Vinho Tinto Seco',
    'Maionese 5L', 'Queijo Parmesão', 'Gelatina Incolor', 'Extrato de Tomate',
    'Azeitona Balde', 'Milho Verde Balde', 'Rapadura', 'Mostarda', 'Ketchup Sachê',
    'Maionese Sachê', 'Palito de Dente', 'Sal Sachê', 'Açúcar Sachê',
    'Garrafa de Água', 'Esqueiro', 'Botijão de Gás', 'Gás Maçarico',
    'Caldo de Carne', 'Caldo de Galinha', 'Caldo de Legumes'
  ],
  'bebidas-bar': [
    'Gin Tanqueray', 'Gin Rocks', 'Vodka Absolut', 'Vodka Smirnoff', 'Vodka Orlof',
    'Lira', 'Montilla', 'Velho Barreiro', 'Bacardi', 'Cachaça 51', 'Licor Ballena',
    'Licor Maçã Verde', 'Tequila', 'Vermute', 'Aperol', 'Whisky Old Parr',
    'Whisky Chivas', 'Whisky Red Label', 'Whisky Black & White', 'Cachaça Seleto',
    'Cachaça Salina', 'Conhaque Domecq', 'Cachaça Dreher', 'Curaçau Blue',
    'Xarope Grenadine', 'Campari', 'Sidra Cereser', 'Espumante', 'Vinhos',
    'Corona Long Neck', 'Heineken Long Neck', 'Heineken 600ml', 'Stella Artois Long Neck',
    'Stella Artois 600ml', 'Sol Long Neck', 'Eisenbahn 600ml', 'Bohemia 600ml',
    'Spaten 600ml', 'Original 600ml', 'Skol 600ml', 'Zero Álcool Long Neck',
    'Água sem Gás 500ml', 'Água com Gás 500ml', 'Kuat Lata', 'Fanta Lata',
    'Coca-Cola Lata', 'Coca-Cola Zero Lata', 'Sprite Lata', 'Sprite Zero Lata',
    'Schweppes Lata', 'Coca-Cola 1L', 'Coca-Cola Zero 1L', 'Coca-Cola KS',
    'Fanta KS', 'Kuat KS', 'Sprite KS', 'Coca-Cola LS', 'Coca-Cola Zero LS',
    'H2OH', 'Água Tônica', 'Cajuína', 'Red Bull', 'Monster Grande', 'Monster Pequeno'
  ],
  peixes: [
    'Tilápia 1kg', 'Tilápia 1,5kg', 'Camarão 15g', 'Camarão 30g',
    'Manjuba', 'Filé Branquinho/Tilápia', 'Salmão'
  ],
  carnes: [
    'Contra Filé', 'Picanha', 'Fraldinha', 'Filé de Frango (Peito)',
    'Frango a Passarinho', 'Barriga de Porco', 'Bacon Fatiado', 'Bacon Peça',
    'Filé Mignon', 'Carneiro', 'Galinha Caipira', 'Frango Desossado',
    'Carne de Sol/Coxão Mole', 'Pé de Porco', 'Orelha de Porco', 'Rabo de Porco'
  ],
  'frios-congelados': [
    'Queijo Mussarela', 'Queijo Coalho', 'Presunto', 'Cheddar Bisnaga',
    'Catupiry Bisnaga', 'Calabresa Pacote', 'Sorvete de Creme',
    'Croquete de Carne', 'Pastel de Carne', 'Pastel de Frango', 'Pastel de Queijo',
    'Pastel de Camarão', 'Pastel Misto', 'Bolinho de Camarão',
    'Bolinho de Carne de Sol', 'Bolinho de Bacalhau'
  ],
  descartaveis: [
    'Canudos', 'Marmitex', 'Bobina 3kg', 'Bobina 5kg', 'Bobina 2kg',
    'Papel Alumínio', 'Plástico PVC', 'Papel Toalha', 'Pano Reutilizável',
    'Copos 200ml', 'Copos 300ml', 'Copos 100ml', 'Guardanapos',
    'Papel Toalha para Fritos'
  ],
  limpeza: [
    'Óleo de Peroba', 'Luvas de Limpeza', 'Luvas Descartáveis',
    'Máscaras', 'Toucas', 'Água Sanitária 5L', 'Sabonete Líquido 5L',
    'Papel Higiênico Rolão', 'Papel Higiênico Comum', 'Papel Toalha Fardo',
    'Limpa Vidro', 'Desinfetante 5L', 'Sabão em Pó 5kg', 'Detergente 5L',
    'Bombril', 'Esponja de Louça', 'Escova Sanitária', 'Vassoura', 'Rodo',
    'Flanelas', 'Pano de Prato', 'Pano de Chão', 'Vassoura de Vasculhar',
    'Bom-Ar', 'Amaciante 5L', 'Álcool 70%', 'Pá', 'Pano para Madeira',
    'Sabão em Barra', 'Saco de Lixo 30L', 'Saco de Lixo 50L',
    'Saco de Lixo 100L', 'Saco de Lixo 200L', 'Pastilhas Sanitárias',
    'Vassoura de Palha'
  ],
  'material-administrativo': [
    'Canetas', 'Lápis', 'Borracha', 'Post-it', 'Grampeador', 'Grampo',
    'Clipes', 'Bobina Impressora 8mm', 'Chamex', 'Tesoura',
    'Agenda/Caderno', 'Ligas', 'Fita Durex', 'Régua', 'Pasta com Elástico',
    'Tinta para Carimbo', 'Corretivo', 'Pilha Chama-Garçons'
  ]
};


  const units = ['kg', 'unidade', 'litro', 'pacote', 'peça'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = formData.isCustomCategory ? formData.customCategory : formData.category;
      const finalName = formData.isCustomProduct ? formData.customName : formData.name;
      const itemData = {
        category: finalCategory as ProductCategory,
        name: finalName,
        currentQuantity: formData.currentQuantity,
        minStockAlert: formData.minStockAlert,
        unit: formData.unit,
        initialQuantity: 0,
        entries: 0,
        exits: 0
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id!, itemData);
      } else {
        await addInventoryItem(itemData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleQuickMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quickMovementData.quantity <= 0) return;

    try {
      await addStockMovement({
        inventoryItemId: selectedItem.id!,
        type: movementType,
        quantity: quickMovementData.quantity,
        date: new Date().toISOString().split('T')[0],
        observation: quickMovementData.observation
      });
      setIsQuickMovementModalOpen(false);
      resetQuickMovementForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleQuickEntry = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementType('entry');
    setIsQuickMovementModalOpen(true);
  };

  const handleQuickExit = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementType('exit');
    setIsQuickMovementModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    const isCustomCategory = !categories.some(cat => cat.value === item.category);
    const isCustomProduct = !defaultProducts[item.category as keyof typeof defaultProducts]?.includes(item.name);
    setFormData({
      category: isCustomCategory ? 'hortifrut' as ProductCategory : item.category,
      customCategory: isCustomCategory ? item.category : '',
      isCustomCategory,
      name: isCustomProduct ? '' : item.name,
      customName: isCustomProduct ? item.name : '',
      isCustomProduct,
      currentQuantity: item.currentQuantity,
      minStockAlert: item.minStockAlert,
      unit: item.unit
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteInventoryItem(item.id!);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const initializeDefaultProducts = async () => {
  const existingProducts = new Set(inventory.map(item => item.name.toLowerCase()));

  for (const [category, products] of Object.entries(defaultProducts)) {
    for (const productName of products) {
      if (!existingProducts.has(productName.toLowerCase())) {
        try {
          await addInventoryItem({
            category: category as ProductCategory,
            name: productName,
            initialQuantity: 0,
            currentQuantity: 0,
            entries: 0,
            exits: 0,
            minStockAlert: 5,
            unit: category === 'peixes' || category === 'carnes' || category === 'hortifrut' ? 'kg' : 'unidade'
          });
        } catch (error) {
          console.error(`Erro ao adicionar ${productName}:`, error);
        }
      }
    }
  }
};

  useEffect(() => {
    if (inventory.length === 0 && !loading) {
      initializeDefaultProducts();
    }
  }, [inventory.length, loading]);

  const resetForm = () => {
    setFormData({
      category: 'hortifrut',
      customCategory: '',
      isCustomCategory: false,
      name: '',
      customName: '',
      isCustomProduct: false,
      currentQuantity: 0,
      minStockAlert: 5,
      unit: 'kg'
    });
    setEditingItem(null);
  };

  const resetQuickMovementForm = () => {
    setQuickMovementData({
      quantity: 0,
      observation: ''
    });
    setSelectedItem(null);
  };

  const filteredInventory = inventory
    .filter(item => {
      // Handle both predefined and custom categories
      if (categories.some(cat => cat.value === selectedCategory)) {
        return item.category === selectedCategory;
      }
      // If selectedCategory is not in predefined list, show all custom categories
      return !categories.some(cat => cat.value === item.category);
    })
    .filter(item => 
      searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const lowStockItems = inventory.filter(item => item.currentQuantity <= item.minStockAlert);

  const getCategoryStats = () => {
    // Get all unique categories from inventory (including custom ones)
    const allCategories = Array.from(new Set(inventory.map(item => item.category)));
    
    return allCategories.map(categoryValue => {
      const categoryItems = inventory.filter(item => item.category === categoryValue);
      const totalStock = categoryItems.reduce((sum, item) => sum + item.currentQuantity, 0);
      const lowStockCount = categoryItems.filter(item => item.currentQuantity <= item.minStockAlert).length;
      
      // Find predefined category or use custom name
      const predefinedCategory = categories.find(cat => cat.value === categoryValue);
      
      return {
        category: predefinedCategory ? predefinedCategory.label : categoryValue,
        totalStock,
        lowStockCount,
        itemCount: categoryItems.length
      };
    });
  };

  const columns = [
    {
      key: 'name',
      title: 'Nome do Produto'
    },
    {
      key: 'entries',
      title: 'Entrada',
      render: (value: number, record: InventoryItem) => `${value} ${record.unit}`
    },
    {
      key: 'exits',
      title: 'Saída',
      render: (value: number, record: InventoryItem) => `${value} ${record.unit}`
    },
    {
      key: 'currentQuantity',
      title: 'Quantidade Atual',
      render: (value: number, record: InventoryItem) => (
        <span className={value <= record.minStockAlert ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
          {value} {record.unit}
          {value <= record.minStockAlert && (
            <span className="ml-1 text-xs">⚠️</span>
          )}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: InventoryItem) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:space-x-1">
          <button
            onClick={() => handleQuickEntry(record)}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            title="Adicionar Entrada"
          >
            + Entrada
          </button>
          <button
            onClick={() => handleQuickExit(record)}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            title="Registrar Saída"
          >
            - Saída
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
        <button
          onClick={() => {
            setFormData({ ...formData, category: selectedCategory });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Novo Produto
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Alerta de Estoque Baixo:</strong> {lowStockItems.length} item(ns) com estoque abaixo do mínimo.
              </p>
              <div className="mt-2 text-sm text-yellow-600">
                {lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id}>
                    • {item.name}: {item.currentQuantity} {item.unit} (mín: {item.minStockAlert})
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <div>... e mais {lowStockItems.length - 3} item(ns)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-2 px-4 py-2 sm:space-x-4 sm:px-6 sm:py-0" aria-label="Tabs">
            {/* Predefined Categories */}
            {categories.map((category) => {
              const categoryItems = inventory.filter(item => item.category === category.value);
              const lowStockInCategory = categoryItems.filter(item => item.currentQuantity <= item.minStockAlert).length;
              
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`${
                    selectedCategory === category.value
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  } whitespace-nowrap py-2 px-3 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 rounded-t-lg transition-colors`}
                >
                  <span className="text-base sm:text-lg">{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden text-xs font-semibold">{category.label.split(' ')[0]}</span>
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                    {categoryItems.length}
                  </span>
                  {lowStockInCategory > 0 && (
                    <span className="bg-red-100 text-red-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                      {lowStockInCategory} ⚠️
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Custom Categories */}
            {Array.from(new Set(inventory.map(item => item.category)))
              .filter(cat => !categories.some(predefined => predefined.value === cat))
              .map((customCategory) => {
                const categoryItems = inventory.filter(item => item.category === customCategory);
                const lowStockInCategory = categoryItems.filter(item => item.currentQuantity <= item.minStockAlert).length;
                
                return (
                  <button
                    key={customCategory}
                    onClick={() => setSelectedCategory(customCategory)}
                    className={`${
                      selectedCategory === customCategory
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } whitespace-nowrap py-2 px-3 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 rounded-t-lg transition-colors`}
                  >
                    <span className="text-base sm:text-lg">📁</span>
                    <span className="hidden sm:inline">{customCategory}</span>
                    <span className="sm:hidden text-xs font-semibold">{customCategory.split(' ')[0]}</span>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                      {categoryItems.length}
                    </span>
                    {lowStockInCategory > 0 && (
                      <span className="bg-red-100 text-red-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                        {lowStockInCategory} ⚠️
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Search and Stats for Selected Category */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder={`Buscar em ${categories.find(c => c.value === selectedCategory)?.label}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            
            {/* Category Stats */}
            <div className="flex flex-wrap gap-2 sm:space-x-4 text-sm">
              <div className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
                <span className="text-blue-700 font-medium">
                  Total: {filteredInventory.reduce((sum, item) => sum + item.currentQuantity, 0).toFixed(1)} itens
                </span>
              </div>
              <div className="bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                <span className="text-green-700 font-medium">
                  Produtos: {filteredInventory.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Stock Chart */}
        {!loading && inventory.length > 0 && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Estoque por Categoria</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoryStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalStock' ? `${value} itens` : value,
                      name === 'totalStock' ? 'Total em Estoque' : name === 'lowStockCount' ? 'Estoque Baixo' : 'Produtos'
                    ]}
                  />
                  <Bar dataKey="totalStock" fill="#3B82F6" name="totalStock" />
                  <Bar dataKey="lowStockCount" fill="#EF4444" name="lowStockCount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span className="text-lg sm:text-xl">{categories.find(c => c.value === selectedCategory)?.icon || '📁'}</span>
            <span className="truncate">{categories.find(c => c.value === selectedCategory)?.label || selectedCategory}</span>
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">({filteredInventory.length} produtos)</span>
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredInventory}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingItem ? 'Editar Item' : 'Novo Item de Estoque'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={!formData.isCustomCategory}
                    onChange={() => setFormData({ ...formData, isCustomCategory: false, customCategory: '', name: '', customName: '', isCustomProduct: false })}
                    className="mr-2"
                  />
                  <span className="text-sm">Categoria existente</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={formData.isCustomCategory}
                    onChange={() => setFormData({ ...formData, isCustomCategory: true, category: 'hortifrut', name: '', customName: '', isCustomProduct: true })}
                    className="mr-2"
                  />
                  <span className="text-sm">Nova categoria</span>
                </label>
              </div>
              
              {!formData.isCustomCategory ? (
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value as ProductCategory;
                    setFormData({ ...formData, category: newCategory, name: '', customName: '', isCustomProduct: false });
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required={!formData.isCustomCategory}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Digite o nome da nova categoria"
                  required={formData.isCustomCategory}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="productType"
                    checked={!formData.isCustomProduct}
                    onChange={() => setFormData({ ...formData, isCustomProduct: false, customName: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Produto da lista</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="productType"
                    checked={formData.isCustomProduct}
                    onChange={() => setFormData({ ...formData, isCustomProduct: true, name: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Novo produto</span>
                </label>
              </div>
              
              {!formData.isCustomProduct && !formData.isCustomCategory ? (
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required={!formData.isCustomProduct && !formData.isCustomCategory}
                >
                  <option value="">Selecione um produto</option>
                  {defaultProducts[formData.category as keyof typeof defaultProducts]?.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.customName}
                  onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Digite o nome do novo produto"
                  required={formData.isCustomProduct || formData.isCustomCategory}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantidade Atual</label>
            <input
              type="number"
              value={formData.currentQuantity}
              onChange={(e) => setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade Mínima</label>
              <input
                type="number"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unidade</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editingItem ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Movement Modal */}
      <Modal
        isOpen={isQuickMovementModalOpen}
        onClose={() => {
          setIsQuickMovementModalOpen(false);
          resetQuickMovementForm();
        }}
        title={`${movementType === 'entry' ? '+ Entrada' : '- Saída'} - ${selectedItem?.name}`}
      >
        <form onSubmit={handleQuickMovement} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Produto:</span>
              <span className="font-medium">{selectedItem?.name}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Estoque Atual:</span>
              <span className="font-medium">{selectedItem?.currentQuantity} {selectedItem?.unit}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className={`font-medium px-2 py-1 rounded text-sm ${
                movementType === 'entry' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {movementType === 'entry' ? 'Entrada' : 'Saída'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quickMovementData.quantity}
              onChange={(e) => setQuickMovementData({ ...quickMovementData, quantity: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={`Quantidade em ${selectedItem?.unit}`}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observação (opcional)</label>
            <textarea
              value={quickMovementData.observation}
              onChange={(e) => setQuickMovementData({ ...quickMovementData, observation: e.target.value })}
              rows={2}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Motivo da movimentação..."
            />
          </div>

          {quickMovementData.quantity > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-700">
                <strong>Resultado:</strong> {selectedItem?.currentQuantity} {selectedItem?.unit} 
                {movementType === 'entry' ? ' + ' : ' - '}
                {quickMovementData.quantity} {selectedItem?.unit} = 
                <span className="font-bold">
                  {movementType === 'entry' 
                    ? (selectedItem?.currentQuantity || 0) + quickMovementData.quantity
                    : (selectedItem?.currentQuantity || 0) - quickMovementData.quantity
                  } {selectedItem?.unit}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsQuickMovementModalOpen(false);
                resetQuickMovementForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                movementType === 'entry'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {movementType === 'entry' ? '+ Registrar Entrada' : '- Registrar Saída'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
