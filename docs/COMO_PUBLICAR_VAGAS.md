# Publicar vagas no site Nova Frota

Este site é estático. A listagem de vagas é carregada do arquivo \`assets/data/vagas.json\`. Nenhuma vaga é publicada automaticamente.

## Como incluir uma vaga

1. Abra o GitHub, repositório \`Netosmith/novafrota-logistica\`.
2. Edite o arquivo \`assets/data/vagas.json\` na branch \`main\`.
3. No campo \`vagas\`, adicione um objeto para cada vaga confirmada, seguindo o exemplo abaixo.
4. Confirme os dados, salve o commit. O site refletirá o novo conteúdo após a publicação.

Exemplo **fictício**, somente para copiar a estrutura (não é vaga anunciada):

\`\`\`json
{
  "vagas": [
    {
      "id": "exemplo-analista-logistico",
      "titulo": "Analista de Logística",
      "cidade": "Rio Verde",
      "uf": "GO",
      "modalidade": "Presencial",
      "resumo": "Atuação em atividades operacionais de logística.",
      "requisitos": ["Experiência com operações de transporte", "Conhecimento de planilhas"],
      "ativo": true,
      "data_limite": "2027-03-31",
      "contato": { "tipo": "whatsapp", "valor": "5564992215878" }
    }
  ]
}
\`\`\`

**ATENÇÃO:** o número de exemplo acima é o WhatsApp regional de Goiás que já está no site, não um canal de RH confirmado. Substitua pelo contato de recrutamento autorizado para cada vaga antes de publicá-la.

### Campos

- \`titulo\`, \`ativo\`: obrigatórios. Uma vaga aparece somente com \`ativo: true\`.
- \`cidade\`, \`uf\`, \`modalidade\`, \`resumo\`, \`requisitos\`: opcionais.
- \`data_limite\`: opcional no formato AAAA-MM-DD. Após a data, a vaga deixa de aparecer.
- \`contato.tipo\`: \`whatsapp\`, \`email\` ou \`link\` (HTTPS).
- \`contato.valor\`: número com DDI, endereço de e-mail ou URL HTTPS. Sem contato válido, o candidato é direcionado à página Trabalhe Conosco.
- Para encerrar uma vaga, defina \`ativo: false\`, ou remova o objeto do arquivo.

## Como são recebidos os currículos hoje?

Não existe backend, formulário RH ou e-mail de recrutamento validado no repositório. O site **não recebe nem armazena currículos automaticamente**. O formulário da página \`trabalhe-conosco.html\` prepara uma mensagem no WhatsApp regional de Goiás já divulgado no site; o candidato pode solicitar o canal correto de RH e anexar manualmente o currículo durante o atendimento.

Para recebimento online e armazenamento automatizado de PDF/DOCX no futuro, será necessário configurar canal oficial e serviço seguro de envio/armazenamento com aviso de privacidade e controles de acesso. Não inclua tokens ou senhas dentro do HTML ou JavaScript público.
