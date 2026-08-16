# Arquitetura — System Context (C4, nível 1)

O site é uma aplicação única: não há banco de dados, fila, worker ou serviço adicional
próprio. A única dependência externa é a API REST pública do GitHub, de onde o site lê
os dados de perfil de projetos e o conteúdo dos repositórios em tempo de build/revalidação
(SSG/ISR) — nunca a partir do navegador do visitante.

Por isso este diagrama para no nível 1 (Context). Um nível 2 (Container) não agregaria
informação nova: o "container" aqui seria só "a aplicação Next.js", idêntico à caixa
central deste diagrama.

```mermaid
graph LR
    visitante["Visitante<br/><i>pessoa</i><br/>recrutador / avaliador técnico"]
    site["Site de Portfólio<br/><i>software system</i><br/>Next.js, SSG/ISR"]
    github["API do GitHub<br/><i>software system externo</i><br/>REST — repos, árvore de arquivos, conteúdo bruto"]

    visitante -->|"navega via HTTPS<br/>lê perfil e projetos em destaque"| site
    site -->|"busca repos por topic, árvore de arquivos<br/>e conteúdo bruto — REST, em build/revalidação"| github

    classDef person fill:#1f6feb,color:#fff,stroke:#1f6feb
    classDef system fill:#0d9488,color:#fff,stroke:#0d9488
    classDef external fill:#6b7280,color:#fff,stroke:#6b7280
    class visitante person
    class site system
    class github external
```

## Legenda

| Elemento | Significado |
| --- | --- |
| 🔵 Pessoa | Quem usa o sistema — o visitante do site (recrutador, avaliador técnico). |
| 🟢 Software System (interno) | O sistema documentado aqui — o site de portfólio. |
| ⚪ Software System (externo) | Sistema de terceiros com o qual o site conversa, mas que não é operado por este projeto. |
| Rótulos nas setas | Descrevem o protocolo e a intenção da comunicação, não só a direção. |

## Notas

- A comunicação `Site → GitHub API` acontece **no servidor**, durante o build ou uma
  revalidação de ISR (`revalidate: 3600`) — não a cada requisição de um visitante. Isso
  mantém o número de chamadas à API do GitHub baixo mesmo com muitos visitantes
  simultâneos (ver [ADR 001](../decisions/001-fonte-e-atualizacao-de-dados-dos-projetos.md)).
- Não existe autenticação de usuário nem escrita de dados em nenhuma direção — todo o
  fluxo é leitura.
