document.addEventListener('DOMContentLoaded', function() {
    // Adiciona um listener para o evento de submit do formulário
    document.getElementById('itemForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o envio padrão do formulário

        // Seleciona os elementos da interface do usuário para manipulação
        const submitButton = document.getElementById('submitButton');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const apiResponseDiv = document.getElementById('apiResponse');
        const responseMessage = document.getElementById('responseMessage');
        const responseId = document.getElementById('responseId');

        // Limpa mensagens anteriores e mostra o indicador de carregamento
        apiResponseDiv.classList.add('hidden'); // Esconde a div de resposta
        responseMessage.textContent = ''; // Limpa a mensagem de resposta
        responseId.textContent = ''; // Limpa o ID da resposta
        submitButton.disabled = true; // Desabilita o botão de envio
        submitButton.classList.add('opacity-50', 'cursor-not-allowed'); // Estiliza o botão desabilitado
        loadingIndicator.classList.remove('hidden'); // Mostra o indicador de carregamento

        // Coleta os dados dos campos do formulário
        const sistema = parseInt(document.getElementById('sistema').value);
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const itemStatus = parseInt(document.getElementById('itemStatus').value);
        const descricaoItem = document.getElementById('descricaoItem').value;

        // Dados do Grupo
        const grupoInfoStatus = parseInt(document.getElementById('grupoInfoStatus').value);
        const grupoInfoDescricao = document.getElementById('grupoInfoDescricao').value;
        const grupoInfoExigeAprovacao = parseInt(document.getElementById('grupoInfoExigeAprovacao').value);

        // Dados do Subgrupo
        const subgrupoInfoStatus = parseInt(document.getElementById('subgrupoInfoStatus').value);
        const subgrupoInfoDescricao = document.getElementById('subgrupoInfoDescricao').value;

        // Dados de Validade e Garantia
        const tipoValidade = parseInt(document.getElementById('tipoValidade').value);
        // A validade pode ser uma string vazia ou um número inteiro
        const validade = document.getElementById('validade').value;
        const temGarantia = parseInt(document.getElementById('temGarantia').value);
        // A garantia pode ser uma string vazia ou um número inteiro
        const garantia = document.getElementById('garantia').value;

        // Constrói o corpo da requisição JSON conforme o exemplo fornecido
        const requestBody = {
            sistema: sistema,
            usuario: usuario,
            senha: senha,
            status: itemStatus,
            descricao: descricaoItem,
            grupo: false, // Conforme instruído, sempre cria um novo grupo
            grupoinfo: {
                status: grupoInfoStatus,
                descricao: grupoInfoDescricao,
                exigeaprovacao: grupoInfoExigeAprovacao
            },
            subgrupo: false, // Conforme instruído, sempre cria um novo subgrupo
            subgrupoinfo: {
                status: subgrupoInfoStatus,
                descricao: subgrupoInfoDescricao
            },
            tipovalidade: tipoValidade,
            // Converte 'validade' para inteiro se não for vazio, caso contrário, mantém como string vazia
            validade: validade === "" ? "" : parseInt(validade),
            temgarantia: temGarantia,
            // Converte 'garantia' para inteiro se não for vazio, caso contrário, mantém como string vazia
            garantia: garantia === "" ? "" : parseInt(garantia)
        };

        const endpoint = 'http://localhost:8000/inserir/item'; // URL da API
        const bearerToken = 'seutoken123'; // Token Bearer para autenticação

        try {
            // Realiza a requisição POST para a API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                    'Authorization': `Bearer ${bearerToken}` // Adiciona o token de autorização
                },
                body: JSON.stringify(requestBody) // Converte o corpo da requisição para JSON
            });

            const result = await response.json(); // Pega a resposta JSON da API

            // Exibe a resposta da API na interface do usuário
            apiResponseDiv.classList.remove('hidden'); // Mostra a div de resposta
            if (result.status === 1) {
                // Se o status for 1 (sucesso), exibe mensagem de sucesso e ID
                apiResponseDiv.classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
                apiResponseDiv.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
                responseMessage.textContent = result.mensagem;
                if (result.id) {
                    responseId.textContent = `ID do Item: ${result.id}`;
                }
            } else {
                // Se o status não for 1 (erro), exibe mensagem de erro
                apiResponseDiv.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
                apiResponseDiv.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                responseMessage.textContent = `Erro: ${result.mensagem || 'Ocorreu um erro desconhecido.'}`;
                responseId.textContent = ''; // Limpa o ID em caso de erro
            }

        } catch (error) {
            // Captura e exibe erros de rede ou outros problemas na requisição
            apiResponseDiv.classList.remove('hidden');
            apiResponseDiv.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
            apiResponseDiv.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
            responseMessage.textContent = `Erro na requisição: ${error.message}`;
            responseId.textContent = 'Verifique a conexão com a API e o console do navegador para mais detalhes.';
            console.error('Erro ao enviar o formulário:', error); // Loga o erro no console para depuração
        } finally {
            // Esconde o indicador de carregamento e reabilita o botão de envio
            loadingIndicator.classList.add('hidden');
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
});
