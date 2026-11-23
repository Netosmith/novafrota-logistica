# Nova Frota: Fretes disponíveis e Postos Credenciados

Este repositório é o site institucional público. As duas novas páginas são:

- \`fretes-disponiveis.html\`
- \`postos-credenciados.html\`

## 1. Como os fretes aparecem no site

A página consulta **somente** \`GET https://api.portalfrete.net.br/v1/driver-freights\`, API pública do Portal Frete usada para ofertas divulgadas a motoristas.

O público vê exclusivamente: origem, destino, local de coleta, local de descarga, produto, volume, valor do motorista (quando publicado), configurações de eixos, horário de publicação e WhatsApp do embarcador autorizado.

**Não são exibidos**: clientes internos, dados financeiros de empresa, notas, observações, cadastros privados e fretes não publicados.

Para divulgar uma oportunidade:

1. No Portal Frete, acesse a tabela operacional da Nova Frota (Fretes / Fretes2) com usuário autorizado.
2. O frete precisa estar com status **LIBERADO** e possuir os campos públicos exigidos.
3. Na linha do frete, use o botão **📱 Publicar** (o mesmo utilizado para divulgar no aplicativo de motoristas).
4. Confira os dados e o WhatsApp que serão divulgados publicamente e confirme.
5. O frete ficará disponível no site institucional e no aplicativo por **até 72 horas** ou até ser retirado. A página do site consulta as ofertas automaticamente e pode ser atualizada manualmente.

**Importante:** por ser divulgação pública, confirme que o WhatsApp e os dados da carga podem ser disponibilizados publicamente antes de publicar.

### Conexão entre domínios

O site institucional é servido em \`https://netosmith.github.io/novafrota-logistica/\`. A API pública está em \`https://api.portalfrete.net.br\`. O navegador precisa de uma permissão CORS de leitura específica, implementada na configuração do Worker do projeto \`Netosmith/calculo-piso\` (somente \`GET /v1/driver-freights\`).

A mudança no código do Worker só passa a valer depois que a versão correspondente estiver **implantada no Cloudflare**. Não publique nem copie credenciais, cookies, tokens ou bases operacionais para o HTML/JavaScript.

A interface mostra um erro de conexão caso a consulta à API não esteja disponível. **Ela nunca exibe fretes fictícios**.

## 2. Como cadastrar um posto credenciado

Edite o arquivo \`assets/data/postos-credenciados.json\`. Estrutura atual:

\`\`\`json
{
  "postos": []
}
\`\`\`

Exemplo **apenas ilustrativo, desativado** (não representa um posto real):

\`\`\`json
{
  "postos": [
    {
      "id": "exemplo-nao-publicar",
      "nome": "PREENCHER NOME DO POSTO",
      "cidade": "PREENCHER CIDADE",
      "uf": "GO",
      "rodovia": "PREENCHER RODOVIA",
      "km": "PREENCHER KM",
      "endereco": "PREENCHER ENDEREÇO",
      "horario": "PREENCHER HORÁRIO",
      "servicos": ["Abastecimento", "Restaurante", "Estacionamento"],
      "whatsapp": "",
      "mapa": "",
      "ativo": false
    }
  ]
}
\`\`\`

Somente os registros com \`ativo: true\`, nome e UF válida (duas letras) aparecem no site. Valide previamente os dados e a autorização do estabelecimento. \`whatsapp\` precisa conter DDI +55, DDD e número; \`mapa\` aceita apenas URLs HTTPS de Google Maps ou Waze.

Para desativar um posto, mude \`ativo\` para \`false\` ou remova seu registro. Para alterações, atualize o arquivo pelo GitHub; a atualização aparece após a publicação da revisão.

**Não inclua**: senhas, PINs de abastecimento, limites de crédito, valores privados de contrato, dados pessoais de motoristas, números de cartão ou regras comerciais confidenciais.

Os números da página resumem somente os postos cadastrados e ativos. Quando o cadastro está vazio, a página mostra uma mensagem verdadeira e não inventa estabelecimentos.

## Próximos incrementos possíveis

- Cadastro administrativo por transportadora, com aprovação antes da publicação
- Importar postos credenciados de uma planilha Google Sheets autorizada
- Exibir mapa e rotas dos postos cadastrados com coordenadas confirmadas
- Histórico de alterações e validade de credenciamento
