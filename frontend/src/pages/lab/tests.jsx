import { useEffect, useMemo, useState } from "react";
import { Activity, Beaker, Layers, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, inputCls, Modal, SectionHeader, selectCls, StatCard, StatusBadge, textareaCls } from "../../components/lab/ui";
import { categories } from "../../lib/constants";
import { Link } from "../../lib/navigation";
import { useTests } from "../../lib/tests-store";
import { testsStore } from "../../lib/tests-store";
import { useTranslation } from "react-i18next";

export default function TestManagementPage() {
  useEffect(() => {
    document.title = t('testManagementPage.title', 'Test Management - Lab Admin');
  }, []);

  const tests = useTests();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return tests;
    const q = query.toLowerCase();
    return tests.filter(
      (test) =>
        test.code.toLowerCase().includes(q) ||
        test.name.toLowerCase().includes(q) ||
        test.category.toLowerCase().includes(q)
    );
  }, [tests, query]);

  const stats = useMemo(
    () => ({
      total: tests.length,
      active: tests.filter((test) => test.status === "Active").length,
      inactive: tests.filter((test) => test.status === "Inactive").length,
      avgPrice: tests.length
        ? Math.round(tests.reduce((sum, test) => sum + test.price, 0) / tests.length)
        : 0,
    }),
    [tests]
  );

  function openEdit(test) {
    setEditing(test);
    const { id, ...rest } = test;
    setForm(rest);
  }

  async function save() {
    if (!editing || !form || !form.code || !form.name) return;
    await new Promise(resolve => setTimeout(resolve, 400));
    testsStore.update(editing.id, form);
    setEditing(null);
    setForm(null);
  }

  function deleteTest(testId) {
    setIsDeleting(true);
    setTimeout(() => {
      testsStore.remove(testId);
      setIsDeleting(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8">
      <SectionHeader
        title={t('testManagementPage.sectionHeader.title', 'Test Management')}
        subtitle={t('testManagementPage.sectionHeader.subtitle', 'Maintain your diagnostic test catalog, pricing and turnaround times.')}
        action={
          <Link to="/add-test">
            <Button>
              <Plus className="size-4" /> {t('testManagementPage.sectionHeader.action', 'Add New Test')}
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('testManagementPage.stats.total', 'Total Tests')} value={stats.total} icon={<Beaker className="size-5" />} hint={t('testManagementPage.stats.hintTotal', 'In catalog')} />
        <StatCard
          label={t('testManagementPage.stats.active', 'Active')}
          value={stats.active}
          tone="success"
          icon={<Activity className="size-5" />}
          hint={t('testManagementPage.stats.hintActive', 'Available to order')}
        />
        <StatCard
          label={t('testManagementPage.stats.inactive', 'Inactive')}
          value={stats.inactive}
          tone="warning"
          icon={<Tag className="size-5" />}
          hint={t('testManagementPage.stats.hintInactive', 'Hidden from order page')}
        />
        <StatCard
          label={t('testManagementPage.stats.avgPrice', 'Avg Price')}
          value={`Rs.${stats.avgPrice}`}
          tone="info"
          icon={<Layers className="size-5" />}
          hint={t('testManagementPage.stats.hintAvgPrice', 'Across catalog')}
        />
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-foreground text-[15px]">{t('testManagementPage.cardTitle', 'Test Catalog')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {tests.length} {t('testManagementPage.cardSubtitle', 'tests')}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('testManagementPage.searchPlaceholder', 'Search code, name or category...')}
              className={inputCls + " pl-9"}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-100 bg-white">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                {["Code", "Test Name", "Category", "Sample", "Method", "TAT", "Price", "Status", ""].map((header, index) => (
                  <th key={index} className="px-4 py-3 font-semibold first:pl-5 last:pr-5">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title={t('testManagementPage.emptyState.title', 'No tests found')}
                      hint={t('testManagementPage.emptyState.hint', 'Try adjusting your search.')}
                      icon={<Search className="size-5" />}
                    />
                  </td>
                </tr>
              )}
              {filtered.map((test) => (
                <tr key={test.id} className="border-t border-border/60 row-hover">
                  <td className="px-4 py-3.5 pl-5 font-mono text-[12px] text-primary font-medium">
                    {test.code}
                  </td>
                  <td className="px-4 py-3.5 max-w-[260px]">
                    <div className="font-medium text-foreground">{test.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {test.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{test.category}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{test.sampleType}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{test.method}</td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{test.tat}</td>
                  <td className="px-4 py-3.5 text-foreground font-medium tabular-nums">
                    Rs.{test.price}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex gap-1 justify-end">
                      <button
                        aria-label="Edit"
                        onClick={() => openEdit(test)}
                        className="size-8 rounded-lg hover:bg-secondary grid place-items-center text-muted-foreground hover:text-primary transition"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() => deleteTest(test.id)}
                        disabled={isDeleting}
                        className="size-8 rounded-lg hover:bg-destructive/10 grid place-items-center text-muted-foreground hover:text-destructive transition disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-semibold text-foreground text-[15px]">{t('testManagementPage.categoriesTitle', 'Test Categories')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('testManagementPage.categoriesHint', 'Group your catalog by clinical discipline.')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all text-center cursor-pointer"
              >
                <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
                  <Beaker className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.count} tests</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}