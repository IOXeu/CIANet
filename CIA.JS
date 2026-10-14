import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FolderPlus, 
  Code2, 
  Tag, 
  Copy, 
  Check, 
  Filter, 
  Sparkles,
  FileCode2,
  Trash2
} from 'lucide-react';

// Dados de exemplo para simular o banco de dados/repositório
const INITIAL_PROJECTS = [
  {
    id: '1',
    title: 'JWT Refresh Token Strategy',
    description: 'Implementação completa de autenticação JWT com rotação de refresh token em Node.js.',
    category: 'Autenticação',
    language: 'TypeScript',
    code: `// Express Refresh Token Middleware
import jwt from 'jsonwebtoken';

export const refreshTokenHandler = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ id: user.id });
    res.json({ accessToken });
  });
};`,
    tags: ['auth', 'jwt', 'security']
  },
  {
    id: '2',
    title: 'PostgreSQL Connection Pool',
    description: 'Gerenciamento otimizado de conexões com pg.Pool para prevenir estouro de sockets.',
    category: 'Banco de Dados',
    language: 'JavaScript',
    code: `const { Pool } = require('pg');

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};`,
    tags: ['database', 'postgres', 'backend']
  },
  {
    id: '3',
    title: 'Custom Hook useDebounce',
    description: 'Hook para atrasar chamadas de API durante digitação em campos de pesquisa.',
    category: 'Hooks',
    language: 'TypeScript',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
    tags: ['react', 'hooks', 'frontend']
  }
];

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLanguage, setSelectedLanguage] = useState('Todas');
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal de criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Autenticação',
    language: 'TypeScript',
    code: '',
    tags: ''
  });

  // Copiar código para a área de transferência
  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtragem dos projetos em tempo real
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'Todas' || project.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'Todas' || project.language === selectedLanguage;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [projects, searchTerm, selectedCategory, selectedLanguage]);

  // Adicionar novo projeto
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.code) return;

    const created = {
      id: Date.now().toString(),
      ...newProject,
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setProjects([created, ...projects]);
    setIsModalOpen(false);
    setNewProject({
      title: '',
      description: '',
      category: 'Autenticação',
      language: 'TypeScript',
      code: '',
      tags: ''
    });
  };

  // Remover projeto
  const handleDeleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Superior */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">ControllA</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner de Apresentação e Busca */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Localizador Inteligente de <span className="text-cyan-400">Projetos & Códigos</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Pesquise por linguagem, funcionalidade ou tags. O ControllA organiza e varre seus trechos de código em segundos.
            </p>
          </div>

          {/* Campo de Busca Principal */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: JWT, custom hook, postgres, auth..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
              />
            </div>
            <button 
              onClick={() => {}} 
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Buscar
            </button>
          </div>

          {/* Sugestões Rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <span className="text-slate-500 font-medium">Sugestões:</span>
            {['JWT Refresh Token', 'Postgres Pool', 'useDebounce Hook'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchTerm(term)}
                className="bg-slate-800/60 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </section>

        {/* Barramento de Filtros */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="font-medium">Filtros:</span>
            </div>

            {/* Filtro Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="Todas">Todas Categorias</option>
              <option value="Autenticação">Autenticação</option>
              <option value="Banco de Dados">Banco de Dados</option>
              <option value="Hooks">Hooks</option>
            </select>

            {/* Filtro Linguagem */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="Todas">Todas Linguagens</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Resultados encontrados: <span className="text-cyan-400 font-semibold">{filteredProjects.length}</span>
          </div>
        </div>

        {/* Lista de Projetos (Grid Responsivo) */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <FileCode2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">Nenhum trecho de código encontrado</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Tente alterar os filtros ou o termo de busca para localizar seus módulos salvos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between overflow-hidden transition-all shadow-lg"
              >
                {/* Cabeçalho do Card */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-100 text-base line-clamp-1">
                      {project.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                      {project.language}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Bloco de Código */}
                <div className="bg-slate-950 border-t border-b border-slate-800/80 relative group">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-950/60 text-xs text-slate-500 font-mono">
                    <span>snippet</span>
                    <button
                      onClick={() => handleCopyCode(project.id, project.code)}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {copiedId === project.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-48 scrollbar-thin">
                    <code>{project.code}</code>
                  </pre>
                </div>

                {/* Rodapé com Tags */}
                <div className="p-4 bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
                  <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="flex gap-1.5">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                Cadastrar Novo Snippet
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Ex: Stripe Webhook Handler"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={newProject.category}
                    onChange={e => setNewProject({...newProject, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Linguagem</label>
                  <input
                    type="text"
                    value={newProject.language}
                    onChange={e => setNewProject({...newProject, language: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Breve resumo sobre este código..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Código</label>
                <textarea
                  required
                  rows={4}
                  value={newProject.code}
                  onChange={e => setNewProject({...newProject, code: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="// Cole o trecho de código aqui..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newProject.tags}
                  onChange={e => setNewProject({...newProject, tags: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="api, stripe, payment"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Salvar Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}