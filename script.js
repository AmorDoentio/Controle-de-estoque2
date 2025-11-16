//javascript:Lógica do Aplicativo (Estoque):script.js
// --- Importações do Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    setLogLevel, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    query,
    writeBatch, // Importa o writeBatch para transações
    getDoc // Importa getDoc para ler um doc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuração do Firebase ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Variáveis Globais do App ---
let app, auth, db, userId, productsCollectionRef, movementsCollectionRef;
let localProducts = []; // Cache local de produtos

// --- Seletores do DOM ---
let navLinks, pages;
// Modais
let productModal, stockMovementModal;
// Botões
let openProductModalBtn, cancelProductModalBtn;
let openEntryModalBtn, openExitModalBtn, cancelMovementModalBtn;
// Formulários
let productForm, stockMovementForm;
// Tabelas
let productTableBody, stockTableBody;
// Inputs
let productSearchInput;
// Dashboard Cards
let dashboardTotalItems, dashboardTotalValue;

// --- Inicialização do App ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Seletores do DOM ---
    navLinks = document.querySelectorAll('.nav-link');
    pages = document.querySelectorAll('.page-content');
    
    // --- Página 1 (Dashboard) ---
    dashboardTotalItems = document.getElementById('dashboardTotalItems');
    dashboardTotalValue = document.getElementById('dashboardTotalValue');

    // --- Página 2 (Produtos) ---
    productModal = document.getElementById('productModal');
    openProductModalBtn = document.getElementById('openProductModalBtn');
    cancelProductModalBtn = document.getElementById('cancelModalBtn');
    productForm = document.getElementById('productForm');
    productTableBody = document.getElementById('productTableBody');
    productSearchInput = document.getElementById('productSearchInput');

    // --- Página 3 (Estoque) ---
    stockTableBody = document.getElementById('stockTableBody');
    stockMovementModal = document.getElementById('stockMovementModal');
    openEntryModalBtn = document.getElementById('openEntryModalBtn');
    openExitModalBtn = document.getElementById('openExitModalBtn');
    cancelMovementModalBtn = document.getElementById('cancelMovementModalBtn');
    stockMovementForm = document.getElementById('stockMovementForm');

    // Inicializa o Firebase
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        setLogLevel('Debug');
        console.log("Firebase inicializado com sucesso!");
        handleAuthentication();
    } catch (e) {
        console.error("Erro ao iniciar o Firebase:", e);
        if(productTableBody) productTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Erro ao conectar ao banco de dados.</td></tr>';
    }

    // --- LÓGICA DE NAVEGAÇÃO ---
    setupNavigation();

    // --- LÓGICA DOS MODAIS ---
    setupModalLogic();

    // --- LÓGICA (SIMULADA) DOS BOTÕES DE IA ---
    setupIASimulations();

    // --- LÓGICA DE PRODUTOS (Página 2) ---
    setupProductLogic();

    // --- LÓGICA DE ESTOQUE (Página 3) ---
    setupStockLogic();
});

// --- Funções de Configuração ---

function setupNavigation() {
    if (navLinks && pages) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPageId = link.getAttribute('data-page');
                
                pages.forEach(page => page.classList.add('hidden'));
                const targetPage = document.getElementById(targetPageId);
                if (targetPage) targetPage.classList.remove('hidden');
                
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
}

function setupModalLogic() {
    // Modal de Produto (Pág 2)
    if (openProductModalBtn) openProductModalBtn.addEventListener('click', () => openModal(productModal));
    if (cancelProductModalBtn) cancelProductModalBtn.addEventListener('click', () => {
        closeModal(productModal);
        productForm.reset(); // Limpa o formulário ao cancelar
    });
    if (productModal) productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal(productModal);
            productForm.reset();
        }
    });

    // Modal de Movimentação (Pág 3)
    if (openEntryModalBtn) openEntryModalBtn.addEventListener('click', () => openMovementModal('entrada'));
    if (openExitModalBtn) openExitModalBtn.addEventListener('click', () => openMovementModal('saida'));
    if (cancelMovementModalBtn) cancelMovementModalBtn.addEventListener('click', () => {
        closeModal(stockMovementModal);
        stockMovementForm.reset();
    });
    if (stockMovementModal) stockMovementModal.addEventListener('click', (e) => {
        if (e.target === stockMovementModal) {
            closeModal(stockMovementModal);
            stockMovementForm.reset();
        }
    });
}

function setupProductLogic() {
    // Salvar novo produto
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newProduct = {
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                size: document.getElementById('prodSize').value,
                object: document.getElementById('prodObject').value,
                description: document.getElementById('prodDescription').value,
                price: parseFloat(document.getElementById('prodPrice').value) || 0, // Novo
                quantity: parseInt(document.getElementById('prodQuantity').value) || 0, // Novo
                createdAt: new Date()
            };

            try {
                await addDoc(productsCollectionRef, newProduct);
                console.log('Produto salvo com sucesso!');
                closeModal(productModal);
                productForm.reset();
            } catch (error) {
                console.error("Erro ao salvar produto:", error);
            }
        });
    }

    // Busca de produto
    if (productSearchInput) {
        productSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = localProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.object.toLowerCase().includes(searchTerm)
            );
            renderProductTable(filteredProducts);
        });
    }

    // Excluir produto
    if (productTableBody) {
        productTableBody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.getAttribute('data-id');
                // Adicionar confirmação
                if (confirm('Tem certeza que deseja excluir este produto? Isso não pode ser desfeito.')) {
                    try {
                        const docRef = doc(db, productsCollectionRef.path, id);
                        await deleteDoc(docRef);
                        console.log("Produto excluído!");
                        // A tabela será atualizada automaticamente pelo onSnapshot
                    } catch (error) {
                        console.error("Erro ao excluir produto:", error);
                    }
                }
            }
        });
    }
}

function setupStockLogic() {
    // Salvar movimentação de estoque
    if (stockMovementForm) {
        stockMovementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productId = document.getElementById('movementProductSelect').value;
            const quantity = parseInt(document.getElementById('movementQuantityInput').value);
            const type = document.getElementById('movementTypeInput').value;
            const submitButton = stockMovementForm.querySelector('button[type="submit"]');

            if (!productId || !quantity || quantity <= 0) {
                alert("Por favor, selecione um produto e insira uma quantidade válida.");
                return;
            }

            submitButton.disabled = true; // Desabilita o botão para evitar cliques duplos
            submitButton.textContent = "Salvando...";

            // Pega a referência do documento do produto
            const productRef = doc(db, productsCollectionRef.path, productId);

            try {
                // Precisamos ler o produto *exatamente* neste momento para evitar erros de concorrência
                // Em um app maior, usaríamos uma "Transação" do Firebase.
                // Por simplicidade, vamos usar um Batch Write e assumir que o cache 'localProducts' está ok.
                
                const product = localProducts.find(p => p.id === productId);
                if (!product) throw new Error("Produto não encontrado no cache local.");

                let newQuantity;
                if (type === 'entrada') {
                    newQuantity = product.quantity + quantity;
                } else {
                    newQuantity = product.quantity - quantity;
                    if (newQuantity < 0) {
                        alert('Operação cancelada. O estoque não pode ficar negativo.');
                        submitButton.disabled = false;
                        submitButton.textContent = "Salvar Movimentação";
                        return;
                    }
                }

                // Usar um Batch Write para garantir que ambas as operações funcionem
                const batch = writeBatch(db);

                // 1. Atualiza a quantidade na coleção 'products'
                batch.update(productRef, { quantity: newQuantity });

                // 2. Registra o movimento na coleção 'movements'
                const movementRef = doc(movementsCollectionRef); // Cria um novo doc com ID aleatório
                batch.set(movementRef, {
                    productId: productId,
                    productName: product.name, // Salva o nome para facilitar relatórios
                    quantityChanged: quantity,
                    newQuantity: newQuantity, // Salva a nova quantidade total
                    type: type,
                    date: new Date()
                });

                await batch.commit();
                console.log("Movimentação de estoque salva com sucesso!");
                
                closeModal(stockMovementModal);
                stockMovementForm.reset();

            } catch (error) {
                console.error("Erro ao salvar movimentação:", error);
                alert("Ocorreu um erro ao salvar: " + error.message);
            } finally {
                 submitButton.disabled = false;
                 submitButton.textContent = "Salvar Movimentação";
            }
        });
    }
}

// --- Funções do Firebase ---

async function handleAuthentication() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
        } else {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
                userId = auth.currentUser.uid;
            } catch (e) {
                console.error("Erro na autenticação:", e);
                userId = 'fallback-' + crypto.randomUUID();
            }
        }
        
        console.log("Autenticado com UserID:", userId);

        // Define os caminhos das coleções
        const basePath = `artifacts/${appId}/users/${userId}`;
        productsCollectionRef = collection(db, `${basePath}/products`);
        movementsCollectionRef = collection(db, `${basePath}/movements`);
        
        // Inicia os listeners
        setupProductListener();
    });
}

/**
 * Cria um "ouvinte" em tempo real para a coleção de produtos.
 */
function setupProductListener() {
    if (!productsCollectionRef) return;

    onSnapshot(query(productsCollectionRef), (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordena
        products.sort((a, b) => {
             // Tenta usar createdAt, mas usa name como fallback
             if (a.createdAt && b.createdAt) {
                 // Converte para data se for timestamp do Firebase
                 const dateA = a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt;
                 const dateB = b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt;
                return dateB - dateA;
             }
             return a.name.localeCompare(b.name);
        });

        localProducts = products; // Atualiza o cache local
        
        // Atualiza todas as partes da UI que dependem dos produtos
        renderProductTable(products);
        renderStockTable(products);
        populateProductSelect(products);
        updateDashboard(products);

    }, (error) => {
        console.error("Erro ao escutar produtos:", error);
        if (productTableBody) productTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Erro ao carregar produtos.</td></tr>';
        if (stockTableBody) stockTableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">Erro ao carregar estoque.</td></tr>';
    });
}

// --- Funções de Renderização (Helpers) ---

function renderProductTable(products) {
    if (!productTableBody) return;
    productTableBody.innerHTML = '';
    
    if (products.length === 0) {
         productTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>';
         return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4">${product.category}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.object}</td>
            <td class="p-4">
                <button class="text-blue-600 hover:text-blue-800 font-medium mr-3">Editar</button>
                <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${product.id}">Excluir</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

function renderStockTable(products) {
    if (!stockTableBody) return;
    stockTableBody.innerHTML = '';
    
    if (products.length === 0) {
         stockTableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Nenhum produto no estoque.</td></tr>';
         return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        // Adiciona cor se o estoque estiver baixo
        const stockClass = product.quantity <= 10 ? 'text-red-600 font-bold' : '';
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4 ${stockClass}">${product.quantity}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.category}</td>
        `;
        stockTableBody.appendChild(row);
    });
}

function populateProductSelect(products) {
    const select = document.getElementById('movementProductSelect');
    if (!select) return;
    
    // Salva o valor que estava selecionado
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Selecione um produto...</option>'; // Placeholder
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.size}) - [${product.quantity} em estoque]`;
        select.appendChild(option);
    });
    
    // Tenta recolocar o valor que estava selecionado
    select.value = currentValue;
}

function updateDashboard(products) {
    if (!dashboardTotalItems || !dashboardTotalValue) return;

    // 1. Total de Itens
    const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    dashboardTotalItems.textContent = totalItems;

    // 2. Valor Total
    const totalValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.price || 0)), 0);
    // Formata como moeda Brasileira
    dashboardTotalValue.textContent = totalValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // 3. Baixo Estoque (simples)
    // (Ainda estático, mas você pode adicionar a lógica aqui)
}

function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    setTimeout(() => modalElement.classList.add('open'), 10); 
}

function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('open');
    setTimeout(() => modalElement.classList.add('hidden'), 300);
}

function openMovementModal(type) {
    if (!stockMovementModal) return;
    
    const title = stockMovementModal.querySelector('h2');
    const typeInput = document.getElementById('movementTypeInput');
    const submitButton = stockMovementModal.querySelector('button[type="submit"]');
    
    if (type === 'entrada') {
        title.textContent = "Registrar Entrada no Estoque";
        submitButton.className = "bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors";
    } else {
        title.textContent = "Registrar Saída do Estoque";
        submitButton.className = "bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors";
    }
    typeInput.value = type;
    
    // Atualiza a lista de produtos no select toda vez que abre o modal
    populateProductSelect(localProducts);
    
    openModal(stockMovementModal);
}

// --- Funções de Simulação (IA) ---

function setupIASimulations() {
    const generateDescBtn = document.getElementById('generateDescBtn');
    const descLoading = document.getElementById('descLoading');
    const prodDescription = document.getElementById('prodDescription');
    
    if (generateDescBtn) {
        generateDescBtn.addEventListener('click', () => {
            if (descLoading) descLoading.classList.remove('hidden');
            generateDescBtn.disabled = true;
            if (prodDescription) prodDescription.value = "Gerando descrição com IA...";

            setTimeout(() => {
                if (prodDescription) prodDescription.value = "Uma fantástica camisa de algodão premium, perfeita para qualquer ocasião. (Descrição gerada pela IA)";
                if (descLoading) descLoading.classList.add('hidden');
                generateDescBtn.disabled = false;
            }, 1500);
        });
    }

    const analyzeReportBtn = document.getElementById('analyzeReportBtn');
    const reportContainer = document.getElementById('reportAnalysisContainer');
    const reportLoading = document.getElementById('reportAnalysisLoading');
    const reportResult = document.getElementById('reportAnalysisResult');

    if (analyzeReportBtn) {
        analyzeReportBtn.addEventListener('click', () => {
            if (reportContainer) reportContainer.classList.remove('hidden');
            if (reportLoading) reportLoading.classList.remove('hidden');
            if (reportResult) reportResult.innerHTML = "";
            analyzeReportBtn.disabled = true;

            setTimeout(() => {
                if (reportResult) {
                    // Esta parte ainda é simulada.
                    reportResult.innerHTML = `
                        <p><strong>Análise de Tendências (Simulada):</strong></p>
                        <ul>
                            <li>A "Camisa Prada" tem a maior taxa de giro. Considere aumentar o pedido deste item.</li>
                            <li>A "Calça Preta" teve uma boa entrada, mas uma saída mais lenta.</li>
                        </ul>
                        <p class="mt-4"><strong>Recomendação:</strong> Iniciar uma promoção para "Calça Preta".</p>
                    `;
                }
                if (reportLoading) reportLoading.classList.add('hidden');
                analyzeReportBtn.disabled = false;
            }, 2000);
        });
    }
}