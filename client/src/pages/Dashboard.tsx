/**
 * Direction « Le Comptoir Éditorial » : un dashboard de cuisine calme et direct,
 * avec des blocs de décision plutôt qu'une accumulation de cartes techniques.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  MenuSquare,
  MoreHorizontal,
  PackageCheck,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";

const navItems = [
  { label: "Vue d’ensemble", icon: LayoutDashboard },
  { label: "Commandes", icon: ShoppingBag },
  { label: "Mon menu", icon: MenuSquare },
  { label: "Horaires", icon: CalendarDays },
  { label: "Profil restaurant", icon: Store },
];

const initialOrders = [
  { id: "#1048", name: "Claire M.", time: "12:48", items: "2 plats · 1 dessert", total: "42,30 €", status: "À confirmer" },
  { id: "#1047", name: "Yanis P.", time: "12:31", items: "1 plat · 1 boisson", total: "19,40 €", status: "En cuisine" },
  { id: "#1046", name: "Lucie B.", time: "12:19", items: "3 plats", total: "51,60 €", status: "Prête" },
  { id: "#1045", name: "Thomas R.", time: "12:04", items: "1 plat · 1 dessert", total: "23,20 €", status: "Terminée" },
];

const menuState = [
  { name: "Pizza truffe & champignons", category: "Les incontournables", price: "16,90 €", available: true },
  { name: "Linguine au safran", category: "Les incontournables", price: "14,50 €", available: true },
  { name: "Bowl du marché", category: "Fraîcheur du jour", price: "12,90 €", available: true },
  { name: "Fondant chocolat noir", category: "Douceurs", price: "8,50 €", available: false },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Vue d’ensemble");
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState(initialOrders);
  const [availability, setAvailability] = useState(menuState);

  const activeOrders = useMemo(() => orders.filter((order) => !["Terminée"].includes(order.status)).length, [orders]);
  const changeOrderStatus = (id: string) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status: order.status === "À confirmer" ? "En cuisine" : order.status === "En cuisine" ? "Prête" : "Terminée" } : order));
  };

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#173f35]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[258px] shrink-0 flex-col border-r border-[#173f35]/10 bg-[#fffaf0] p-5 lg:flex">
          <Link href="/" className="flex items-center gap-3 px-2 py-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#fffaf0] shadow-sm ring-1 ring-[#173f35]/15"><img src="/manus-storage/restocommerce-mark_498ac4bb.png" alt="" className="h-9 w-9 rounded-full" /></span><span className="font-display text-xl tracking-[-0.04em]">RestoCommerce</span></Link>
          <div className="mt-9 px-2 text-[10px] font-extrabold tracking-[0.14em] text-[#173f35]/45 uppercase">La Table de Lila</div>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => { const Icon = item.icon; const active = activeSection === item.label; return <button key={item.label} onClick={() => setActiveSection(item.label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors ${active ? "bg-[#173f35] text-[#fffaf0]" : "text-[#173f35]/65 hover:bg-[#f2eadf] hover:text-[#173f35]"}`}><Icon className="h-4 w-4" />{item.label}{item.label === "Commandes" && activeOrders > 0 && <span className={`ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${active ? "bg-[#d77757] text-white" : "bg-[#eadfcd] text-[#173f35]"}`}>{activeOrders}</span>}</button> })}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#efe6d8] p-4"><p className="text-xs font-bold">Besoin d’un coup de main ?</p><p className="mt-1 text-xs leading-5 text-[#173f35]/60">Notre guide rapide répond aux questions de service.</p><button className="mt-3 text-xs font-extrabold text-[#b85f42]">Ouvrir le guide <ChevronRight className="inline h-3 w-3" /></button></div>
          <Link href="/restaurant/la-table-de-lila" className="mt-5 px-3 text-xs font-bold text-[#173f35]/60 transition-colors hover:text-[#b85f42]">← Retour au restaurant</Link>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex min-h-[78px] items-center justify-between border-b border-[#173f35]/10 bg-[#f7f3eb] px-5 sm:px-8 lg:px-10">
            <div><p className="text-xs font-extrabold tracking-[0.12em] text-[#b85f42] uppercase">Espace restaurateur</p><h1 className="font-display mt-1 text-3xl tracking-[-0.045em] sm:text-4xl">{activeSection}</h1></div>
            <div className="flex items-center gap-3"><button className="relative grid h-10 w-10 place-items-center rounded-full border border-[#173f35]/10 bg-[#fffaf0]" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#f7f3eb] bg-[#d77757]" /></button><button onClick={() => setIsOpen((open) => !open)} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-extrabold transition-transform active:scale-[0.97] ${isOpen ? "bg-[#173f35] text-[#fffaf0]" : "bg-[#d77757] text-white"}`}><span className={`h-2 w-2 rounded-full ${isOpen ? "bg-[#a7d7bc]" : "bg-[#fffaf0]"}`} />{isOpen ? "Ouvert" : "Fermé"}</button></div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#173f35]/10 bg-[#fffaf0] px-5 py-3 lg:hidden" aria-label="Navigation du dashboard">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.label;
              return <button key={item.label} onClick={() => setActiveSection(item.label)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold ${active ? "bg-[#173f35] text-[#fffaf0]" : "bg-[#efe6d8] text-[#173f35]/70"}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>;
            })}
          </nav>

          <div className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">
            {activeSection === "Vue d’ensemble" && <Overview activeOrders={activeOrders} orders={orders} onAdvance={changeOrderStatus} />}
            {activeSection === "Commandes" && <OrdersPanel orders={orders} onAdvance={changeOrderStatus} />}
            {activeSection === "Mon menu" && <MenuPanel availability={availability} onToggle={(name) => setAvailability((current) => current.map((dish) => dish.name === name ? { ...dish, available: !dish.available } : dish))} />}
            {["Horaires", "Profil restaurant"].includes(activeSection) && <ComingSoonPanel section={activeSection} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function Overview({ activeOrders, orders, onAdvance }: { activeOrders: number; orders: typeof initialOrders; onAdvance: (id: string) => void }) {
  return <>
    <div className="flex flex-col gap-5 border-b border-[#173f35]/10 pb-8 md:flex-row md:items-end md:justify-between"><div><h2 className="font-display text-5xl tracking-[-0.05em]">Le service est lancé.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#173f35]/62">Voici les décisions importantes à prendre maintenant. Les données affichées constituent un aperçu de démonstration.</p><span aria-hidden="true" className="service-trace mt-3 text-[#d77757]" /></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#173f35]/15 px-4 text-xs font-extrabold transition-colors hover:bg-[#efe6d8]"><CalendarDays className="h-4 w-4" /> Aujourd’hui, 17 juin</button></div>
    <div className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr]"><Metric label="Commandes actives" value={String(activeOrders)} note="À suivre maintenant" accent="bg-[#173f35]" featured /><Metric label="Ventes du jour" value="684 €" note="vs. 620 € hier" accent="bg-[#d77757]" /><Metric label="Panier moyen" value="21,40 €" note="+ 2,10 € cette semaine" accent="bg-[#b8964b]" /><Metric label="Délai moyen" value="18 min" note="Objectif : moins de 20 min" accent="bg-[#6b9980]" /></div>
    <div className="grid gap-7 xl:grid-cols-[1.18fr_0.82fr]">
      <section className="rounded-[1.6rem] bg-[#fffaf0] p-5 shadow-[0_12px_32px_rgba(23,63,53,0.06)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold tracking-[0.12em] text-[#b85f42] uppercase">Les heures qui comptent</p><h3 className="font-display mt-2 text-3xl tracking-[-0.04em]">Rythme des ventes</h3></div><button className="grid h-9 w-9 place-items-center rounded-full border border-[#173f35]/10"><MoreHorizontal className="h-4 w-4" /></button></div><div className="mt-8 flex h-[210px] items-end gap-3 border-b border-[#173f35]/10 pb-1">{[36, 48, 38, 62, 82, 59, 76, 93, 69, 58, 42, 30].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end"><div className={`min-h-2 rounded-t-lg transition-colors ${index === 7 ? "bg-[#d77757]" : "bg-[#c7d7cb] group-hover:bg-[#6b9980]"}`} style={{ height: `${height}%` }} /><span className="mt-2 text-center text-[9px] font-bold text-[#173f35]/40">{11 + index}h</span></div>)}</div><div className="mt-5 flex items-center justify-between text-xs text-[#173f35]/55"><span>Pic prévu entre 18h et 20h</span><span className="font-bold text-[#173f35]">+ 10 % aujourd’hui</span></div></section>
      <section className="relative overflow-hidden rounded-[1.6rem] bg-[#173f35] p-7 text-[#fffaf0]"><span className="grid h-11 w-11 place-items-center rounded-full border-4 border-[#6b9980] bg-[#fffaf0]/10 text-[#e98d69]"><PackageCheck className="h-5 w-5" /></span><span aria-hidden="true" className="service-trace absolute right-7 top-9 rotate-[25deg] text-[#e98d69]/80" /><p className="font-display mt-8 text-4xl leading-[0.92] tracking-[-0.05em]">Gardez le menu aussi vivant que la cuisine.</p><p className="mt-4 text-sm leading-6 text-[#fffaf0]/65">Un plat est en rupture ? Basculez sa disponibilité en un geste, sans interrompre les commandes.</p><button className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#fffaf0] hover:text-[#e98d69]">Gérer le menu <ArrowUpRight className="h-4 w-4" /></button></section>
    </div>
    <section className="mt-7 rounded-[1.6rem] border border-[#173f35]/10 bg-[#f2eadf] p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold tracking-[0.12em] text-[#b85f42] uppercase">Maintenant</p><h3 className="font-display mt-2 text-3xl tracking-[-0.04em]">Les dernières commandes</h3></div><button className="hidden text-xs font-extrabold text-[#b85f42] sm:inline">Voir toutes les commandes <ChevronRight className="inline h-3 w-3" /></button></div><div className="mt-6 divide-y divide-[#173f35]/10">{orders.slice(0, 3).map((order) => <OrderRow key={order.id} order={order} onAdvance={onAdvance} />)}</div></section>
  </>;
}

function OrdersPanel({ orders, onAdvance }: { orders: typeof initialOrders; onAdvance: (id: string) => void }) { return <><div className="flex flex-col justify-between gap-4 border-b border-[#173f35]/10 pb-8 sm:flex-row sm:items-end"><div><h2 className="font-display text-5xl tracking-[-0.05em]">Les commandes du jour.</h2><p className="mt-2 text-sm text-[#173f35]/62">Faites avancer chaque commande sans perdre le fil.</p></div><span className="rounded-full bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0]">{orders.length} commandes</span></div><section className="mt-8 overflow-hidden rounded-[1.6rem] border border-[#173f35]/10 bg-[#fffaf0]">{orders.map((order) => <OrderRow key={order.id} order={order} onAdvance={onAdvance} large />)}</section></>; }

function MenuPanel({ availability, onToggle }: { availability: typeof menuState; onToggle: (name: string) => void }) { return <><div className="flex flex-col justify-between gap-4 border-b border-[#173f35]/10 pb-8 sm:flex-row sm:items-end"><div><h2 className="font-display text-5xl tracking-[-0.05em]">Le menu en direct.</h2><p className="mt-2 text-sm text-[#173f35]/62">La disponibilité du plat est visible instantanément sur votre menu.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 text-xs font-extrabold text-[#fffaf0]"><UtensilsCrossed className="h-4 w-4" /> Ajouter un plat</button></div><section className="mt-8 overflow-hidden rounded-[1.6rem] border border-[#173f35]/10 bg-[#fffaf0]">{availability.map((dish) => <div key={dish.name} className="flex flex-col gap-4 border-b border-[#173f35]/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="font-display text-2xl tracking-[-0.035em]">{dish.name}</p><p className="mt-1 text-xs text-[#173f35]/56">{dish.category} · {dish.price}</p></div><button onClick={() => onToggle(dish.name)} className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold ${dish.available ? "bg-[#dcecdf] text-[#376d4b]" : "bg-[#f4d9cf] text-[#a3482c]"}`}><span className={`h-2 w-2 rounded-full ${dish.available ? "bg-[#4f9868]" : "bg-[#d77757]"}`} />{dish.available ? "Disponible" : "Indisponible"}</button></div>)}</section></>; }

function ComingSoonPanel({ section }: { section: string }) { return <section className="grid min-h-[520px] place-items-center rounded-[1.7rem] bg-[#efe6d8] p-8 text-center"><div className="max-w-md"><Clock3 className="mx-auto h-8 w-8 text-[#b85f42]" /><h2 className="font-display mt-5 text-5xl tracking-[-0.05em]">{section}, à votre rythme.</h2><p className="mt-4 text-sm leading-6 text-[#173f35]/62">Cette zone sera reliée aux réglages WooCommerce et WCFM dans l’intégration WordPress finale. La structure UX est déjà prévue pour ne pas alourdir le parcours de gestion.</p></div></section>; }

function Metric({ label, value, note, accent, featured = false }: { label: string; value: string; note: string; accent: string; featured?: boolean }) { return <div className={`relative overflow-hidden rounded-[1.35rem] border p-5 ${featured ? "border-[#173f35] bg-[#173f35] text-[#fffaf0]" : "border-[#173f35]/10 bg-[#fffaf0]"}`}><span className={`absolute right-0 top-0 h-2 w-20 ${accent}`} />{featured && <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border-4 border-[#6b9980] bg-[#fffaf0]/10"><ShoppingBag className="h-3.5 w-3.5" /></span>}<p className={`text-xs font-bold ${featured ? "text-[#fffaf0]/62" : "text-[#173f35]/58"}`}>{label}</p><p className="font-display mt-4 text-4xl tracking-[-0.05em]">{value}</p><p className={`mt-2 text-xs ${featured ? "text-[#fffaf0]/58" : "text-[#173f35]/56"}`}>{note}</p></div>; }

function OrderRow({ order, onAdvance, large = false }: { order: typeof initialOrders[number]; onAdvance: (id: string) => void; large?: boolean }) { const color = order.status === "À confirmer" ? "bg-[#f6ddc3] text-[#a5522e]" : order.status === "En cuisine" ? "bg-[#dcecdf] text-[#376d4b]" : order.status === "Prête" ? "bg-[#d7e5e0] text-[#173f35]" : "bg-[#e5e0d7] text-[#173f35]/60"; return <div className={`flex flex-col gap-4 py-4 ${large ? "px-5 sm:px-7" : ""} sm:flex-row sm:items-center sm:justify-between`}><div className="flex items-center gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fffaf0] text-xs font-extrabold shadow-sm">{order.time}</span><div><p className="text-sm font-extrabold">{order.id} · {order.name}</p><p className="mt-0.5 text-xs text-[#173f35]/55">{order.items} · {order.total}</p></div></div><div className="flex items-center justify-between gap-3 sm:justify-end"><span className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${color}`}>{order.status}</span>{order.status !== "Terminée" && <button onClick={() => onAdvance(order.id)} className="inline-flex h-8 items-center gap-1 rounded-full bg-[#173f35] px-3 text-[11px] font-extrabold text-[#fffaf0]">{order.status === "À confirmer" ? "Accepter" : order.status === "En cuisine" ? "Prête" : "Terminer"}<Check className="h-3 w-3" /></button>}</div></div>; }
