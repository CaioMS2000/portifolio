# Como escolher as topics `stack-*` dos repositórios

Critério pra decidir que tecnologia marcar como topic `stack-<nome>` num repo (ex.
`stack-postgresql`), que vira tag automática nos cards do portfólio e na linha de
stack do CV.

## Por que a topic existe

`getPortfolioProjects` já detecta linguagem sozinho via `/languages` do GitHub (bytes
de código). A topic `stack-*` existe só pra preencher o que esse endpoint não vê —
infra e ferramentas (banco, broker, deploy). Não é um mecanismo genérico de "toda
tecnologia usada no projeto".

## Critério

1. **Não repita o que `/languages` já detecta.** Linguagem (TypeScript, Python, Go)
   não precisa de topic — isso já vem de graça.
2. **Só decisão estrutural, não dependência qualquer do `package.json`.** Pergunta:
   "isso mudaria a arquitetura se eu trocasse?" Banco, cache, message broker,
   plataforma de deploy, framework backend não capturado como linguagem — sim. Lib de
   ícone, utilitário de formatação — não.
3. **Pensa no leitor: recrutador ou ATS reconheceria o nome e ganharia sinal com
   ele?** PostgreSQL, Redis, Docker, Kafka, AWS — sim. Pacote interno ou lib pouco
   conhecida — não, mesmo sendo tecnicamente relevante.
4. **Poucas tags que pesam, não uma parede.** 3-4 tags fortes comunicam mais que 12
   onde metade é ruído.

Teste rápido: "se eu tivesse que justificar essa peça da stack numa entrevista
técnica, ela renderia conversa?" Se sim, vira topic. Se é só implementação, fica de
fora.
