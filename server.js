const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3210);
const publicDir = path.join(__dirname, 'public');
const send = (res, code, data) => { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, {configured: Boolean(process.env.OPENAI_API_KEY)});
  if (req.method === 'POST' && url.pathname === '/api/ia') {
    const origin = req.headers.origin;
    if (origin && origin !== `http://localhost:${port}` && origin !== `http://127.0.0.1:${port}`) return send(res, 403, {error:'Origem não autorizada.'});
    if (!process.env.OPENAI_API_KEY) return send(res, 503, {error:'A chave da OpenAI ainda não foi configurada. Consulte o arquivo README.'});
    let body = '';
    try {
      for await (const chunk of req) { body += chunk; if (body.length > 12000) throw new Error('Solicitação muito grande.'); }
      const data = JSON.parse(body);
      if (!['interpretar','receitas'].includes(data.tipo) || typeof data.texto !== 'string' || !data.texto.trim() || data.texto.length > 2000) return send(res, 400, {error:'Informe um texto válido.'});
      const instructions = data.tipo === 'interpretar'
        ? 'Você ajuda a identificar alimentos em descrições. Responda em português com uma lista curta de possíveis alimentos. Não estime pesos nem calorias. Avise que é preciso confirmar o preparo e informar o peso de cada alimento. Não forneça aconselhamento médico.'
        : 'Sugira até três receitas simples em português usando os ingredientes informados. Liste ingredientes e preparo. Indique claramente qualquer ingrediente adicional. Não forneça calorias, metas alimentares ou aconselhamento médico. Lembre o usuário de verificar alergias e segurança alimentar.';
      const response = await fetch('https://api.openai.com/v1/responses', {method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-6-luna', instructions, input:data.texto, store:false}), signal:AbortSignal.timeout(45000)});
      const result = await response.json();
      if (!response.ok) return send(res, 502, {error:`A API não concluiu a solicitação (${response.status}). Verifique a chave, o modelo e o acesso da conta.`});
      const text = (result.output || []).flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('\n').trim();
      if (!text) return send(res, 502, {error:'A API não retornou texto. Tente novamente.'});
      return send(res, 200, {texto:text});
    } catch (err) { return send(res, 502, {error:'Não foi possível concluir a solicitação de IA. Verifique a conexão e tente novamente.'}); }
  }
  if (req.method !== 'GET') return send(res, 405, {error:'Método não permitido.'});
  const files = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};
  const file = files[url.pathname];
  if (!file) return send(res, 404, {error:'Não encontrado.'});
  const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'text/javascript';
  fs.readFile(path.join(publicDir, file), (err, content) => { if (err) return send(res, 500, {error:'Arquivo indisponível.'}); res.writeHead(200, {'Content-Type':`${type}; charset=utf-8`,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}); res.end(content); });
});
server.listen(port, '127.0.0.1', () => console.log(`Meu Prato: http://localhost:${port}`));
