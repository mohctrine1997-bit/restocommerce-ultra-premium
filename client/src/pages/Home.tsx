/**
 * Direction « Le Comptoir Éditorial » : une table de commande mobile-first,
 * des images gourmandes, une navigation latérale discrète et des actions sans détour.
 */
import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Leaf,
  MapPin,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const heroImage = "/manus-storage/restocommerce-hero_f2138370.jpg";
const images = {
  pizza: "/manus-storage/restocommerce-hero_f2138370.jpg",
  pasta: "/manus-storage/restocommerce-pasta_a2da71a9.jpg",
  bowl: "/manus-storage/restocommerce-bowl_40851f5c.jpg",
  dessert: "/manus-storage/restocommerce-dessert_28935327.jpg",
};

const restaurantProfiles: Record<string, { name: string; heroImage: string; heroTitle: string; description: string }> = {
  "la-table-de-lila": { name: "La Table de Lila", heroImage: "/manus-storage/restocommerce-hero_f2138370.jpg", heroTitle: "Le bon dîner commence ici.", description: "Des assiettes généreuses, faites au rythme de la saison. Commandez en quelques gestes, puis échangez directement avec notre équipe." },
  "atelier-levantin": { name: "L’Atelier Levantin", heroImage: "/manus-storage/restocommerce-marketplace-levant_660db242.jpg", heroTitle: "Le Levant arrive à table.", description: "Mezzés à partager, grillades aux épices douces et pains sortis du four. Une cuisine généreuse, faite pour se retrouver." },
  "kanso-handroll": { name: "Kanso Handroll", heroImage: "/manus-storage/restocommerce-marketplace-japanese_d3777592.jpg", heroTitle: "Le geste juste, à emporter.", description: "Handrolls préparés minute, riz assaisonné et produits de la mer choisis avec précision. Une carte courte, tout en fraîcheur." },
  "brunch-club": { name: "Brunch Club", heroImage: "/manus-storage/restocommerce-marketplace-brunch_fbedb3ff.jpg", heroTitle: "Le dimanche, tous les jours.", description: "Œufs, pancakes, pâtisseries et café de spécialité : un brunch à composer sans se presser, même depuis votre canapé." },
  "caffe-vero": { name: "Caffè Vero", heroImage: "/manus-storage/restocommerce-dessert_28935327.jpg", heroTitle: "Une pause qui a du goût.", description: "Café de spécialité, focaccia italienne et douceurs maison. Le comptoir parfait pour une parenthèse à emporter." },
  "maison-tamarin": { name: "Maison Tamarin", heroImage: "/manus-storage/restocommerce-bowl_40851f5c.jpg", heroTitle: "Des épices qui voyagent bien.", description: "Légumes de saison, sauces faites maison et épices torréfiées : une cuisine végétale pleine de relief et de fraîcheur." },
};

const restaurantDetails: Record<string, { address: string; cuisine: string }> = {
  "la-table-de-lila": { address: "36, rue des Dames", cuisine: "Cuisine de saison" },
  "atelier-levantin": { address: "18, rue de Lévis", cuisine: "Mezzés & cuisine levantine" },
  "kanso-handroll": { address: "9, rue de Saussure", cuisine: "Japonais contemporain" },
  "brunch-club": { address: "27, avenue de Villiers", cuisine: "Brunch & pâtisserie" },
  "caffe-vero": { address: "12, rue de Rome", cuisine: "Café & pâtisserie" },
  "maison-tamarin": { address: "41, boulevard Pereire", cuisine: "Cuisine végétale du monde" },
};

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  vegetarian?: boolean;
  available?: boolean;
};

type CartLine = Product & { quantity: number };

const products: Product[] = [
  {
    id: "pizza-truffe",
    name: "Pizza truffe & champignons",
    category: "Les incontournables",
    description: "Crème de parmesan, champignons rôtis, mozzarella fior di latte, huile de truffe.",
    price: 16.9,
    image: images.pizza,
    tag: "Signature",
    available: true,
  },
  {
    id: "linguine-safran",
    name: "Linguine au safran",
    category: "Les incontournables",
    description: "Tomates rôties, basilic frais, citron grillé et copeaux de parmesan.",
    price: 14.5,
    image: images.pasta,
    tag: "Le plus commandé",
    vegetarian: true,
    available: true,
  },
  {
    id: "bowl-du-marche",
    name: "Bowl du marché",
    category: "Fraîcheur du jour",
    description: "Légumes grillés, couscous aux herbes, tahini, pickles et grenade.",
    price: 12.9,
    image: images.bowl,
    vegetarian: true,
    available: true,
  },
  {
    id: "fondant-chocolat",
    name: "Fondant chocolat noir",
    category: "Douceurs",
    description: "Cœur coulant, glace vanille, noisettes torréfiées et caramel ambré.",
    price: 8.5,
    image: images.dessert,
    tag: "Fait minute",
    available: true,
  },
  {
    id: "focaccia",
    name: "Focaccia aux herbes",
    category: "À partager",
    description: "Huile d’olive, romarin, olives de Kalamata et fleur de sel.",
    price: 6.9,
    image: images.pasta,
    vegetarian: true,
    available: true,
  },
  {
    id: "tiramisu",
    name: "Tiramisu de saison",
    category: "Douceurs",
    description: "Mascarpone léger, café de spécialité et cacao intense.",
    price: 7.5,
    image: images.dessert,
    available: true,
  },
];

const categories = ["Tous les plats", "Les incontournables", "Fraîcheur du jour", "À partager", "Douceurs"];
const formatPrice = (price: number) => `${price.toFixed(2).replace(".", ",")} €`;

export default function Home() {
  const [, routeParams] = useRoute("/restaurant/:slug");
  const restaurantSlug = routeParams?.slug ?? "la-table-de-lila";
  const restaurantProfile = restaurantProfiles[restaurantSlug] ?? restaurantProfiles["la-table-de-lila"];
  const restaurantDetail = restaurantDetails[restaurantSlug] ?? restaurantDetails["la-table-de-lila"];
  const restaurantName = restaurantProfile.name;
  const [activeCategory, setActiveCategory] = useState("Tous les plats");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleProducts = useMemo(
    () =>
      activeCategory === "Tous les plats"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  const changeQuantity = (id: string, nextQuantity: number) => {
    setCart((current) =>
      nextQuantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity: nextQuantity } : line))
    );
  };

  const orderOnWhatsapp = () => {
    if (!cart.length) {
      toast.error("Ajoutez au moins un plat avant de commander.");
      return;
    }
    const items = cart
      .map((line) => `• ${line.quantity} × ${line.name} — ${formatPrice(line.price * line.quantity)}`)
      .join("%0A");
    const message = `Bonjour La Table de Lila,%0A%0AJe souhaite commander :%0A${items}%0A%0ASous-total estimé : ${formatPrice(subtotal)}%0A%0ANom : %0ATéléphone : %0AAdresse ou retrait : %0A%0AMerci.`;
    window.open(`https://wa.me/33600000000?text=${encodeURIComponent(decodeURIComponent(message))}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3eb] text-[#173f35]">
      <header className="sticky top-0 z-40 border-b border-[#173f35]/10 bg-[#f7f3eb]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil RestoCommerce">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fffaf0] shadow-[0_6px_16px_rgba(23,63,53,0.12)] ring-1 ring-[#173f35]/15"><img src="/manus-storage/restocommerce-mark_498ac4bb.png" alt="" className="h-10 w-10 rounded-full" /></span>
            <span className="font-display text-[1.35rem] leading-none tracking-[-0.04em]">{restaurantName}</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#173f35]/75 md:flex">
            <Link href="/" className="transition-colors hover:text-[#b85f42]">Tous les restaurants</Link>
            <a href="#menu" className="transition-colors hover:text-[#b85f42]">Le menu</a>
            <a href="#infos" className="transition-colors hover:text-[#b85f42]">Le restaurant</a>
            <Link href="/dashboard" className="transition-colors hover:text-[#b85f42]">Espace restaurateur</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-[#173f35] px-4 text-sm font-bold text-[#fffaf0] shadow-[0_8px_22px_rgba(23,63,53,0.18)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
              aria-label={`Ouvrir le panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mon panier</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#173f35] bg-[#d77757] px-1 text-[11px] text-white">{cartCount}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#173f35]/15 md:hidden"
              aria-label="Ouvrir la navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[#173f35]/10 bg-[#f7f3eb] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <Link href="/">Tous les restaurants</Link>
              <a onClick={() => setMobileMenuOpen(false)} href="#menu">Le menu</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#infos">Le restaurant</a>
              <Link href="/dashboard">Espace restaurateur</Link>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative isolate overflow-hidden bg-[#173f35]">
        <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${restaurantProfile.heroImage})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,38,32,0.95)_0%,rgba(12,38,32,0.84)_45%,rgba(12,38,32,0.16)_100%)]" />
        <span aria-hidden="true" className="service-trace absolute right-[11%] top-[18%] hidden rotate-[18deg] text-[#e98d69] opacity-90 lg:block" />
        <div className="relative mx-auto grid min-h-[580px] max-w-[1500px] items-end px-4 pb-12 pt-24 sm:px-8 lg:grid-cols-12 lg:px-12 lg:pb-16">
          <div className="max-w-2xl lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#fffaf0]/25 bg-[#fffaf0]/10 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#fffaf0] uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e98d69]" /> Ouvert aujourd’hui · jusqu’à 23:00
            </div>
            <h1 className="font-display max-w-[700px] text-[clamp(3.4rem,7vw,7rem)] leading-[0.88] tracking-[-0.055em] text-[#fffaf0]">
              {restaurantProfile.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#fffaf0]/78 sm:text-lg">
              {restaurantProfile.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#menu" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#fffaf0] px-5 text-sm font-bold text-[#173f35] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]">
                Ouvrir la carte <ArrowRight className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-2 px-2 text-sm font-semibold text-[#fffaf0]/90"><Clock3 className="h-4 w-4" /> Préparation moyenne : 20 min</span>
            </div>
          </div>
          <div className="mt-12 flex items-center gap-8 border-t border-[#fffaf0]/20 pt-5 text-sm text-[#fffaf0]/85 lg:col-start-10 lg:col-span-3 lg:mt-0 lg:border-t-0 lg:pt-0">
            <div><span className="block font-display text-3xl text-[#fffaf0]">4.9</span><span className="text-xs">Cuisine de quartier</span></div>
            <div className="h-9 w-px bg-[#fffaf0]/25" />
            <div><span className="block font-display text-3xl text-[#fffaf0]">12h</span><span className="text-xs">Ouverture du jour</span></div>
          </div>
        </div>
      </section>

      <section id="infos" className="border-b border-[#173f35]/10 bg-[#f7f3eb]">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:grid-cols-3 sm:px-8 lg:px-12">
          <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f42]" /><p className="text-sm leading-5"><strong className="block">{restaurantDetail.address}</strong><span className="text-[#173f35]/65">Paris 17e · Retrait et livraison proche</span></p></div>
          <div className="flex items-start gap-3"><UtensilsCrossed className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f42]" /><p className="text-sm leading-5"><strong className="block">{restaurantDetail.cuisine}</strong><span className="text-[#173f35]/65">Produits soigneusement choisis, tous les jours.</span></p></div>
          <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f42]" /><p className="text-sm leading-5"><strong className="block">Commande simplifiée</strong><span className="text-[#173f35]/65">Panier rapide, confirmation directe sur WhatsApp.</span></p></div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-[1500px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 grid gap-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="text-xs font-extrabold tracking-[0.16em] text-[#b85f42] uppercase">À la carte</span>
            <h2 className="font-display mt-3 text-5xl tracking-[-0.05em] sm:text-6xl">Le menu du comptoir.</h2>
          </div>
          <div className="max-w-md lg:col-span-4 lg:col-start-9"><p className="text-sm leading-6 text-[#173f35]/65">Choisissez un plat, ajustez vos envies dans le quick view, et gardez votre commande à portée de main.</p><span aria-hidden="true" className="service-trace mt-3 text-[#d77757]" /></div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-left text-sm font-bold transition-all duration-200 lg:w-full lg:rounded-lg ${activeCategory === category ? "bg-[#173f35] text-[#fffaf0] shadow-[0_8px_18px_rgba(23,63,53,0.14)]" : "bg-transparent text-[#173f35]/68 hover:bg-[#eadfcd] hover:text-[#173f35]"}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-8 hidden rounded-2xl border border-[#173f35]/10 bg-[#efe6d8] p-5 lg:block">
              <Leaf className="h-5 w-5 text-[#b85f42]" />
              <p className="mt-3 text-sm font-bold">Des détails qui comptent.</p>
              <p className="mt-1 text-xs leading-5 text-[#173f35]/65">Les options végétariennes et la disponibilité des plats sont visibles avant de commander.</p>
            </div>
          </aside>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group relative border-t border-[#173f35]/14 pt-5 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0 xl:[&:nth-child(3)]:border-t-0 xl:[&:nth-child(3)]:pt-0">
                <button onClick={() => setQuickProduct(product)} className="block w-full overflow-hidden rounded-[1.35rem] bg-[#e6d8c4] text-left focus:outline-none focus:ring-2 focus:ring-[#b85f42] focus:ring-offset-4 focus:ring-offset-[#f7f3eb]">
                  <div className="relative aspect-[1.08/0.85] overflow-hidden">
                    <img src={product.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#173f35]/25 via-transparent to-transparent" />
                    {product.tag && <span className="absolute left-3 top-3 rounded-full bg-[#fffaf0] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-[#173f35] uppercase">{product.tag}</span>}
                    {product.vegetarian && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#173f35]/85 px-2.5 py-1 text-[10px] font-bold text-[#fffaf0]"><Leaf className="h-3 w-3" /> Végétarien</span>}
                  </div>
                </button>
                <div className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <button onClick={() => setQuickProduct(product)} className="font-display text-2xl leading-6 tracking-[-0.035em] text-left hover:text-[#b85f42]"><span className="mb-1.5 block text-[9px] font-sans font-extrabold tracking-[0.14em] text-[#b85f42] uppercase">Feuille du chef</span>{product.name}</button>
                    <span className="shrink-0 text-sm font-extrabold tabular-nums">{formatPrice(product.price)}</span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-[#173f35]/63">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => setQuickProduct(product)} className="inline-flex items-center gap-1 text-xs font-bold text-[#173f35]/70 transition-colors hover:text-[#b85f42]">Voir le plat <ChevronDown className="h-3.5 w-3.5 -rotate-90" /></button>
                    <button onClick={() => addToCart(product)} className="grid h-10 w-10 place-items-center rounded-full border-4 border-[#dcecdf] bg-[#173f35] text-[#fffaf0] shadow-[0_5px_13px_rgba(23,63,53,0.18)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]" aria-label={`Ajouter ${product.name} au comptoir`}><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-20 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#d77757] px-7 py-12 text-[#fffaf0] sm:px-12 sm:py-14">
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[32px] border-[#fffaf0]/12" />
          <span aria-hidden="true" className="service-trace absolute bottom-8 right-[31%] hidden rotate-[-14deg] text-[#fffaf0]/65 sm:block" />
          <div className="relative grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8"><span className="text-xs font-extrabold tracking-[0.15em] uppercase">Retrait ou livraison</span><h2 className="font-display mt-3 max-w-xl text-5xl leading-[0.9] tracking-[-0.05em] sm:text-6xl">Votre table préférée, prête à emporter.</h2></div>
            <div className="lg:col-span-3 lg:col-start-10"><button onClick={() => setCartOpen(true)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#fffaf0] px-5 text-sm font-bold text-[#173f35] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]">Préparer ma commande <ShoppingBag className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#173f35]/10 px-4 py-8 text-xs text-[#173f35]/58 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span>La Table de Lila — menu démo pour RestoCommerce.</span><span>Une commande directe, sans formulaire interminable.</span></div>
      </footer>

      <Dialog open={Boolean(quickProduct)} onOpenChange={(open) => !open && setQuickProduct(null)}>
        {quickProduct && (
          <DialogContent className="max-w-[760px] overflow-hidden border-0 bg-[#f7f3eb] p-0 text-[#173f35] sm:max-w-[760px]">
            <div className="grid sm:grid-cols-[1fr_1.05fr]">
              <div className="relative min-h-[280px] sm:min-h-full"><img src={quickProduct.image} alt="" className="absolute inset-0 h-full w-full object-cover" /></div>
              <div className="p-7 sm:p-9">
                <DialogHeader className="text-left"><DialogDescription className="text-xs font-extrabold tracking-[0.14em] text-[#b85f42] uppercase">{quickProduct.category}</DialogDescription><DialogTitle className="font-display text-4xl leading-none tracking-[-0.05em]">{quickProduct.name}</DialogTitle></DialogHeader>
                <p className="mt-5 text-sm leading-6 text-[#173f35]/68">{quickProduct.description}</p>
                <div className="mt-7 rounded-2xl bg-[#eadfcd] p-4"><p className="text-xs font-extrabold tracking-[0.12em] uppercase">Personnalisez</p><label className="mt-3 flex items-center justify-between text-sm font-semibold"><span>Ajouter du parmesan affiné</span><span>+ 1,50 €</span></label><label className="mt-3 flex items-center justify-between text-sm font-semibold"><span>Sans oignons</span><input type="checkbox" className="h-4 w-4 accent-[#173f35]" /></label></div>
                <div className="mt-7 flex items-center justify-between gap-3"><span className="font-display text-3xl">{formatPrice(quickProduct.price)}</span><button onClick={() => { addToCart(quickProduct); setQuickProduct(null); setCartOpen(true); }} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#173f35] px-5 text-sm font-bold text-[#fffaf0] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]">Ajouter au comptoir <Plus className="h-4 w-4" /></button></div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full border-0 bg-[#f7f3eb] p-0 text-[#173f35] sm:max-w-[450px]">
          <SheetHeader className="border-b border-[#173f35]/10 p-7 pr-14"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full border-4 border-[#dcecdf] bg-[#173f35] text-[#fffaf0] shadow-[0_7px_18px_rgba(23,63,53,0.18)]"><ShoppingBag className="h-4 w-4" /></span><div><SheetTitle className="font-display text-3xl tracking-[-0.04em]">Votre comptoir</SheetTitle><SheetDescription>{cartCount ? `${cartCount} article${cartCount > 1 ? "s" : ""} prêt${cartCount > 1 ? "s" : ""} à commander` : "Le panier est encore vide."}</SheetDescription></div></div></SheetHeader>
          <div className="flex-1 overflow-y-auto p-7">
            {cart.length === 0 ? <div className="py-16 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-[#b85f42]" /><p className="mt-4 font-display text-3xl">À votre appétit.</p><p className="mt-2 text-sm text-[#173f35]/62">Ajoutez un plat depuis le menu pour commencer.</p></div> : <div className="space-y-5">{cart.map((line) => <div key={line.id} className="flex gap-4"><img src={line.image} alt="" className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="font-display text-xl leading-5 tracking-[-0.03em]">{line.name}</p><span className="shrink-0 text-sm font-bold">{formatPrice(line.price * line.quantity)}</span></div><div className="mt-3 inline-flex items-center rounded-full border border-[#173f35]/14 bg-white/40 p-1"><button onClick={() => changeQuantity(line.id, line.quantity - 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-[#eadfcd]" aria-label={`Retirer une portion de ${line.name}`}><Minus className="h-3 w-3" /></button><span className="w-7 text-center text-xs font-bold tabular-nums">{line.quantity}</span><button onClick={() => changeQuantity(line.id, line.quantity + 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-[#eadfcd]" aria-label={`Ajouter une portion de ${line.name}`}><Plus className="h-3 w-3" /></button></div></div></div>)}</div>}
          </div>
          <SheetFooter className="border-t border-[#173f35]/10 bg-[#efe6d8] p-7"><div className="flex items-end justify-between"><span className="text-sm font-bold">Sous-total estimé</span><span className="font-display text-3xl tracking-[-0.04em]">{formatPrice(subtotal)}</span></div><p className="text-xs leading-5 text-[#173f35]/62">La commande sera récapitulée dans WhatsApp. Vous confirmerez ensuite avec le restaurant.</p><button onClick={orderOnWhatsapp} disabled={!cart.length} className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 text-sm font-bold text-[#fffaf0] transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]">Envoyer au restaurant <ArrowRight className="h-4 w-4" /></button></SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
