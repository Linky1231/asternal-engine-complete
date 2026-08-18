import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight, AtSign, CalendarDays, CheckCircle2, ChevronRight, Download,
  FileText, FolderOpen, Gamepad2, Image as ImageIcon, Inbox, Loader2,
  MessageSquare, Palette, Search, SlidersHorizontal, Sparkles, Users, X,
} from "lucide-react";
import { Avatar } from "./Avatar";
import {
  buildChannels, messagePreview, searchFiles, searchMessages, searchPosts,
  searchProjects, searchUsers, type SearchChannel, type SearchMessage,
  type SearchPost, type SearchProject, type SearchScope,
} from "@/lib/social/global-search";
import { fetchChatProfiles } from "@/lib/social/chat";
import { setCurrentProjectId } from "@/lib/engine/storage";
import { fileEmoji, fileExt, formatBytes, type WorkFile } from "@/lib/social/work";
import type { Profile } from "@/lib/social/api";

type Tab = "all" | "messages" | "users" | "posts" | "games" | "artworks" | "projects" | "files";

const TABS: { id: Tab; label: string; icon: typeof Search }[] = [
  { id: "all", label: "Todo", icon: Sparkles },
  { id: "users", label: "Perfiles", icon: Users },
  { id: "games", label: "Juegos", icon: Gamepad2 },
  { id: "artworks", label: "Arte", icon: Palette },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "messages", label: "Chats", icon: MessageSquare },
  { id: "projects", label: "Estudio", icon: FolderOpen },
  { id: "files", label: "Archivos", icon: Download },
];

function fmtWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function countLabel(count: number) {
  return `${count} resultado${count === 1 ? "" : "s"}`;
}

export function GlobalSearchPanel({
  defaultScope,
  onClose,
  onOpenMessage,
  standalone = false,
}: {
  defaultScope: SearchScope;
  onClose: () => void;
  onOpenMessage: (chatId: string) => void;
  standalone?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [scope, setScope] = useState<SearchScope>(defaultScope);
  const [tab, setTab] = useState<Tab>("all");
  const [channelId, setChannelId] = useState("");
  const [personId, setPersonId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [channels, setChannels] = useState<SearchChannel[]>([]);
  const [senders, setSenders] = useState<Map<string, Profile>>(new Map());
  const [personOptions, setPersonOptions] = useState<{ id: string; name: string }[]>([]);
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<SearchProject[]>([]);
  const [files, setFiles] = useState<WorkFile[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [games, setGames] = useState<SearchPost[]>([]);
  const [artworks, setArtworks] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendersRef = useRef<Map<string, Profile>>(new Map());

  useEffect(() => {
    inputRef.current?.focus();
    void buildChannels().then(setChannels).catch(() => setChannels([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q), 260);
    return () => window.clearTimeout(timer);
  }, [q]);

  const clearResults = () => {
    setMessages([]); setUsers([]); setProjects([]); setFiles([]); setPosts([]); setGames([]); setArtworks([]);
  };

  const runSearch = useCallback(async () => {
    const query = debounced.trim();
    if (!query) {
      clearResults();
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const filters = { scope, channelId, personId, dateFrom, dateTo };
      const [msgs, foundUsers, foundProjects, foundFiles, foundPosts, foundGames, foundArt] = await Promise.all([
        searchMessages(query, channels, filters),
        searchUsers(query),
        searchProjects(query),
        searchFiles(query, channels, filters),
        searchPosts(query, "post"),
        searchPosts(query, "game"),
        searchPosts(query, "artwork"),
      ]);
      const ids = Array.from(new Set(msgs.map(message => message.sender_id).filter(Boolean))) as string[];
      const missingProfiles = ids.filter(id => !sendersRef.current.has(id));
      if (missingProfiles.length) {
        try {
          const foundSenders = await fetchChatProfiles(missingProfiles);
          sendersRef.current = new Map([...sendersRef.current, ...foundSenders]);
        } catch { /* El resto de resultados sigue siendo útil sin avatares de chat. */ }
      }
      setSenders(new Map(sendersRef.current));
      if (!personId) {
        const options = new Map<string, string>();
        for (const message of msgs) {
          const profile = sendersRef.current.get(message.sender_id ?? "");
          options.set(message.sender_id ?? "", profile?.display_name || profile?.username || message.sender_id?.slice(0, 8) || "Usuario");
        }
        for (const file of foundFiles) {
          const profile = sendersRef.current.get(file.uploaded_by);
          options.set(file.uploaded_by, profile?.display_name || profile?.username || file.uploaded_by_name || file.uploaded_by.slice(0, 8));
        }
        setPersonOptions(Array.from(options.entries()).filter(([id]) => id).map(([id, name]) => ({ id, name })));
      }
      setMessages(msgs); setUsers(foundUsers); setProjects(foundProjects); setFiles(foundFiles);
      setPosts(foundPosts); setGames(foundGames); setArtworks(foundArt); setSearched(true);
    } catch {
      clearResults();
      setSearched(true);
      setError("No se pudo completar la búsqueda. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }, [debounced, scope, channelId, personId, dateFrom, dateTo, channels]);

  useEffect(() => { void runSearch(); }, [runSearch]);

  const counts: Record<Tab, number> = {
    all: messages.length + users.length + posts.length + games.length + artworks.length + projects.length + files.length,
    messages: messages.length, users: users.length, posts: posts.length, games: games.length,
    artworks: artworks.length, projects: projects.length, files: files.length,
  };
  const total = counts.all;
  const hasAdvancedFilters = Boolean(channelId || personId || dateFrom || dateTo);
  const channelName = (id: string) => channels.find(channel => channel.id === id)?.name ?? "Chat";
  const senderOf = (message: SearchMessage) => senders.get(message.sender_id ?? "");

  const clearAdvancedFilters = () => { setChannelId(""); setPersonId(""); setDateFrom(""); setDateTo(""); };
  const openProject = (id: string) => { setCurrentProjectId(id); router.navigate({ to: "/editor" }); };
  const openPost = (id: string) => { window.location.assign(`/feed?p=${encodeURIComponent(id)}`); };
  const postTitle = (post: SearchPost, fallback: string) => (post.content || fallback).split("\n")[0].replace(/^[🎮🎨🖼️\s]+/, "").trim() || fallback;

  const resultClass = "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border/65 bg-card/78 p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-[0_13px_28px_-24px_rgba(28,108,214,.70)] active:scale-[.99]";
  const messageRow = (message: SearchMessage) => {
    const profile = senderOf(message);
    return <button key={`msg-${message.id}`} onClick={() => onOpenMessage(message.chat_id)} className={resultClass}>
      <Avatar p={profile} size={40} label={(message.sender_id || "?")[0]?.toUpperCase()} />
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate font-display text-[13px] font-semibold">{profile?.display_name || profile?.username || "Usuario"}</span><span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground/70">{fmtWhen(message.created_at)}</span></div><p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{messagePreview(message)}</p><span className="mt-1.5 inline-flex rounded-md bg-primary/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-primary">En {channelName(message.chat_id)}</span></div><ChevronRight size={16} className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>;
  };
  const userRow = (profile: Profile) => <Link key={`user-${profile.id}`} to="/profile/$userId" params={{ userId: profile.id }} className={resultClass}>
    <Avatar p={profile} size={40} /><div className="min-w-0 flex-1"><div className="truncate font-display text-[13px] font-semibold group-hover:text-primary">{profile.display_name || profile.username}</div><div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><AtSign size={10} />{profile.username}</div>{profile.bio && <p className="mt-1 truncate text-[10px] text-muted-foreground/75">{profile.bio}</p>}</div><ChevronRight size={16} className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
  </Link>;
  const postRow = (post: SearchPost, kind: "post" | "game" | "artwork") => {
    const fallback = kind === "game" ? "Juego" : kind === "artwork" ? "Arte de galería" : "Publicación";
    const title = postTitle(post, fallback);
    const image = post.signed_cover || post.signed_media?.[0];
    const Icon = kind === "game" ? Gamepad2 : kind === "artwork" ? Palette : FileText;
    return <button key={`${kind}-${post.id}`} onClick={() => openPost(post.id)} className={resultClass}>
      {image ? <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-border/70 object-cover" /> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/8 text-primary"><Icon size={19} /></div>}
      <div className="min-w-0 flex-1"><div className="truncate font-display text-[13px] font-semibold group-hover:text-primary">{title}</div><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{post.author?.display_name || post.author?.username || "Usuario"} · {fmtWhen(post.created_at)}</p><span className="mt-1.5 inline-flex rounded-md bg-muted px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">{fallback}</span></div><ChevronRight size={16} className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>;
  };
  const projectRow = (project: SearchProject) => <button key={`prj-${project.id}`} onClick={() => openProject(project.id)} className={resultClass}>
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/8 text-primary"><Gamepad2 size={18} /></div><div className="min-w-0 flex-1"><div className="truncate font-display text-[13px] font-semibold group-hover:text-primary">{project.name}</div><p className="mt-0.5 text-[11px] text-muted-foreground">Proyecto · editado {fmtWhen(new Date(project.updatedAt).toISOString())}</p></div><ChevronRight size={16} className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
  </button>;
  const fileRow = (file: WorkFile) => <div key={`file-${file.id}`} className="flex w-full items-center gap-3 rounded-2xl border border-border/65 bg-card/78 p-3 shadow-sm transition hover:border-primary/30 hover:bg-card">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-lg">{fileEmoji(fileExt(file.name))}</span><div className="min-w-0 flex-1"><div className="truncate font-display text-[13px] font-semibold">{file.name}</div><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{formatBytes(file.size)} · {channelName(file.chat_id)} · {fmtWhen(file.created_at)}</p></div><a href={file.dataUrl} download={file.name} title={`Descargar ${file.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/35 hover:bg-primary/8 hover:text-primary active:scale-95"><Download size={14} /></a>
  </div>;

  const sections: { key: Tab; title: string; description: string; icon: ReactNode; items: ReactNode[]; count: number }[] = [
    { key: "users", title: "Perfiles", description: "Personas y creadores", icon: <Users size={15} />, items: users.slice(0, 3).map(userRow), count: users.length },
    { key: "games", title: "Juegos", description: "Experiencias para jugar", icon: <Gamepad2 size={15} />, items: games.slice(0, 3).map(item => postRow(item, "game")), count: games.length },
    { key: "artworks", title: "Arte", description: "Galería de la comunidad", icon: <Palette size={15} />, items: artworks.slice(0, 3).map(item => postRow(item, "artwork")), count: artworks.length },
    { key: "posts", title: "Publicaciones", description: "Conversación reciente", icon: <FileText size={15} />, items: posts.slice(0, 3).map(item => postRow(item, "post")), count: posts.length },
    { key: "messages", title: "Chats", description: "Mensajes y conversaciones", icon: <MessageSquare size={15} />, items: messages.slice(0, 3).map(messageRow), count: messages.length },
    { key: "projects", title: "Estudio", description: "Tus proyectos guardados", icon: <FolderOpen size={15} />, items: projects.slice(0, 3).map(projectRow), count: projects.length },
    { key: "files", title: "Archivos", description: "Recursos compartidos", icon: <Download size={15} />, items: files.slice(0, 3).map(fileRow), count: files.length },
  ];

  const emptyState = (kind: "start" | "no-results" | "error") => {
    if (kind === "error") return <div className="rounded-3xl border border-dashed border-amber-400/45 bg-amber-50/40 px-6 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/12 text-amber-600"><Inbox size={21} /></div><h2 className="mt-4 font-display text-base font-semibold">No pudimos buscar ahora</h2><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{error}</p><button onClick={() => void runSearch()} className="mt-4 rounded-xl border border-amber-500/30 bg-card px-3 py-2 text-xs font-display font-semibold text-amber-700 transition hover:bg-amber-500 hover:text-white">Reintentar</button></div>;
    if (kind === "no-results") return <div className="rounded-3xl border border-dashed border-border/90 bg-card/60 px-6 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Search size={21} /></div><h2 className="mt-4 font-display text-base font-semibold">No encontramos “{debounced}”</h2><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">Prueba con otro nombre, una palabra más corta o cambia el tipo de contenido.</p><button onClick={() => { setQ(""); setTab("all"); inputRef.current?.focus(); }} className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/7 px-3 py-2 text-xs font-display font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"><X size={13} /> Limpiar búsqueda</button></div>;
    return <div className="grid gap-3 sm:grid-cols-3"><div className="sm:col-span-3 rounded-3xl border border-primary/16 bg-primary/[0.045] p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl grad-brand text-primary-foreground shadow-md shadow-primary/20"><Sparkles size={18} /></div><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary">Descubrimiento</p><h2 className="mt-1 font-display text-lg font-semibold">Todo Asternal en una sola búsqueda</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">Encuentra cuentas, juegos, arte, publicaciones, chats, proyectos y archivos sin tener que salir de esta pantalla.</p></div></div></div><div className="rounded-2xl border border-border/70 bg-card/75 p-4"><Users size={17} className="text-primary" /><h3 className="mt-3 font-display text-sm font-semibold">Personas</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Busca por nombre visible o usuario, por ejemplo <span className="font-mono text-primary">Linky</span>.</p></div><div className="rounded-2xl border border-border/70 bg-card/75 p-4"><Gamepad2 size={17} className="text-primary" /><h3 className="mt-3 font-display text-sm font-semibold">Creaciones</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Localiza juegos, arte y publicaciones por su título o contenido.</p></div><div className="rounded-2xl border border-border/70 bg-card/75 p-4"><FolderOpen size={17} className="text-primary" /><h3 className="mt-3 font-display text-sm font-semibold">Tu estudio</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Consulta proyectos, mensajes y recursos del trabajo colaborativo.</p></div></div>;
  };

  const activeItems: Record<Exclude<Tab, "all">, ReactNode[]> = {
    messages: messages.map(messageRow), users: users.map(userRow), posts: posts.map(item => postRow(item, "post")), games: games.map(item => postRow(item, "game")), artworks: artworks.map(item => postRow(item, "artwork")), projects: projects.map(projectRow), files: files.map(fileRow),
  };

  return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={standalone ? "w-full" : "fixed inset-0 z-[97] overflow-y-auto bg-black/55 p-3 backdrop-blur-md sm:p-6"} onClick={standalone ? undefined : onClose}>
    <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} onClick={event => event.stopPropagation()} className={`${standalone ? "w-full" : "mx-auto max-w-5xl"} overflow-hidden rounded-[30px] border border-border/75 bg-background shadow-[0_28px_85px_-38px_rgba(13,69,157,.58)]`} aria-label="Buscador global">
      <div className="h-1 grad-brand" />
      <header className="relative overflow-hidden border-b border-border/70 bg-card/76 px-4 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-primary/12 blur-3xl" /><div className="pointer-events-none absolute left-[32%] top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl grad-brand text-primary-foreground shadow-lg shadow-primary/20"><Search size={19} /></div><div className="min-w-0 flex-1"><p className="font-mono text-[9px] uppercase tracking-[.18em] text-primary">Explora Asternal</p><h1 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Encuentra lo que estás buscando</h1><p className="mt-1 text-xs text-muted-foreground">Perfiles, juegos, arte, publicaciones y tu espacio de trabajo.</p></div><button onClick={onClose} aria-label="Cerrar buscador" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground transition hover:border-primary/35 hover:text-primary active:scale-95"><X size={17} /></button></div>
        <div className="relative mt-5 rounded-2xl p-px grad-brand shadow-[0_14px_32px_-20px_rgba(33,110,211,.88)]"><div className="flex items-center gap-3 rounded-[15px] bg-background/95 px-4 py-3 transition focus-within:bg-card"><Search size={18} className="shrink-0 text-primary" /><input ref={inputRef} value={q} onChange={event => setQ(event.target.value)} placeholder="Busca personas, juegos, arte y más…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" aria-label="Buscar en Asternal" />{loading ? <Loader2 size={17} className="shrink-0 animate-spin text-primary" /> : q && <button onClick={() => setQ("")} aria-label="Limpiar búsqueda" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/9 text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"><X size={13} /></button>}</div></div>
      </header>

      <div className="border-b border-border/65 bg-background/75 px-4 py-3 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Ámbito de búsqueda">{([ ["all", "Todo"], ["community", "Comunidad"], ["work", "Trabajo"] ] as [SearchScope, string][]).map(([id, label]) => <button key={id} onClick={() => setScope(id)} className={`h-9 shrink-0 rounded-xl border px-3 text-[11px] font-display font-medium transition active:scale-[.97] ${scope === id ? "border-transparent grad-brand text-primary-foreground shadow-md shadow-primary/15" : "border-border/70 bg-card/70 text-muted-foreground hover:border-primary/25 hover:text-primary"}`}>{label}</button>)}</div><button onClick={() => setFiltersOpen(open => !open)} className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-display font-medium transition active:scale-[.97] ${filtersOpen || hasAdvancedFilters ? "border-primary/28 bg-primary/8 text-primary" : "border-border/70 bg-card/70 text-muted-foreground hover:border-primary/25 hover:text-primary"}`}><SlidersHorizontal size={13} />Filtros{hasAdvancedFilters && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary text-[8px] text-primary-foreground">!</span>}</button></div>
        {filtersOpen && <div className="mt-3 rounded-2xl border border-primary/15 bg-primary/[.035] p-3 sm:p-4"><div className="mb-3 flex items-center justify-between"><div><p className="font-display text-xs font-semibold">Afinar resultados</p><p className="mt-0.5 text-[10px] text-muted-foreground">Aplica filtros solo cuando los necesites.</p></div>{hasAdvancedFilters && <button onClick={clearAdvancedFilters} className="text-[10px] font-display font-semibold text-primary hover:underline">Restablecer</button>}</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><label className="block"><span className="mb-1 block font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Canal</span><select value={channelId} onChange={event => setChannelId(event.target.value)} className="h-10 w-full rounded-xl border border-border/70 bg-card px-2.5 text-xs outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/12"><option value="">Todos los canales</option>{channels.map(channel => <option key={channel.id} value={channel.id}>{channel.isWork ? "Trabajo · " : ""}{channel.name}</option>)}</select></label><label className="block"><span className="mb-1 block font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Persona</span><select value={personId} onChange={event => setPersonId(event.target.value)} className="h-10 w-full rounded-xl border border-border/70 bg-card px-2.5 text-xs outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/12"><option value="">Todas las personas</option>{personOptions.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label className="block"><span className="mb-1 block font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Desde</span><input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="h-10 w-full rounded-xl border border-border/70 bg-card px-2.5 text-xs outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/12" /></label><label className="block"><span className="mb-1 block font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Hasta</span><input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="h-10 w-full rounded-xl border border-border/70 bg-card px-2.5 text-xs outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/12" /></label></div></div>}
      </div>

      <nav className="border-b border-border/65 bg-card/52 px-4 py-3 sm:px-6" aria-label="Tipo de resultados"><div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">{TABS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-display font-medium transition active:scale-[.97] ${tab === id ? "border-transparent grad-brand text-primary-foreground shadow-md shadow-primary/15" : "border-border/65 bg-background/65 text-muted-foreground hover:border-primary/25 hover:text-primary"}`}><Icon size={13} />{label}{counts[id] > 0 && <span className={`rounded-md px-1.5 py-0.5 font-mono text-[8px] ${tab === id ? "bg-white/18" : "bg-muted"}`}>{counts[id]}</span>}</button>)}</div></nav>

      <main className="min-h-[440px] bg-background/45 px-4 py-5 sm:px-6 sm:py-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div>{searched ? <><p className="font-mono text-[9px] uppercase tracking-[.15em] text-primary">Resultados</p><h2 className="mt-0.5 font-display text-base font-semibold">{loading ? "Buscando…" : `${countLabel(total)} para “${debounced}”`}</h2></> : <><p className="font-mono text-[9px] uppercase tracking-[.15em] text-primary">Comienza a explorar</p><h2 className="mt-0.5 font-display text-base font-semibold">Escribe lo que quieras encontrar</h2></>}</div>{searched && !loading && total > 0 && <div className="inline-flex items-center gap-1.5 rounded-xl border border-border/65 bg-card/70 px-2.5 py-1.5 text-[10px] text-muted-foreground"><CheckCircle2 size={12} className="text-primary" />{scope === "all" ? "Todos los espacios" : scope === "community" ? "Comunidad" : "Trabajo"}</div>}</div>
        {loading && <div className="space-y-3">{[0, 1, 2, 3].map(index => <div key={index} className="h-[74px] rounded-2xl anim-shimmer" />)}</div>}
        {!loading && error && emptyState("error")}
        {!loading && !error && !searched && emptyState("start")}
        {!loading && !error && searched && total === 0 && emptyState("no-results")}
        {!loading && !error && searched && total > 0 && tab === "all" && <div className="space-y-6">{sections.filter(section => section.count > 0).map(section => <section key={section.key}><div className="mb-2.5 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/9 text-primary">{section.icon}</span><div className="min-w-0"><h3 className="font-display text-sm font-semibold">{section.title}</h3><p className="text-[10px] text-muted-foreground">{section.description}</p></div><div className="ml-auto flex items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{section.count}</span><button onClick={() => setTab(section.key)} className="inline-flex items-center gap-1 text-[10px] font-display font-semibold text-primary hover:underline">Ver todo <ArrowRight size={11} /></button></div></div><div className="space-y-2">{section.items}</div></section>)}</div>}
        {!loading && !error && searched && total > 0 && tab !== "all" && <div className="space-y-2">{activeItems[tab].length > 0 ? activeItems[tab] : emptyState("no-results")}</div>}
      </main>
      {searched && !loading && <footer className="flex items-center justify-center gap-1.5 border-t border-border/65 bg-card/52 px-4 py-2.5 text-[10px] text-muted-foreground"><CalendarDays size={11} />Los resultados se actualizan mientras escribes</footer>}
    </motion.section>
  </motion.div>;
}
