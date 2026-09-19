"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Globe, Heart, Lightbulb, MessageCircle, MoreVertical, Plus, Search, Users } from "lucide-react";
import { SAMPLE_POSTS, TRENDING_TOPICS, type CommunityPost, type PostCategory } from "@/lib/community/samplePosts";
import { COMMUNITY_TOTAL_COUNTRIES, COMMUNITY_TOTAL_MEMBERS, rankWithYou } from "@/lib/community/sampleCommunity";
import { avatarColor } from "@/lib/community/avatarColor";
import NewPostModal from "@/components/community/NewPostModal";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORY_TABS = ["All Posts", "Questions", "Showcase", "Resources", "Announcements"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "liked", label: "Most Liked" },
  { value: "discussed", label: "Most Discussed" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

export default function CommunityBoard({ you }: { you: { points: number; challenges: number; circuits: number } }) {
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_POSTS);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("All Posts");
  const [topic, setTopic] = useState("All");
  const [sortBy, setSortBy] = useState<SortValue>("latest");
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);

  const topics = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);
  const contributors = useMemo(() => rankWithYou(you).slice(0, 5), [you]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = posts.filter((p) => {
      if (categoryTab !== "All Posts" && p.category !== categoryTab) return false;
      if (topic !== "All" && !p.tags.includes(topic)) return false;
      if (query && !p.title.toLowerCase().includes(query) && !p.body.toLowerCase().includes(query)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "liked") return likedCount(b, likedIds) - likedCount(a, likedIds);
      if (sortBy === "discussed") return b.comments - a.comments;
      return a.hoursAgo - b.hoursAgo;
    });
    return list;
  }, [posts, categoryTab, topic, search, sortBy, likedIds]);

  function likedCount(post: CommunityPost, liked: Set<string>) {
    return post.likes + (liked.has(post.id) ? 1 : 0);
  }

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleNewPost(draft: { title: string; body: string; category: PostCategory; tags: string[] }) {
    setPosts((prev) => [
      {
        id: `local-${Date.now()}`,
        author: "You",
        category: draft.category,
        title: draft.title,
        body: draft.body,
        tags: draft.tags.length > 0 ? draft.tags : [draft.category],
        comments: 0,
        likes: 0,
        relative: "just now",
        hoursAgo: 0,
      },
      ...prev,
    ]);
    setComposing(false);
    setCategoryTab("All Posts");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Community</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">Ask questions, share ideas, get help, and learn together.</p>
        </div>
        <Button onClick={() => setComposing(true)} className="rounded-lg">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Stat strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{COMMUNITY_TOTAL_MEMBERS.toLocaleString()}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Total Members</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-[var(--marketing-green)]">↑ 12% this month</p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-green)]/15 text-[var(--marketing-green)]">
              <MessageCircle className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{posts.length > SAMPLE_POSTS.length ? posts.length - SAMPLE_POSTS.length + 2340 : 2340}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Discussions</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-[var(--marketing-green)]">↑ 18% this month</p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Lightbulb className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">856</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Solutions</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-[var(--marketing-green)]">↑ 25% this month</p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{COMMUNITY_TOTAL_COUNTRIES}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Countries</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-subtle)]">A global community</p>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-5 overflow-x-auto border-b border-[var(--border)]">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategoryTab(tab)}
                  className={`relative shrink-0 whitespace-nowrap pb-2 text-sm font-semibold transition-colors ${
                    categoryTab === tab ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab}
                  {categoryTab === tab && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    {topic === "All" ? "All Topics" : topic}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={topic} onValueChange={setTopic}>
                    <DropdownMenuRadioItem value="All">All Topics</DropdownMenuRadioItem>
                    {topics.map((t) => (
                      <DropdownMenuRadioItem key={t} value={t}>
                        {t}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    {SORTS.find((s) => s.value === sortBy)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
                    {SORTS.map((s) => (
                      <DropdownMenuRadioItem key={s.value} value={s.value}>
                        {s.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions..."
              className="h-8 rounded-lg pl-8 text-xs"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-sm text-[var(--foreground-muted)]">No discussions match those filters.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((post) => {
                const liked = likedIds.has(post.id);
                return (
                  <Card key={post.id} className="gap-0 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback style={{ background: avatarColor(post.author), color: "#fff" }} className="text-sm font-semibold">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--foreground)]">{post.author}</p>
                            <p className="text-[11px] text-[var(--foreground-subtle)]">{post.relative}</p>
                          </div>
                          <MoreVertical className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)]" />
                        </div>

                        <h3 className="mt-2 text-sm font-bold text-[var(--foreground)]">{post.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--foreground-muted)]">{post.body}</p>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-xs text-[var(--foreground-muted)]">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              {post.comments}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleLike(post.id)}
                              className={`flex items-center gap-1 transition-colors ${liked ? "text-red-500" : "hover:text-red-500"}`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                              {likedCount(post, likedIds)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-4">
          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Trending Topics</h3>
              <button type="button" onClick={() => setTopic("All")} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View All
              </button>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5">
              {TRENDING_TOPICS.map((t, i) => (
                <li key={t.name}>
                  <button
                    type="button"
                    onClick={() => setTopic(t.name)}
                    className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left hover:bg-[var(--surface-hover)]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-bold text-[var(--foreground-muted)]">
                        {i + 1}
                      </span>
                      <span className="truncate text-xs text-[var(--foreground)]">{t.name}</span>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--foreground-muted)]">{t.posts} posts</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Top Contributors</h3>
              <a href="/leaderboard" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View All
              </a>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5">
              {contributors.map((m, i) => (
                <li
                  key={m.name}
                  className={`flex items-center justify-between rounded-lg px-1 py-1.5 ${m.isYou ? "bg-[var(--accent)]/10" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        m.isYou ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "bg-[var(--surface-2)] text-[var(--foreground-muted)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar size="sm">
                      <AvatarFallback style={{ background: avatarColor(m.name), color: "#fff" }} className="text-[10px] font-semibold">
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`truncate text-xs ${m.isYou ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>{m.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">{m.points.toLocaleString()} pts</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--foreground)]">Community Guidelines</p>
                <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">
                  Be respectful, ask thoughtful questions, and help others learn.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)]" />
            </div>
          </Card>
        </aside>
      </div>

      {composing && <NewPostModal onClose={() => setComposing(false)} onSubmit={handleNewPost} />}
    </main>
  );
}
