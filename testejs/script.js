document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('itemForm');
    const novoGrupoCheckbox = document.getElementById('novoGrupo');
    const grupoExistenteDiv = document.getElementById('grupoExistente');
    const novoGrupoInfoDiv = document.getElementById('novoGrupoInfo');
    const idGrupoInput = document.getElementById('idGrupo');
    const descricaoGrupoInput = document.getElementById('descricaoGrupo');
    const exigeAprovacaoSelect = document.getElementById('exigeAprovacao');

    const novoSubgrupoCheckbox = document.getElementById('novoSubgrupo');
    const subgrupoExistenteDiv = document.getElementById('subgrupoExistente');
    const novoSubgrupoInfoDiv = document.getElementById('novoSubgrupoInfo');
    const idSubgrupoInput = document.getElementById('idSubgrupo');
    const descricaoSubgrupoInput = document.getElementById('descricaoSubgrupo');

    const tipoValidadeSelect = document.getElementById('tipoValidade');
    const validadeContainerDiv = document.getElementById('validadeContainer');
    const validadeInput = document.getElementById('validade');

    const temGarantiaSelect = document.getElementById('temGarantia');
    const garantiaContainerDiv = document.getElementById('garantiaContainer');
    const garantiaInput = document.getElementById('garantia');

    const responseMessageDiv = document.getElementById('response-message');

    // Funções para alternar visibilidade
    const toggleVisibility = (checkbox, existingDiv, newInfoDiv, idInput, descInput, ...additionalElements) => {
        if (checkbox.checked) {
            existingDiv.style.display = 'none';
            idInput.removeAttribute('required');
            newInfoDiv.style.display = 'block';
            descInput.setAttribute('required', 'true');
            additionalElements.forEach(el => el.setAttribute('required', 'true'));
        } else {
            existingDiv.style.display = 'block';
            idInput.setAttribute('required', 'true');
            newInfoDiv.style.display = 'none';
            descInput.removeAttribute('required');
            additionalElements.forEach(el => el.removeAttribute('required'));
        }
    };

    // Event Listeners para Grupo
    novoGrupoCheckbox.addEventListener('change', () => {
        toggleVisibility(novoGrupoCheckbox, grupoExistenteDiv, novoGrupoInfoDiv, idGrupoInput, descricaoGrupoInput, exigeAprovacaoSelect);
    });
    // Dispara a função uma vez ao carregar para definir o estado inicial
    novoGrupoCheckbox.dispatchEvent(new Event('change'));

    // Event Listeners para Subgrupo
    novoSubgrupoCheckbox.addEventListener('change', () => {
        toggleVisibility(novoSubgrupoCheckbox, subgrupoExistenteDiv, novoSubgrupoInfoDiv, idSubgrupoInput, descricaoSubgrupoInput);
    });
    // Dispara a função uma vez ao carregar para definir o estado inicial
    novoSubgrupoCheckbox.dispatchEvent(new Event('change'));

    // Event Listener para Tipo de Validade
    tipoValidadeSelect.addEventListener('change', () => {
        if (tipoValidadeSelect.value !== '0') {
            validadeContainerDiv.style.display = 'block';
            validadeInput.setAttribute('required', 'true');
        } else {
            validadeContainerDiv.style.display = 'none';
            validadeInput.removeAttribute('required');
            validadeInput.value = ''; // Limpa o valor se não tiver validade
        }
    });
    tipoValidadeSelect.dispatchEvent(new Event('change')); // Define o estado inicial

    // Event Listener para Tem Garantia
    temGarantiaSelect.addEventListener('change', () => {
        if (temGarantiaSelect.value !== '0') {
            garantiaContainerDiv.style.display = 'block';
            garantiaInput.setAttribute('required', 'true');
        } else {
            garantiaContainerDiv.style.display = 'none';
            garantiaInput.removeAttribute('required');
            garantiaInput.value = ''; // Limpa o valor se não tiver garantia
        }
    });
    temGarantiaSelect.dispatchEvent(new Event('change')); // Define o estado inicial

    itemForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const sistema = parseInt(document.getElementById('sistema').value);
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const statusItem = parseInt(document.getElementById('status').value);
        const descricaoItem = document.getElementById('descricaoItem').value;

        let grupoPayload;
        if (novoGrupoCheckbox.checked) {
            grupoPayload = false;
        } else {
            grupoPayload = parseInt(idGrupoInput.value);
            if (isNaN(grupoPayload)) {
                showMessage('Por favor, insira um ID de grupo válido.', 'error');
                return;
            }
        }

        let grupoInfoPayload = null;
        if (novoGrupoCheckbox.checked) {
            if (!descricaoGrupoInput.value) {
                showMessage('A descrição do novo grupo é obrigatória.', 'error');
                return;
            }
            grupoInfoPayload = {
                "status": 1,
                "descricao": descricaoGrupoInput.value,
                "exigeaprovacao": parseInt(exigeAprovacaoSelect.value)
            };
        }

        let subgrupoPayload;
        if (novoSubgrupoCheckbox.checked) {
            subgrupoPayload = false;
        } else {
            subgrupoPayload = parseInt(idSubgrupoInput.value);
            if (isNaN(subgrupoPayload)) {
                showMessage('Por favor, insira um ID de subgrupo válido.', 'error');
                return;
            }
        }

        let subgrupoInfoPayload = null;
        if (novoSubgrupoCheckbox.checked) {
            if (!descricaoSubgrupoInput.value) {
                showMessage('A descrição do novo subgrupo é obrigatória.', 'error');
                return;
            }
            subgrupoInfoPayload = {
                "status": 1,
                "descricao": descricaoSubgrupoInput.value
            };
        }

        const tipoValidade = parseInt(tipoValidadeSelect.value);
        let validade = "";
        if (tipoValidade !== 0) {
            validade = validadeInput.value === "" ? "" : parseInt(validadeInput.value);
            if (validade !== "" && isNaN(validade)) {
                showMessage('Por favor, insira um valor de validade válido.', 'error');
                return;
            }
        }

        const temGarantia = parseInt(temGarantiaSelect.value);
        let garantia = "";
        if (temGarantia !== 0) {
            garantia = garantiaInput.value === "" ? "" : parseInt(garantiaInput.value);
            if (garantia !== "" && isNaN(garantia)) {
                showMessage('Por favor, insira um valor de garantia válido.', 'error');
                return;
            }
        }

        const data = {
            "sistema": sistema,
            "usuario": usuario,
            "senha": senha,
            "status": statusItem,
            "descricao": descricaoItem,
            "grupo": grupoPayload,
            "grupoinfo": grupoInfoPayload,
            "subgrupo": subgrupoPayload,
            "subgrupoinfo": subgrupoInfoPayload,
            "tipovalidade": tipoValidade,
            "validade": validade,
            "temgarantia": temGarantia,
            "garantia": garantia
        };

        try {
            const result = await inserirItem(data);
            if (result && result.mensagem && result.mensagem.includes('sucesso')) {
                showMessage(result.mensagem, 'success');
                itemForm.reset(); // Limpa o formulário após sucesso
                // Redefine o estado inicial dos campos dinâmicos
                novoGrupoCheckbox.dispatchEvent(new Event('change'));
                novoSubgrupoCheckbox.dispatchEvent(new Event('change'));
                tipoValidadeSelect.dispatchEvent(new Event('change'));
                temGarantiaSelect.dispatchEvent(new Event('change'));

            } else {
                showMessage(result.mensagem || result.detail || "Erro desconhecido ao inserir item.", 'error');
            }
        } catch (error) {
            showMessage("Erro ao conectar à API: " + error.message, 'error');
        }
    });

    function showMessage(message, type) {
        responseMessageDiv.textContent = message;
        responseMessageDiv.className = ''; // Limpa classes existentes
        responseMessageDiv.classList.add('response-message', type);
        responseMessageDiv.style.display = 'block'; // Mostra a div
    }

    // Função para inserir item (copiada da sua documentação)
    async function inserirItem(data) {
        const url = 'http://kauikserver.ddns.net:19695/inserir/item';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                console.log("Item inserido com sucesso:", result);
            } else {
                console.error("Erro ao inserir item:", result.mensagem || result.detail);
            }
            return result;
        } catch (error) {
            console.error("Erro ao conectar à API:", error);
            throw error;
        }
    }
});