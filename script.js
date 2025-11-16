// --- Variáveis Globais do App ---
let localProducts = []; // Array local para simular o banco de dados
let localMovements = []; // Array local para simular os relatórios

// --- Seletores do DOM ---
let navLinks, pages;
// Modais
let productModal, stockMovementModal, deleteConfirmModal; // NOVO
// Botões
let openProductModalBtn, cancelProductModalBtn;
let openEntryModalBtn, openExitModalBtn, cancelMovementModalBtn;
let cancelDeleteBtn; // NOVO
// Formulários
let productForm, stockMovementForm, deleteConfirmForm; // NOVO
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
    prodObjectSelect = document.getElementById('prodObject');
    prodSizeSelect = document.getElementById('prodSize');

    // --- Página 3 (Estoque) ---
    stockTableBody = document.getElementById('stockTableBody');
    stockMovementModal = document.getElementById('stockMovementModal');
    openEntryModalBtn = document.getElementById('openEntryModalBtn');
    openExitModalBtn = document.getElementById('openExitModalBtn');
    cancelMovementModalBtn = document.getElementById('cancelMovementModalBtn');
    stockMovementForm = document.getElementById('stockMovementForm');

    // --- Página 5 (Conta) ---
    // Adiciona listeners para os botões da conta
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if(changePasswordBtn) changePasswordBtn.addEventListener('click', () => showToast('Função "Trocar Senha" ainda não implementada.', 'error'));
    if(logoutBtn) logoutBtn.addEventListener('click', () => showToast('Função "Trocar Usuário" ainda não implementada.', 'error'));


    // --- NOVO: Modal de Exclusão ---
    deleteConfirmModal = document.getElementById('deleteConfirmModal');
    deleteConfirmForm = document.getElementById('deleteConfirmForm');
    cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

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
    // ... (código sem alterações) ...
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
        resetDynamicForm(); 
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

    // NOVO: Modal de Confirmação de Exclusão
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
        closeModal(deleteConfirmModal);
        deleteConfirmForm.reset();
    });
    if (deleteConfirmModal) deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) {
            closeModal(deleteConfirmModal);
            deleteConfirmForm.reset();
        }
    });
}

/**
 * Lógica da Página 2 (Produtos)
 */
function setupProductLogic() {
    // Salvar novo produto
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newProduct = {
                id: crypto.randomUUID(), 
                name: document.getElementById('prodName').value,
                sexo: document.getElementById('prodSexo').value, 
                object: document.getElementById('prodObject').value, 
                size: document.getElementById('prodSize').value, 
                price: parseFloat(document.getElementById('prodPrice').value) || 0,
                quantity: parseInt(document.getElementById('prodQuantity').value) || 0,
                createdAt: new Date()
            };

            localProducts.push(newProduct);
            
            renderProductTable(localProducts);
            renderStockTable(localProducts);
            updateDashboard(localProducts);

            closeModal(productModal);
            productForm.reset();
            resetDynamicForm();
            
            showToast('Produto adicionado com sucesso!', 'success'); // NOVO: Toast
        });
    }

    // Busca de produto
    if (productSearchInput) {
        // ... (código sem alterações) ...
        productSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = localProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.sexo.toLowerCase().includes(searchTerm) || 
                product.object.toLowerCase().includes(searchTerm) 
            );
            renderProductTable(filteredProducts);
        });
    }

    // Excluir produto (Agora abre o modal de senha)
    if (productTableBody) {
        productTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.getAttribute('data-id');
                
                // NOVO: Abre o modal de confirmação em vez do confirm()
                const product = localProducts.find(p => p.id === id);
                if (product) {
                    // Preenche o modal com a informação
                    document.getElementById('deleteProductId').value = id;
                    // Limpa o campo de senha
                    document.getElementById('deletePasswordInput').value = '';
                    openModal(deleteConfirmModal);
                }
            }
        });
    }

    // NOVO: Handle do formulário de exclusão
    if (deleteConfirmForm) {
        deleteConfirmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('deleteProductId').value;
            const password = document.getElementById('deletePasswordInput').value;

            // --- PONTO DE SEGURANÇA ---
            // A senha está "chumbada" (hardcoded) como '123'
            // Quando você tiver um banco de dados de usuários, verifique a senha real aqui.
            if (password === '123') {
                // Senha correta, exclui o produto
                localProducts = localProducts.filter(p => p.id !== id);

                // Re-renderiza tudo
                renderProductTable(localProducts);
                renderStockTable(localProducts);
                updateDashboard(localProducts);

                closeModal(deleteConfirmModal);
                deleteConfirmForm.reset();
                
                showToast('Produto excluído com sucesso!', 'success');
            } else {
                // Senha incorreta
                showToast('Senha incorreta!', 'error');
            }
        });
    }
}

/**
 * Lógica da Página 3 (Estoque)
 */
function setupStockLogic() {
    // Salvar movimentação de estoque
    if (stockMovementForm) {
        stockMovementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productId = document.getElementById('movementProductSelect').value;
            const quantity = parseInt(document.getElementById('movementQuantityInput').value);
            const type = document.getElementById('movementTypeInput').value;
            const submitButton = stockMovementForm.querySelector('button[type="submit"]');

            if (!productId || !quantity || quantity <= 0) {
                // NOVO: Substitui alert() por showToast()
                showToast('Selecione um produto e uma quantidade válida.', 'error');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";
            
            const product = localProducts.find(p => p.id === productId);
            if (!product) {
                 // NOVO: Substitui alert() por showToast()
                 showToast('Erro: Produto não encontrado.', 'error');
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
                    // NOVO: Substitui alert() por showToast()
                    showToast('Operação cancelada. O estoque não pode ficar negativo.', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = "Salvar Movimentação";
                    return;
                }
            }

            // Atualiza o produto
            product.quantity = newQuantity;

            // Adiciona ao relatório
            const newMovement = {
                productName: product.name,
                quantityChanged: quantity,
                newQuantity: newQuantity,
                type: type,
                date: new Date()
            };
            localMovements.push(newMovement);
            console.log("Novo movimento:", newMovement);


            // Re-renderiza
            renderStockTable(localProducts);
            updateDashboard(localProducts);

            setTimeout(() => { // Simula o tempo de salvar
                closeModal(stockMovementModal);
                stockMovementForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = "Salvar Movimentação";
                
                // NOVO: Toast
                showToast('Movimentação registrada com sucesso!', 'success');
            }, 500);
        });
    }
}

/**
 * LÓGICA NOVA: Controla o formulário dinâmico de Objeto/Tamanho
 */
function setupDynamicFormLogic() {
    // ... (código sem alterações) ...
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
    // ... (código sem alterações) ...
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
    // ... (código sem alterações) ...
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
    // ... (código sem alterações) ...
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
    // ... (código sem alterações) ...
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
    // ... (código sem alterações) ...
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    setTimeout(() => modalElement.classList.add('open'), 10); 
}

function closeModal(modalElement) {
    // ... (código sem alterações) ...
    if (!modalElement) return;
    modalElement.classList.remove('open');
    setTimeout(() => modalElement.classList.add('hidden'), 300);
}

function openMovementModal(type) {
    // ... (código sem alterações) ...
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

function resetDynamicForm() {
    // ... (código sem alterações) ...
    if (prodSizeSelect) {
        prodSizeSelect.innerHTML = '<option value="">Selecione um objeto primeiro</option>';
        prodSizeSelect.disabled = true;
    }
    if (prodObjectSelect) {
        prodObjectSelect.value = ""; // Reseta o select de objeto
    }
}

// --- Funções de Simulação (IA) ---
function setupIASimulations() {
    // ... (código sem alterações) ...
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


// ==================================
// NOVA FUNÇÃO: Mostrar Notificação (Toast)
// ==================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Remove o toast após 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
