# Pratop

Aplicação web de acompanhamento alimentar desenvolvida como projeto acadêmico. Permite registrar refeições, estimar nutrientes, consultar relatórios e solicitar sugestões de receitas ou interpretações de refeições com IA.

## Funcionalidades

- Registro de refeições com data, tipo, alimentos e quantidades em gramas.
- Estimativas de calorias, proteínas, carboidratos e gorduras.
- Resumos diários e dos últimos sete dias, com gráfico.
- Sugestões de receitas e interpretação de descrições com a API da OpenAI, quando configurada.
- Exportação e importação de uma cópia dos dados em JSON.

Os valores nutricionais vêm de um **subconjunto de 22 alimentos** da [Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição, NEPA/UNICAMP, 2011](https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf). O cálculo multiplica o valor por 100 g pela quantidade informada e divide por 100. Os dados são estimativas e dependem do alimento e de seu preparo; não substituem orientação profissional.

## Como executar

É necessário ter [Node.js](https://nodejs.org/) versão 18 ou superior. Não é preciso instalar dependências.

No Windows, abra `iniciar.bat` e mantenha a janela aberta. Depois, acesse <http://localhost:3210> no navegador. Alternativamente, no terminal, dentro da pasta do projeto:

```sh
node server.js
```

Para encerrar, pressione Ctrl+C ou feche o terminal. Caso a porta 3210 esteja ocupada, configure a variável `PORT` antes de iniciar e acesse a porta escolhida.

## Configuração da IA

O cadastro e os relatórios funcionam sem chave. Para usar a interpretação de refeições e sugestões de receitas, é necessário acesso à API da OpenAI, uma chave válida, acesso ao modelo configurado e conexão à internet. Chamadas à API podem gerar cobrança. O modelo padrão é `gpt-6-luna`; é possível escolher outro modelo disponível na conta pela variável `OPENAI_MODEL`.

No PowerShell, na pasta do projeto:

```powershell
$env:OPENAI_API_KEY = Read-Host 'Cole sua chave da API'
node server.js
```

Não inclua a chave em arquivos versionados e não a compartilhe. A chave fica no processo do servidor local e não é enviada ao navegador. Ao solicitar uma função de IA, o texto informado é enviado à OpenAI. A interpretação precisa ser confirmada pela pessoa, que informa as quantidades. As receitas também precisam ser revisadas quanto a ingredientes, alergias e preparo.

## Armazenamento e limitações

Os registros ficam no armazenamento local do navegador, por computador e endereço; não há contas ou sincronização. Limpar os dados do navegador pode apagá-los: exporte um backup antes. A IA exige configuração e não substitui a tabela nutricional. O reconhecimento por imagem não foi implementado.

## Estrutura

`server.js` serve os arquivos e encaminha as solicitações de IA; `public/` contém a interface e os cálculos; `iniciar.bat` facilita a execução no Windows.
