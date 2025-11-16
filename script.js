// --- Variáveis Globais do App ---
let localProducts = []; // Array local para simular o banco de dados
let localMovements = []; // Array local para simular os relatórios

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
// Seletores dinâmicos do formulário de produto
let prodObjectSelect, prodSizeSelect;

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
    prodObjectSelect = document.getElementById('prodObject'); // Para formulário dinâmico
    prodSizeSelect = document.getElementById('prodSize'); // Para formulário dinâmico

    // --- Página 3 (Estoque) ---
    stockTableBody = document.getElementById('stockTableBody');
    stockMovementModal = document.getElementById('stockMovementModal');
    openEntryModalBtn = document.getElementById('openEntryModalBtn');
    openExitModalBtn = document.getElementById('openExitModalBtn');
    cancelMovementModalBtn = document.getElementById('cancelMovementModalBtn');
    stockMovementForm = document.getElementById('stockMovementForm');

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

    // --- LÓGICA DO FORMULÁRIO DINÂMICO ---
    setupDynamicFormLogic();

    // --- INICIALIZA AS TABELAS (VAZIAS) ---
    renderProductTable(localProducts);
    renderStockTable(localProducts);
    updateDashboard(localProducts);
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
        productForm.reset(); 
        resetDynamicForm(); // Reseta o formulário dinâmico
    });
    if (productModal) productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal(productModal);
            productForm.reset();
            resetDynamicForm();
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

/**
 * Lógica da Página 2 (Produtos)
 */
function setupProductLogic() {
    // Salvar novo produto (simulado com array local)
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Pega os valores do formulário
            const newProduct = {
                id: crypto.randomUUID(), // Gera um ID único
                name: document.getElementById('prodName').value,
                sexo: document.getElementById('prodSexo').value, // Alterado
                object: document.getElementById('prodObject').value, // Alterado
                size: document.getElementById('prodSize').value, // Alterado
                price: parseFloat(document.getElementById('prodPrice').value) || 0,
                quantity: parseInt(document.getElementById('prodQuantity').value) || 0,
                createdAt: new Date()
            };

            console.log("Novo produto salvo (simulado):", newProduct);
            
            // Adiciona ao array local
            localProducts.push(newProduct);
            
            // Re-renderiza tudo
            renderProductTable(localProducts);
            renderStockTable(localProducts);
            updateDashboard(localProducts);

            closeModal(productModal);
            productForm.reset();
            resetDynamicForm();
        });
    }

    // Busca de produto (funciona no array local)
    if (productSearchInput) {
        productSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = localProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.sexo.toLowerCase().includes(searchTerm) || // Alterado
                product.object.toLowerCase().includes(searchTerm) // Alterado
            );
            renderProductTable(filteredProducts);
        });
    }

    // Excluir produto (do array local)
    if (productTableBody) {
        productTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    
                    console.log("Excluir produto (simulado):", id);
                    
                    // Remove do array local
                    localProducts = localProducts.filter(p => p.id !== id);

                    // Re-renderiza tudo
                    renderProductTable(localProducts);
                    renderStockTable(localProducts);
                    updateDashboard(localProducts);
                }
            }
        });
    }
}

/**
 * Lógica da Página 3 (Estoque)
 */
function setupStockLogic() {
    // Salvar movimentação de estoque (simulado com array local)
    if (stockMovementForm) {
        stockMovementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productId = document.getElementById('movementProductSelect').value;
            const quantity = parseInt(document.getElementById('movementQuantityInput').value);
            const type = document.getElementById('movementTypeInput').value;
            const submitButton = stockMovementForm.querySelector('button[type="submit"]');

            if (!productId || !quantity || quantity <= 0) {
                alert("Por favor, selecione um produto e insira uma quantidade válida.");
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";
            
            // Encontra o produto no array local
            const product = localProducts.find(p => p.id === productId);
            if (!product) {
                 alert("Erro: Produto não encontrado.");
                 submitButton.disabled = false;
                 submitButton.textContent = "Salvar Movimentação";
                 return;
            }

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

            // Atualiza o produto no array local
            product.quantity = newQuantity;

            console.log("Movimentação salva (simulado):", {productId, type, quantity, newQuantity});
            
            // Simula o registro de movimento (para o futuro relatório)
            const newMovement = {
                productName: product.name,
                quantityChanged: quantity,
                newQuantity: newQuantity,
                type: type,
                date: new Date()
            };
            localMovements.push(newMovement);
            console.log("Novo movimento:", newMovement);


            // Re-renderiza as tabelas
            renderStockTable(localProducts);
            updateDashboard(localProducts);
            // renderReportTable(localMovements); // Podemos ativar isso no futuro

            setTimeout(() => { // Simula o tempo de salvar
                closeModal(stockMovementModal);
                stockMovementForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = "Salvar Movimentação";
            }, 500);
        });
    }
}

/**
 * LÓGICA NOVA: Controla o formulário dinâmico de Objeto/Tamanho
 */
function setupDynamicFormLogic() {
    if (prodObjectSelect) {
        prodObjectSelect.addEventListener('change', () => {
            const selection = prodObjectSelect.value;
            prodSizeSelect.innerHTML = ''; // Limpa as opções
            prodSizeSelect.disabled = true;

            let options = [];

            if (selection === 'Calça' || selection === 'Bermuda') {
                options = ['38', '40', '42'];
                prodSizeSelect.disabled = false;
            } else if (selection === 'Camisa') {
                options = ['P', 'M', 'G'];
                prodSizeSelect.disabled = false;
            } else {
                // Se for "Selecione um tipo"
                options = ['Selecione um objeto primeiro'];
            }

            // Adiciona as novas opções
            options.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                prodSizeSelect.appendChild(option);
            });
        });
    }
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
            <td class="p-4">${product.sexo}</td> <!-- Alterado -->
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.object}</td>
            <td class="p-4">
                <button class="edit-btn text-blue-600 hover:text-blue-800 font-medium mr-3" data-id="${product.id}">Editar</button>
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
        const stockClass = product.quantity <= 10 ? 'text-red-600 font-bold' : '';
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="p-4">${product.name}</td>
            <td class="p-4 ${stockClass}">${product.quantity}</td>
            <td class="p-4">${product.size}</td>
            <td class="p-4">${product.sexo}</td> <!-- Alterado -->
        `;
        stockTableBody.appendChild(row);
    });
}

function populateProductSelect(products) {
    const select = document.getElementById('movementProductSelect');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Selecione um produto...</option>'; 
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.size}) - [${product.quantity} em estoque]`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updateDashboard(products) {
    if (!dashboardTotalItems || !dashboardTotalValue) return;

    const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    dashboardTotalItems.textContent = totalItems;

    const totalValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.price || 0)), 0);
    dashboardTotalValue.textContent = totalValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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

/**
 * Reseta o formulário dinâmico para o estado inicial
 */
function resetDynamicForm() {
    if (prodSizeSelect) {
        prodSizeSelect.innerHTML = '<option value="">Selecione um objeto primeiro</option>';
        prodSizeSelect.disabled = true;
    }
    if (prodObjectSelect) {
        prodObjectSelect.value = ""; // Reseta o select de objeto
    }
}

// --- Funções de Simulação (IA) ---
// (Estas funções não precisam de banco de dados e permanecem iguais)

function setupIASimulations() {
    // Lógica do botão "Gerar com IA" foi REMOVIDA
    
    // Botão "Analisar Relatório com IA"
    const analyzeReportBtn = document.getElementById('analyzeReportBtn');
    const reportContainer = document.getElementById('reportAnalysisContainer');
    const reportLoading = document.getElementById('reportAnalysisLoading');
    const reportResult = document.getElementById('reportAnalysisResult');

    if (analyzeReportBtn) {
        analyzeReportBtn.addEventListener('click', () => {
            if (reportContainer) reportContainer.classList.remove('hidden'); // Corrigido 'remover' para 'remove'
            if (reportLoading) reportLoading.classList.remove('hidden'); // Corrigido 'remover' para 'remove'
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
