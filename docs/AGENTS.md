# Diretrizes Gerais de Engenharia de Software

Estas regras orientam o trabalho em qualquer projeto de software. Devem ser aplicadas de acordo com o objetivo da tarefa, a tecnologia utilizada, o estado real da codebase e as restrições explícitas do usuário.

A prioridade é entregar mudanças corretas, compreensíveis, verificáveis e proporcionais ao problema. Não imponha uma arquitetura ou um processo por preferência pessoal.

---

## 1. Entenda o projeto antes de alterar

Antes de fazer mudanças relevantes:

1. Leia as instruções existentes do repositório e os arquivos relacionados à tarefa.
2. Identifique a stack, os comandos disponíveis, a estrutura, os padrões de código e as dependências existentes.
3. Localize o fluxo atual da funcionalidade e seus pontos de entrada, saída e integração.
4. Verifique testes, documentação e convenções que possam definir o comportamento esperado.
5. Separe fatos observados de hipóteses. Não trate uma hipótese como comportamento confirmado.

Não explore arquivos sem relação com a tarefa sem uma razão concreta. Não comece uma reestruturação ampla antes de entender o que ela precisa resolver.

## 2. Respeite o objetivo e o escopo solicitado

Determine se a tarefa é, por exemplo, uma nova funcionalidade, refatoração, correção de bug, investigação, atualização de dependência, documentação ou mudança visual. Aplique as precauções adequadas ao tipo de trabalho.

- Não reescreva componentes ou sistemas inteiros quando uma mudança localizada for suficiente.
- Não faça alterações adicionais apenas porque encontrou algo que poderia ser melhorado.
- Não substitua tecnologias, bibliotecas ou padrões existentes sem benefício concreto.
- Se uma descoberta fora do escopo afetar a segurança, a integridade dos dados ou a conclusão da tarefa, informe-a claramente.
- Se uma decisão importante depender de informação ausente, faça uma pergunta objetiva ou apresente a suposição antes de prosseguir.

## 3. Preserve contratos e comportamento quando aplicável

Em refatorações e mudanças que não pretendem alterar o comportamento, preserve os resultados observáveis para as mesmas entradas e condições.

Considere como possíveis contratos:

- regras de negócio e cálculos;
- validações, permissões e fluxos;
- interface e comportamento percebido pelo usuário;
- APIs, eventos, formatos de dados e integrações;
- esquemas, dados persistidos e compatibilidade;
- importação, exportação e formatos de arquivos;
- configuração, inicialização e comportamento de implantação.

Não presuma que um comportamento está errado apenas por parecer incomum ou diferente de uma convenção genérica. Confirme sua finalidade antes de modificá-lo.

Quando o objetivo solicitado for justamente mudar um desses contratos, implemente a mudança de forma deliberada e identifique seus impactos. Não confunda refatoração com correção de bug ou alteração funcional.

## 4. Corrija bugs com critério

Ao encontrar um possível bug:

1. Confirme o comportamento observado e as condições em que ocorre.
2. Procure evidências no código, nos testes, na documentação e nos relatos disponíveis.
3. Avalie o impacto e a causa provável antes de escolher uma correção.
4. Faça uma correção proporcional e teste o cenário afetado, incluindo regressões relevantes.

Se o bug estiver fora do escopo, registre ou comunique a descoberta conforme as convenções do projeto, sem alterar silenciosamente o comportamento. Se a correção exigir uma decisão de produto ou de negócio não documentada, peça autorização ou apresente as alternativas.

Não declare um problema resolvido apenas porque o código foi alterado.

## 5. Prefira simplicidade útil

O código deve ser fácil de compreender e manter por alguém familiarizado com a stack do projeto.

- Prefira soluções diretas quando o problema for simples.
- Divida responsabilidades quando isso melhorar de fato a compreensão, os testes ou a manutenção.
- Evite camadas, interfaces, factories, sistemas de eventos, abstrações genéricas ou padrões arquiteturais sem necessidade demonstrável.
- Não divida funções apenas para atingir um limite arbitrário de linhas.
- Não elimine duplicação a qualquer custo: uma abstração confusa pode ser pior do que uma repetição pequena e explícita.
- Não introduza complexidade para acomodar cenários hipotéticos sem evidência de que serão necessários.

A arquitetura deve acompanhar a complexidade real do projeto e evoluir quando houver motivos concretos.

## 6. Respeite as convenções existentes

Observe e preserve padrões consistentes e razoáveis de:

- nomenclatura e organização de arquivos;
- formatação, imports e exports;
- tipos, interfaces e tratamento de erros;
- componentes, funções, módulos e dependências;
- testes, comentários, logs e documentação;
- organização de pastas e separação de responsabilidades.

Melhore inconsistências quando isso fizer parte da tarefa ou trouxer benefício claro. Evite misturar uma mudança funcional com uma reformatação extensa ou uma migração de estilo sem necessidade.

Não introduza uma convenção nova sem verificar se já existe uma equivalente no projeto.

## 7. Organize módulos e responsabilidades por necessidade

Mantenha cada parte do sistema com responsabilidades compreensíveis e dependências explícitas.

Quando fizer sentido, separe apresentação, lógica de aplicação, regras de domínio, acesso a dados e integrações externas. Isso é uma possibilidade, não uma estrutura obrigatória.

- Evite dependências circulares e acoplamento desnecessário.
- Mantenha código compartilhado realmente genérico em locais compartilhados.
- Não crie módulos ou pastas vazias apenas para seguir um modelo.
- Não mova arquivos em massa se isso não facilitar a manutenção.
- Evite duplicar a mesma fonte de verdade em vários lugares.

Escolha a organização mais simples que atenda às necessidades atuais sem bloquear extensões razoavelmente previsíveis.

## 8. Dados, persistência e migrações

Trate dados existentes como potencialmente valiosos e contratos de persistência como parte do sistema.

Antes de alterar banco de dados, arquivos persistidos, cache, formatos ou processos de migração:

- identifique compatibilidade com dados e versões existentes;
- verifique o impacto em leitura, escrita, recuperação e implantação;
- planeje migração e rollback quando houver risco de perda ou incompatibilidade;
- não apague, sobrescreva ou transforme dados reais como efeito colateral de uma tarefa sem autorização explícita;
- não altere o esquema apenas por preferência estética.

Quando aplicável, considere transações, validação de entradas, consistência, backups, restauração e falhas parciais. Ajuste a avaliação de risco ao uso real do sistema, sem ignorar riscos relevantes nem priorizar cenários improváveis sem justificativa.

## 9. Segurança e privacidade

Considere a segurança desde a implementação, especialmente em entradas externas, autenticação, autorização, armazenamento de segredos, arquivos e comunicação de rede.

- Não exponha credenciais, tokens, dados pessoais ou segredos em código, logs, exemplos ou documentação.
- Valide dados em limites de confiança e use mecanismos seguros oferecidos pela stack.
- Não enfraqueça permissões ou controles de segurança para contornar um erro.
- Não execute comandos destrutivos, publique artefatos, envie dados externos ou altere ambientes compartilhados sem necessidade e autorização apropriada.
- Ao lidar com dependências, avalie origem, compatibilidade e impacto da mudança.

Aplique medidas proporcionais à superfície de risco e às exigências do projeto.

## 10. Qualidade, tipagem e tratamento de erros

Use os recursos da linguagem para tornar o código mais seguro e legível.

- Evite tipos imprecisos, coerções frágeis e supressões de erro quando houver alternativas claras.
- Não crie tipos ou camadas apenas para satisfazer uma métrica sem ganho prático.
- Trate erros no nível em que seja possível tomar uma decisão útil.
- Não esconda falhas silenciosamente nem substitua erros relevantes por sucesso aparente.
- Evite `try/catch`, validações e verificações redundantes sem finalidade clara.
- Preserve mensagens, códigos e contratos de erro quando consumidores dependerem deles.

Logs devem ajudar a diagnosticar problemas sem revelar informações sensíveis.

## 11. Performance baseada em evidências

Otimize gargalos plausíveis ou medidos, não diferenças teóricas irrelevantes.

Considere consultas repetidas, processamento redundante, carregamento excessivo, renderizações evitáveis, chamadas de rede, uso de memória e operações custosas quando forem pertinentes à stack.

- Priorize a correção e a clareza antes de micro-otimizações.
- Evite comprometer a manutenção por ganhos insignificantes.
- Não adicione cache, concorrência ou complexidade de execução sem entender invalidação, consistência e falhas.
- Quando possível, compare métricas ou comportamento antes e depois.

## 12. Dependências e mudanças tecnológicas

Antes de adicionar, remover ou atualizar uma dependência:

1. Verifique se a stack ou o projeto já oferece a capacidade necessária.
2. Avalie compatibilidade, manutenção, tamanho, licença e impacto operacional quando relevante.
3. Confira os requisitos de versão e os efeitos em outros componentes.
4. Prefira a menor mudança capaz de resolver o problema.

Não adicione uma biblioteca apenas para substituir poucas linhas de código simples. Não atualize várias dependências sem relação com a tarefa como efeito colateral.

## 13. Testes e verificação

Use os mecanismos de verificação existentes no projeto. Após cada grupo significativo de mudanças, execute os testes e verificações relevantes que estejam disponíveis, por exemplo:

- testes automatizados da área alterada;
- lint e formatação, quando configurados;
- verificação de tipos e compilação;
- build e inicialização;
- testes de integração ou verificações manuais adequadas ao risco.

Escolha verificações proporcionais à mudança. Não alegue que um comando passou se ele não foi executado. Se não for possível executar uma verificação, informe qual ficou pendente e por quê.

Ao corrigir bugs, teste o caso que falhava e os caminhos próximos. Ao refatorar, verifique que o comportamento contratado foi preservado. Ao adicionar funcionalidade, valide os critérios de aceitação solicitados.

## 14. Mudanças incrementais e reversíveis

Prefira alterações pequenas e coerentes, que possam ser entendidas e verificadas isoladamente.

Para mudanças estruturais ou de risco relevante, explique antes de executar, quando o fluxo de trabalho permitir:

- problema identificado;
- abordagem escolhida e justificativa;
- áreas ou arquivos afetados;
- riscos e compatibilidade;
- forma de verificação e rollback.

Evite misturar refatorações, correções, mudanças visuais e atualizações de dependências em uma única alteração sem relação clara. Preserve alterações preexistentes do usuário e não sobrescreva trabalho alheio à tarefa.

## 15. Documentação e comentários

Atualize a documentação quando a mudança afetar uso, configuração, instalação, contratos, arquitetura relevante ou manutenção.

Comentários devem explicar intenção, restrições ou decisões que não sejam óbvias pelo código. Evite comentários que apenas traduzam a instrução da linha seguinte.

Não crie documentação extensa por obrigação. Prefira conteúdo conciso, correto e útil para quem precisa operar ou modificar o projeto.

## 16. Registros de trabalho e bugs

Siga os mecanismos de histórico e rastreamento que o repositório já utiliza, como issues, changelog, commits, diário de alterações ou pastas específicas.

Não crie um sistema paralelo de registros por padrão. Se o projeto exigir arquivos de auditoria, rollback manual ou registros locais, cumpra o formato definido pelo próprio projeto.

Quando não existir um mecanismo apropriado, comunique no resumo final as alterações, decisões importantes, verificações executadas e limitações. Registre bugs fora do escopo conforme as convenções existentes ou, na ausência delas, descreva-os claramente ao usuário.

## 17. Autonomia e comunicação

Trabalhe de forma autônoma nas decisões reversíveis e de baixo risco. Peça esclarecimento quando a ambiguidade puder levar a uma mudança relevante, irreversível ou incompatível com a intenção do usuário.

Antes de agir, não faça perguntas cuja resposta já esteja disponível no repositório ou na conversa. Não afirme que algo foi implementado, validado ou publicado sem evidência.

No resumo da tarefa, informe de forma objetiva:

- o que foi alterado;
- por que a abordagem foi escolhida;
- quais verificações foram executadas e seus resultados;
- riscos, limitações ou decisões pendentes.

## 18. Critérios de conclusão

Considere a tarefa concluída quando:

- o pedido e seus critérios de aceitação tiverem sido atendidos;
- as mudanças estiverem alinhadas à arquitetura e às convenções do projeto;
- os contratos existentes tiverem sido preservados ou alterados deliberadamente, conforme o escopo;
- os testes e verificações pertinentes tiverem sido executados, ou suas limitações explicitadas;
- não houver alterações colaterais evitáveis;
- o resultado estiver explicado de forma verificável.

## 19. Princípios essenciais

1. Entenda antes de alterar.
2. Siga o objetivo e o escopo.
3. Preserve contratos, salvo quando a mudança deles for intencional.
4. Prefira soluções simples, explícitas e proporcionais.
5. Respeite as convenções razoáveis do projeto.
6. Proteja dados, segurança e compatibilidade.
7. Corrija problemas com evidências, não com suposições.
8. Teste o que mudou e informe o que não foi possível verificar.
9. Não esconda incertezas nem declare sucesso sem comprovação.
10. Deixe a codebase mais fácil de manter sem criar complexidade desnecessária.
