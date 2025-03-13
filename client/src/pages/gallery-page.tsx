import { useState } from 'react';
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

type ProductCategory = 'all' | 'sorrentinos' | 'ravioles' | 'canelones' | 'salsas';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unitSize: string;
  category: ProductCategory;
  imageUrl: string;
  tags: string[];
}

const Image = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [error, setError] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      style={{ display: error ? 'none' : 'block' }}
    />
  );
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  const products: Product[] = [
    {
      id: 1,
      name: "Sorrentinos de Queso y Jamón",
      description: "Deliciosos sorrentinos con relleno de queso mozzarella, jamón y hierbas.",
      price: 1800,
      unitSize: "12 unid.",
      category: "sorrentinos",
      imageUrl: "/images/sorrentinos-queso-jamon.jpg", //Updated image path
      tags: ["Favorito"]
    },
    {
      id: 2,
      name: "Sorrentinos de Ricota y Espinaca",
      description: "Masa verde rellena de ricota cremosa con espinaca salteada.",
      price: 1700,
      unitSize: "12 unid.",
      category: "sorrentinos",
      imageUrl: "/images/sorrentinos-ricota-espinaca.jpg", //Updated image path
      tags: ["Vegetariano"]
    },
    {
      id: 3,
      name: "Sorrentinos de Calabaza y Queso",
      description: "La combinación perfecta entre el dulzor de la calabaza y el queso cremoso.",
      price: 1650,
      unitSize: "12 unid.",
      category: "sorrentinos",
      imageUrl: "/images/sorrentinos-calabaza-queso.jpg", //Updated image path
      tags: ["Vegetariano"]
    },
    {
      id: 4,
      name: "Ravioles de Carne",
      description: "Ravioles tradicionales rellenos de carne braseada con verduras.",
      price: 1900,
      unitSize: "24 unid.",
      category: "ravioles",
      imageUrl: "/images/ravioles-carne.jpg", //Updated image path
      tags: ["Clásico"]
    },
    {
      id: 5,
      name: "Canelones de Verdura",
      description: "Deliciosos canelones rellenos de espinaca, acelga y queso.",
      price: 2200,
      unitSize: "6 unid.",
      category: "canelones",
      imageUrl: "/images/canelones-verdura.jpg", //Updated image path
      tags: ["Vegetariano"]
    },
    {
      id: 6,
      name: "Salsa Filetto",
      description: "Deliciosa salsa casera de tomates frescos, albahaca y un toque de ajo.",
      price: 950,
      unitSize: "500ml",
      category: "salsas",
      imageUrl: "/images/salsa-filetto.jpg", //Updated image path
      tags: ["Nuevo"]
    },
    {
      id: 7,
      name: "Sorrentinos Cuatro Quesos",
      description: "Combinación exquisita de queso mozzarella, parmesano, provolone y roquefort.",
      price: 1850,
      unitSize: "12 unid.",
      category: "sorrentinos",
      imageUrl: "/images/sorrentinos-cuatro-quesos.jpg", //Updated image path
      tags: ["Vegetariano"]
    },
    {
      id: 8,
      name: "Ravioles de Ricota y Nuez",
      description: "Delicada masa al huevo con relleno de ricota y nueces tostadas.",
      price: 1850,
      unitSize: "24 unid.",
      category: "ravioles",
      imageUrl: "/images/ravioles-ricota-nuez.jpg", //Updated image path
      tags: ["Vegetariano"]
    },
    {
      id: 9,
      name: "Canelones de Pollo",
      description: "Suculentos canelones rellenos de pollo deshebrado con salsa bechamel.",
      price: 2300,
      unitSize: "6 unid.",
      category: "canelones",
      imageUrl: "/images/canelones-pollo.jpg", //Updated image path
      tags: ["Favorito"]
    }
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(product => product.category === activeCategory);

  const getTagStyle = (tag: string) => {
    switch(tag) {
      case 'Vegetariano':
        return 'bg-[#5d6d7c]/10 text-[#5d6d7c]';
      case 'Favorito':
      case 'Nuevo':
      case 'Clásico':
        return 'bg-[#fdd000]/20 text-[#e3a765]';
      default:
        return 'bg-[#e3a765]/10 text-[#e3a765]';
    }
  };

  const handleContactClick = () => {
    window.open("https://wa.me/5491155557890", "_blank");
  };

  return (
    <div className="min-h-screen font-poppins">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Logo className="h-12 w-auto" src="/images/logo.png" alt="Le Unique Logo" /> {/*Updated Logo path*/}
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-6">
              <Link to="/" className="relative text-[#5d6d7c] hover:text-[#e3a765] px-3 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#e3a765] after:transition-all hover:after:w-full">
                Inicio
              </Link>
              <Link to="/about" className="relative text-[#5d6d7c] hover:text-[#e3a765] px-3 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#e3a765] after:transition-all hover:after:w-full">
                Nosotros
              </Link>
              <Link to="/gallery" className="relative text-[#5d6d7c] hover:text-[#e3a765] px-3 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#e3a765]">
                Productos
              </Link>
              <Link to="/contact" className="relative text-[#5d6d7c] hover:text-[#e3a765] px-3 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#e3a765] after:transition-all hover:after:w-full">
                Contacto
              </Link>
              <Link to="/auth" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#e3a765] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3a765] transition-all">
                Acceso
              </Link>
            </div>
            <div className="flex items-center md:hidden">
              <button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-[#5d6d7c] hover:text-[#e3a765] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e3a765]">
                <span className="sr-only">Abrir menú</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Gallery/Products Section */}
      <section className="bg-[#f2efe2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-black font-['Playfair_Display'] mb-4">Nuestros Productos</h2>
            <p className="text-[#5d6d7c] max-w-2xl mx-auto">Descubre nuestra variedad de sorrentinos y pastas congeladas, elaboradas con recetas tradicionales e ingredientes seleccionados.</p>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="flex justify-center flex-wrap gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full ${activeCategory === 'all'
                ? 'text-white bg-[#e3a765] border border-[#e3a765]'
                : 'text-[#e3a765] bg-white border border-[#e3a765] hover:bg-[#e3a765] hover:text-white'}
                transition-all`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveCategory('sorrentinos')}
              className={`px-4 py-2 rounded-full ${activeCategory === 'sorrentinos'
                ? 'text-white bg-[#5d6d7c] border border-[#5d6d7c]'
                : 'text-[#5d6d7c] bg-white border border-[#5d6d7c] hover:bg-[#5d6d7c] hover:text-white'}
                transition-all`}
            >
              Sorrentinos
            </button>
            <button
              onClick={() => setActiveCategory('ravioles')}
              className={`px-4 py-2 rounded-full ${activeCategory === 'ravioles'
                ? 'text-white bg-[#5d6d7c] border border-[#5d6d7c]'
                : 'text-[#5d6d7c] bg-white border border-[#5d6d7c] hover:bg-[#5d6d7c] hover:text-white'}
                transition-all`}
            >
              Ravioles
            </button>
            <button
              onClick={() => setActiveCategory('canelones')}
              className={`px-4 py-2 rounded-full ${activeCategory === 'canelones'
                ? 'text-white bg-[#5d6d7c] border border-[#5d6d7c]'
                : 'text-[#5d6d7c] bg-white border border-[#5d6d7c] hover:bg-[#5d6d7c] hover:text-white'}
                transition-all`}
            >
              Canelones
            </button>
            <button
              onClick={() => setActiveCategory('salsas')}
              className={`px-4 py-2 rounded-full ${activeCategory === 'salsas'
                ? 'text-white bg-[#5d6d7c] border border-[#5d6d7c]'
                : 'text-[#5d6d7c] bg-white border border-[#5d6d7c] hover:bg-[#5d6d7c] hover:text-white'}
                transition-all`}
            >
              Salsas
            </button>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              >
                <div className="overflow-hidden h-48">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                    {product.tags.length > 0 && (
                      <span className={`${getTagStyle(product.tags[0])} px-2 py-1 text-xs font-medium rounded`}>
                        {product.tags[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-[#5d6d7c] text-sm mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#e3a765]">${product.price.toLocaleString()} x {product.unitSize}</span>
                    <button
                      onClick={handleContactClick}
                      className="px-3 py-1 bg-[#e3a765] text-white rounded-md text-sm hover:bg-opacity-90 transition-all"
                    >
                      Consultar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5d6d7c] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <Logo className="h-16 mb-4 bg-white p-2 rounded" src="/images/logo.png" alt="Le Unique Logo" /> {/*Updated Logo path*/}
              <p className="text-white/80 mb-4">Sorrentinos y pastas frescas congeladas, elaboradas con los mejores ingredientes y con todo el sabor de lo hecho en casa.</p>
              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-[#fdd000] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#fdd000] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#fdd000] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#fdd000]">Enlaces rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-white/80 hover:text-white transition-all">Inicio</Link></li>
                <li><Link to="/about" className="text-white/80 hover:text-white transition-all">Nosotros</Link></li>
                <li><Link to="/gallery" className="text-white/80 hover:text-white transition-all">Productos</Link></li>
                <li><Link to="/contact" className="text-white/80 hover:text-white transition-all">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#fdd000]">Productos</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveCategory('sorrentinos')} className="text-white/80 hover:text-white transition-all">Sorrentinos</button></li>
                <li><button onClick={() => setActiveCategory('ravioles')} className="text-white/80 hover:text-white transition-all">Ravioles</button></li>
                <li><button onClick={() => setActiveCategory('canelones')} className="text-white/80 hover:text-white transition-all">Canelones</button></li>
                <li><button onClick={() => setActiveCategory('salsas')} className="text-white/80 hover:text-white transition-all">Salsas</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#fdd000]">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fdd000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a2 2 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/80">+54 11 5555-7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fdd000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/80">info@leunique.com.ar</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fdd000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white/80">Av. Corrientes 1234, CABA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-white/80">&copy; {new Date().getFullYear()} Le Unique. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}