/**
 * Direction « Le Comptoir Éditorial » : la marketplace est un marché curaté,
 * pas une grille anonyme. Les filtres sont instantanés et les maisons restent singulières.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Clock3, MapPin, Search, SlidersHorizontal, Sparkles, Store, X } from "lucide-react";

type Restaurant = {
  name: string;
  slug: string;
  cuisine: string;
  area: string;
  prep: string;
  open: boolean;
  image: string;
  note: string;
  accent: string;
};

const restaurants: Restaurant[] = [
  { name: "La Table de Lila", slug: "la-table-de-lila", cuisine: "Italienne contemporaine", area: "Batignolles", prep: "20–30 min", open: true, image: "/manus-storage/restocommerce-pasta_a2da71a9.jpg", note: "Pâtes fraîches, pizza au feu et douceurs maison.", accent: "#d77757" },
  { name: "L’Atelier Levantin", slug: "atelier-levantin", cuisine: "Levantine", area: "Ternes", prep: "25–35 min", open: true, image: "/manus-storage/restocommerce-marketplace-levant_660db242.jpg", note: "Mezzés à partager, grillades et pains tout juste cuits.", accent: "#b8964b" },
  { name: "Kanso Handroll", slug: "kanso-handroll", cuisine: "Japonais", area: "Villiers", prep: "30–40 min", open: true, image: "/manus-storage/restocommerce-marketplace-japanese_d3777592.jpg", note: "Handrolls minute, poissons soigneusement sourcés.", accent: "#5f8290" },
  { name: "Brunch Club", slug: "brunch-club", cuisine: "Brunch", area: "Monceau", prep: "15–25 min", open: false, image: "/manus-storage/restocommerce-marketplace-brunch_fbedb3ff.jpg", note: "Petit-déjeuner tardif, bowls et pâtisseries du week-end.", accent: "#d77757" },
  { name: "Caffè Vero", slug: "caffe-vero", cuisine: "Café & pâtisserie", area: "Rome", prep: "15–20 min", open: true, image: "/manus-storage/restocommerce-dessert_28935327.jpg", note: "Café de spécialité, focaccia et desserts italiens.", accent: "#6b9980" },
  { name: "Maison Tamarin", slug: "maison-tamarin", cuisine: "Cuisine du monde", area: "Pereire", prep: "25–35 min", open: true, image: "/manus-storage/restocommerce-bowl_40851f5c.jpg", note: "Assiettes végétales, épices torréfiées et sauces maison.", accent: "#b85f42" },
];

const cuisines = ["Toutes les cuisines", "Italienne contemporaine", "Levantine", "Japonais", "Brunch", "Café & pâtisserie", "Cuisine du monde"];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("Toutes les cuisines");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const visibleRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");
    return restaurants.filter((restaurant) => {
      const matchesSearch = !normalizedSearch || [restaurant.name, restaurant.cuisine, restaurant.area, restaurant.note].join(" ").toLocaleLowerCase("fr").includes(normalizedSearch);
      const matchesCuisine = activeCuisine === "Toutes les cuisines" || restaurant.cuisine === activeCuisine;
      return matchesSearch && matchesCuisine && (!onlyOpen || restaurant.open);
    });
  }, [search, activeCuisine, onlyOpen]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3eb] text-[#173f35]">
      <header className="sticky top-0 z-40 border-b border-[#173f35]/10 bg-[#f7f3eb]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="RestoCommerce, accueil"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#fffaf0] shadow-[0_6px_16px_rgba(23,63,53,0.12)] ring-1 ring-[#173f35]/15"><img src="/manus-storage/restocommerce-mark_498ac4bb.png" alt="" className="h-10 w-10 rounded-full" /></span><span><span className="font-display block text-[1.4rem] leading-none tracking-[-0.045em]">RestoCommerce</span><span className="mt-1 block text-[9px] font-extrabold tracking-[0.14em] text-[#b85f42] uppercase">Les tables du quartier</span></span></Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-[#173f35]/72 md:flex"><a href="#restaurants" className="hover:text-[#b85f42]">Explorer</a><a href="#comment-ca-marche" className="hover:text-[#b85f42]">Comment ça marche</a><Link href="/dashboard" className="hover:text-[#b85f42]">Espace restaurateur</Link></nav>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#173f35] px-4 py-2.5 text-xs font-extrabold text-[#fffaf0]"><MapPin className="h-3.5 w-3.5" /> Paris 17e</span>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#173f35]/10 bg-[#efe6d8]">
        <div className="marketplace-orbit absolute -right-24 -top-24 h-80 w-80 rounded-full border-[38px] border-[#d77757]/20" />
        <div className="marketplace-orbit absolute bottom-[-132px] left-[33%] h-72 w-72 rounded-full border-[31px] border-[#173f35]/8" />
        <div className="relative mx-auto grid max-w-[1500px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12 lg:py-24">
          <div className="lg:col-span-8"><p className="text-xs font-extrabold tracking-[0.16em] text-[#b85f42] uppercase">Votre quartier, à votre table</p><h1 className="font-display mt-4 max-w-4xl text-[clamp(3.8rem,8vw,8.2rem)] leading-[0.83] tracking-[-0.065em]">Ce soir, le quartier vous régale.</h1><p className="mt-7 max-w-xl text-base leading-7 text-[#173f35]/68 sm:text-lg">Découvrez des restaurants indépendants, leur carte et leur disponibilité. Une commande directe, avec une confirmation humaine quand cela compte.</p><div className="mt-8 flex items-center gap-4"><div className="relative h-20 w-28 overflow-hidden rounded-[1.3rem] border-4 border-[#fffaf0] shadow-[0_12px_26px_rgba(23,63,53,0.14)]"><img src="/manus-storage/restocommerce-hero_f2138370.jpg" alt="Une pizza artisanale servie à table" className="h-full w-full object-cover" fetchPriority="high" /></div><div><span className="text-xs font-extrabold tracking-[0.12em] text-[#b85f42] uppercase">Une sélection prête à savourer</span><p className="mt-1 text-sm font-semibold text-[#173f35]/72">De la première envie à la bonne adresse.</p></div></div></div>
          <div className="lg:col-span-3 lg:col-start-10"><div className="rounded-[1.5rem] bg-[#173f35] p-6 text-[#fffaf0] shadow-[0_18px_42px_rgba(23,63,53,0.18)]"><Sparkles className="h-5 w-5 text-[#e98d69]" /><p className="font-display mt-8 text-3xl leading-[0.95] tracking-[-0.045em]">Pas un annuaire. Une sélection locale.</p><span aria-hidden="true" className="service-trace mt-6 text-[#e98d69]" /></div></div>
        </div>
      </section>

      <section id="restaurants" className="mx-auto max-w-[1500px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-6 border-b border-[#173f35]/10 pb-8 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-6"><p className="text-xs font-extrabold tracking-[0.16em] text-[#b85f42] uppercase">À proximité</p><h2 className="font-display mt-3 text-5xl tracking-[-0.055em] sm:text-6xl">Choisissez votre table.</h2></div><div className="lg:col-span-5 lg:col-start-8"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#173f35]/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Une cuisine, un restaurant, un quartier…" className="h-12 w-full rounded-full border border-[#173f35]/14 bg-[#fffaf0] pl-11 pr-11 text-sm font-semibold outline-none transition-shadow placeholder:text-[#173f35]/42 focus:shadow-[0_0_0_4px_rgba(215,119,87,0.18)]" aria-label="Rechercher un restaurant" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full hover:bg-[#eadfcd]" aria-label="Effacer la recherche"><X className="h-4 w-4" /></button>}</div></div></div>

        <div className="mt-6 flex flex-wrap items-center gap-2"><span className="mr-1 inline-flex items-center gap-2 text-xs font-extrabold text-[#173f35]/55"><SlidersHorizontal className="h-3.5 w-3.5" /> Filtres</span>{cuisines.map((cuisine) => <button key={cuisine} onClick={() => setActiveCuisine(cuisine)} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-colors ${activeCuisine === cuisine ? "bg-[#173f35] text-[#fffaf0]" : "bg-[#eadfcd] text-[#173f35]/70 hover:bg-[#dcd0bf]"}`}>{cuisine === "Toutes les cuisines" ? "Toutes" : cuisine}</button>)}<button onClick={() => setOnlyOpen((current) => !current)} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-colors ${onlyOpen ? "bg-[#d77757] text-white" : "bg-[#eadfcd] text-[#173f35]/70 hover:bg-[#dcd0bf]"}`}><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${onlyOpen ? "bg-white" : "bg-[#6b9980]"}`} />Ouverts maintenant</button></div>

        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-[#173f35]/62"><strong className="text-[#173f35]">{visibleRestaurants.length}</strong> restaurant{visibleRestaurants.length > 1 ? "s" : ""} {onlyOpen ? "ouvert" + (visibleRestaurants.length > 1 ? "s" : "") : "dans la sélection"}</p><span aria-hidden="true" className="service-trace hidden text-[#d77757] sm:block" /></div>

        {visibleRestaurants.length ? <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">{visibleRestaurants.map((restaurant) => <article key={restaurant.slug} className="group border-t border-[#173f35]/14 pt-5"><Link href={`/restaurant/${restaurant.slug}`} className="block overflow-hidden rounded-[1.5rem] bg-[#e6d8c4] focus:outline-none focus:ring-2 focus:ring-[#b85f42] focus:ring-offset-4 focus:ring-offset-[#f7f3eb]"><div className="relative aspect-[1.23/0.87] overflow-hidden"><img src={restaurant.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-[#173f35]/42 via-transparent to-transparent" /><div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[#fffaf0] px-2.5 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-[#173f35] uppercase"><span className={`h-1.5 w-1.5 rounded-full ${restaurant.open ? "bg-[#4f9868]" : "bg-[#d77757]"}`} />{restaurant.open ? "Ouvert" : "Ouvre demain"}</div><span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-white uppercase" style={{ backgroundColor: restaurant.accent }}>{restaurant.area}</span></div></Link><div className="pt-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[0.13em] text-[#b85f42] uppercase">{restaurant.cuisine}</p><h3 className="font-display mt-1 text-3xl leading-7 tracking-[-0.045em]">{restaurant.name}</h3></div><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 border-[#dcecdf] bg-[#173f35] text-[#fffaf0] shadow-[0_5px_13px_rgba(23,63,53,0.18)] transition-transform group-hover:-translate-y-0.5"><ArrowRight className="h-4 w-4" /></span></div><p className="mt-2 min-h-10 text-sm leading-5 text-[#173f35]/64">{restaurant.note}</p><div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#173f35]/60"><Clock3 className="h-3.5 w-3.5 text-[#b85f42]" />Préparation estimée : {restaurant.prep}</div></div></article>)}</div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#173f35]/20 bg-[#fffaf0] px-6 py-16 text-center"><Store className="mx-auto h-7 w-7 text-[#b85f42]" /><h3 className="font-display mt-4 text-3xl tracking-[-0.04em]">Aucune table ne correspond à cette recherche.</h3><p className="mt-2 text-sm text-[#173f35]/62">Essayez une autre cuisine ou retirez un filtre.</p><button onClick={() => { setSearch(""); setActiveCuisine("Toutes les cuisines"); setOnlyOpen(false); }} className="mt-5 rounded-full bg-[#173f35] px-4 py-2.5 text-xs font-extrabold text-[#fffaf0]">Réinitialiser les filtres</button></div>}
      </section>

      <section id="comment-ca-marche" className="border-y border-[#173f35]/10 bg-[#fffaf0]"><div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20"><div className="lg:col-span-5"><p className="text-xs font-extrabold tracking-[0.16em] text-[#b85f42] uppercase">En trois temps</p><h2 className="font-display mt-3 text-5xl leading-[0.9] tracking-[-0.055em]">De la bonne adresse à la bonne commande.</h2><span aria-hidden="true" className="service-trace mt-6 text-[#d77757]" /></div><div className="grid gap-5 sm:grid-cols-3 lg:col-span-6 lg:col-start-7"><Step number="01" title="Choisissez" text="Une maison selon votre envie, son menu et sa disponibilité." /><Step number="02" title="Composez" text="Ajoutez vos plats et ajustez les options depuis le menu." /><Step number="03" title="Confirmez" text="Le restaurant reçoit un récapitulatif clair sur WhatsApp." /></div></div></section>

      <footer className="px-4 py-8 text-xs text-[#173f35]/58 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:justify-between"><span>RestoCommerce — aperçu marketplace.</span><span>Des restaurants indépendants, une expérience cohérente.</span></div></footer>
    </main>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="border-t border-[#173f35]/14 pt-4"><span className="text-xs font-extrabold text-[#d77757]">{number}</span><h3 className="font-display mt-4 text-3xl tracking-[-0.04em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#173f35]/62">{text}</p></article>;
}
