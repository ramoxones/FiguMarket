<?php

namespace App\DataFixtures;

use App\Entity\Usuario;
use App\Entity\Noticia;
use App\Entity\Figura;
use App\Entity\Imagen;
use App\Entity\Mensaje;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $usuarios = [];

        $usuariosData = [
            ['nombre' => 'Ana Pérez', 'email' => 'ana@example.com', 'contrasena' => 'ana123', 'rol' => 'usuario', 'foto' => 'https://i.pravatar.cc/150?img=1'],
            ['nombre' => 'Bruno Díaz', 'email' => 'bruno@example.com', 'contrasena' => 'bruno123', 'rol' => 'usuario', 'foto' => 'https://i.pravatar.cc/150?img=2'],
            ['nombre' => 'Carla Gómez', 'email' => 'carla@example.com', 'contrasena' => 'carla123', 'rol' => 'usuario', 'foto' => null],
            ['nombre' => 'Diego López', 'email' => 'diego@example.com', 'contrasena' => 'diego123', 'rol' => 'usuario', 'foto' => null],
            ['nombre' => 'Admin Figu', 'email' => 'admin@example.com', 'contrasena' => 'admin123', 'rol' => 'admin', 'foto' => 'https://i.pravatar.cc/150?img=5'],
        ];

        // Evitar duplicados de usuarios si ya existen (por email)
        $usuarioRepo = $manager->getRepository(Usuario::class);
        foreach ($usuariosData as $data) {
            $existing = $usuarioRepo->findOneBy(['email' => $data['email']]);
            if ($existing) {
                $usuarios[] = $existing;
                continue;
            }

            $u = new Usuario();
            $u->setNombre($data['nombre'])
              ->setEmail($data['email'])
              ->setContrasena(password_hash($data['contrasena'], PASSWORD_DEFAULT))
              ->setRol($data['rol'])
              ->setFotoPerfil($data['foto']);
            $manager->persist($u);
            $usuarios[] = $u;
        }

        $figuras = [];
        $figurasData = [
            ['usuario' => 0, 'nombre' => 'Goku Super Saiyan', 'descripcion' => 'Figura de Dragon Ball Z de alta calidad.', 'categoria' => 'anime', 'escala' => '1:6', 'estado' => 'disponible', 'precio' => '129.99', 'imagenes' => ['https://picsum.photos/seed/goku1/800/600','https://picsum.photos/seed/goku2/800/600']],
            ['usuario' => 1, 'nombre' => 'Batman Arkham', 'descripcion' => 'Figura de Batman de la serie Arkham.', 'categoria' => 'comics', 'escala' => '1:7', 'estado' => 'disponible', 'precio' => '89.90', 'imagenes' => ['https://picsum.photos/seed/batman1/800/600']],
            ['usuario' => 2, 'nombre' => 'Naruto Shippuden', 'descripcion' => 'Figura coleccionable de Naruto.', 'categoria' => 'anime', 'escala' => '1:8', 'estado' => 'disponible', 'precio' => '74.50', 'imagenes' => ['https://picsum.photos/seed/naruto1/800/600','https://picsum.photos/seed/naruto2/800/600','https://picsum.photos/seed/naruto3/800/600']],
            ['usuario' => 0, 'nombre' => 'Iron Man Mk50', 'descripcion' => 'Figura de Iron Man con detalles metálicos.', 'categoria' => 'comics', 'escala' => '1:10', 'estado' => 'disponible', 'precio' => '149.00', 'imagenes' => ['https://picsum.photos/seed/iron1/800/600']],
            ['usuario' => 3, 'nombre' => 'Link Breath of the Wild', 'descripcion' => 'Figura de Link BOTW.', 'categoria' => 'videojuegos', 'escala' => '1:9', 'estado' => 'en negociación', 'precio' => '68.00', 'imagenes' => ['https://picsum.photos/seed/link1/800/600']],
            ['usuario' => 1, 'nombre' => 'Spiderman Homecoming', 'descripcion' => 'Figura de Spiderman con traje clásico.', 'categoria' => 'comics', 'escala' => '1:6', 'estado' => 'disponible', 'precio' => '120.00', 'imagenes' => ['https://picsum.photos/seed/spidey1/800/600','https://picsum.photos/seed/spidey2/800/600']],
            ['usuario' => 2, 'nombre' => 'Sasuke Uchiha', 'descripcion' => 'Figura de Sasuke con Chidori.', 'categoria' => 'anime', 'escala' => '1:7', 'estado' => 'disponible', 'precio' => '82.75', 'imagenes' => ['https://picsum.photos/seed/sasuke1/800/600']],
            ['usuario' => 3, 'nombre' => 'Zelda BOTW', 'descripcion' => 'Figura de Zelda edición limitada.', 'categoria' => 'videojuegos', 'escala' => '1:8', 'estado' => 'disponible', 'precio' => '95.00', 'imagenes' => ['https://picsum.photos/seed/zelda1/800/600']],
            ['usuario' => 0, 'nombre' => 'Vegeta Blue', 'descripcion' => 'Figura de Vegeta en SSB.', 'categoria' => 'anime', 'escala' => '1:6', 'estado' => 'disponible', 'precio' => '110.00', 'imagenes' => ['https://picsum.photos/seed/vegeta1/800/600']],
            ['usuario' => 1, 'nombre' => 'Joker Classic', 'descripcion' => 'Figura del Joker edición coleccionista.', 'categoria' => 'comics', 'escala' => '1:7', 'estado' => 'en negociación', 'precio' => '70.00', 'imagenes' => ['https://picsum.photos/seed/joker1/800/600']],
        ];

        foreach ($figurasData as $index => $data) {
            $f = new Figura();
            $f->setUsuario($usuarios[$data['usuario']])
              ->setNombre($data['nombre'])
              ->setDescripcion($data['descripcion'])
              ->setCategoria($data['categoria'])
              ->setEscala($data['escala'])
              ->setEstado($data['estado'])
              ->setEstadoFigura('en buen estado')
              ->setPrecio($data['precio'])
              ->setDestacado(in_array($index, [0,2,5]));
            foreach ($data['imagenes'] as $u) {
                $img = new Imagen();
                $img->setUrl($u);
                $f->addImagen($img);
                $manager->persist($img);
            }
            $manager->persist($f);
            $figuras[] = $f;
        }

        // Generar más figuras para dataset grande
        $categorias = ['anime', 'comics', 'videojuegos'];
        $escalas = ['1:6', '1:7', '1:8', '1:9', '1:10'];
        $estados = ['disponible', 'en negociación', 'vendido'];
        $estadosFigura = ['sin abrir','como nueva','en buen estado','en mal estado'];
        for ($i = 1; $i <= 40; $i++) {
            $f = new Figura();
            $uIndex = $i % count($usuarios);
            $categoria = $categorias[$i % count($categorias)];
            $escala = $escalas[$i % count($escalas)];
            $estado = $estados[$i % count($estados)];
            $precio = number_format(50 + ($i * 2.5) % 120, 2, '.', '');
            $nombre = sprintf('Figura #%d %s %s', $i, ucfirst($categoria), $escala);
            $descripcion = sprintf('Figura de colección generada para pruebas (%s, %s).', $categoria, $escala);

            $f->setUsuario($usuarios[$uIndex])
              ->setNombre($nombre)
              ->setDescripcion($descripcion)
              ->setCategoria($categoria)
              ->setEscala($escala)
              ->setEstado($estado)
              ->setEstadoFigura($estadosFigura[$i % count($estadosFigura)])
              ->setPrecio($precio)
              ->setDestacado(($i % 10) === 0);

            // Añadir 1-3 imágenes
            $imgs = rand(1, 3);
            for ($j = 1; $j <= $imgs; $j++) {
                $img = new Imagen();
                $img->setUrl("https://picsum.photos/seed/figu{$i}_{$j}/800/600");
                $f->addImagen($img);
                $manager->persist($img);
            }

            // Disponibilidad/estado aleatoria
            if ($i % 7 === 0) { $f->setDisponible(false)->setEstado('en negociación'); }

            $manager->persist($f);
            $figuras[] = $f;
        }

        // Generación adicional con Faker para tener un dataset grande
        $faker = FakerFactory::create('es_ES');
        $extraCount = 150; // Añadimos ~150 figuras extra
        for ($k = 1; $k <= $extraCount; $k++) {
            $f = new Figura();
            $uIndex = $faker->numberBetween(0, count($usuarios) - 1);
            $categoria = $categorias[$faker->numberBetween(0, count($categorias) - 1)];
            $escala = $escalas[$faker->numberBetween(0, count($escalas) - 1)];
            $estado = $estados[$faker->numberBetween(0, count($estados) - 1)];
            $precio = number_format($faker->randomFloat(2, 25, 250), 2, '.', '');
            $nombre = $faker->words(2, true);
            $descripcion = $faker->sentence(12);

            $f->setUsuario($usuarios[$uIndex])
              ->setNombre($nombre)
              ->setDescripcion($descripcion)
              ->setCategoria($categoria)
              ->setEscala($escala)
              ->setEstado($estado)
              ->setEstadoFigura($estadosFigura[$faker->numberBetween(0, count($estadosFigura) - 1)])
              ->setPrecio($precio)
              ->setDisponible(true)
              ->setDestacado($faker->numberBetween(1, 20) === 1);

            // Añadir 1-3 imágenes aleatorias
            $imgs = $faker->numberBetween(1, 3);
            for ($j = 1; $j <= $imgs; $j++) {
                $img = new Imagen();
                $seed = $faker->unique()->numberBetween(1000, 9999999);
                $img->setUrl("https://picsum.photos/seed/faker{$seed}/800/600");
                $f->addImagen($img);
                $manager->persist($img);
            }

            // Aleatoriamente marcar algunas como en negociación
            if ($faker->numberBetween(1, 10) === 1) {
                $f->setDisponible(false)->setEstado('en negociación');
            }

            $manager->persist($f);
            $figuras[] = $f;
        }

        $mensajesData = [
            ['emisor' => 0, 'receptor' => 1, 'contenido' => 'Hola, ¿te interesa intercambiar la figura de Goku?'],
            ['emisor' => 1, 'receptor' => 0, 'contenido' => 'Podría considerar un intercambio por Batman Arkham.'],
            ['emisor' => 2, 'receptor' => 3, 'contenido' => '¿Sigues vendiendo la figura de Zelda?'],
            ['emisor' => 3, 'receptor' => 2, 'contenido' => 'Sí, está disponible y en buen estado.'],
            ['emisor' => 4, 'receptor' => 0, 'contenido' => 'Bienvenido a FiguMarket, cualquier duda aquí.'],
            ['emisor' => 0, 'receptor' => 2, 'contenido' => '¿Cuál es el precio final de Naruto?'],
            ['emisor' => 2, 'receptor' => 0, 'contenido' => 'Podría dejarlo en 70.'],
            ['emisor' => 1, 'receptor' => 3, 'contenido' => '¿Aceptas envío por mensajería?'],
            ['emisor' => 3, 'receptor' => 1, 'contenido' => 'Sí, a todo el país.'],
            ['emisor' => 0, 'receptor' => 1, 'contenido' => 'Gracias por la respuesta.'],
        ];

        foreach ($mensajesData as $data) {
            $m = new Mensaje();
            $m->setEmisor($usuarios[$data['emisor']])
              ->setReceptor($usuarios[$data['receptor']])
              ->setContenido($data['contenido']);
            $manager->persist($m);
        }

        // Ventas simuladas retiradas: la entidad Transaccion ya no existe.

        // Noticias de ejemplo para el slider
        $noticiasData = [
            [
                'titulo' => 'NOVEDAD: Figura Goku SSJ edición limitada',
                'resumen' => 'Nueva tirada limitada con detalles mejorados y base iluminada.',
                'descripcion' => 'La figura de Goku Super Saiyan llega con una edición limitada que incluye base iluminada y pintura metalizada en el cabello. Ideal para coleccionistas.',
                'imagen' => 'https://picsum.photos/seed/goku-ssj/1600/900',
                'url' => 'https://example.com/noticia/goku-ssj-limitada',
            ],
            [
                'titulo' => 'Preventa: Batman Arkham Premium ya disponible',
                'resumen' => 'Reserva abierta para la edición premium con múltiples accesorios.',
                'descripcion' => 'La figura premium de Batman Arkham incluye varias manos intercambiables, batarangs y una capa con alambre para poses dinámicas.',
                'imagen' => 'https://picsum.photos/seed/batman-premium/1600/900',
                'url' => 'https://example.com/noticia/batman-arkham-premium',
            ],
            // Tres noticias de figuras de acción adicionales
            [
                'titulo' => 'Figuras de acción: Marvel Legends presenta nueva wave',
                'resumen' => 'Lanzamiento de una nueva wave con personajes clásicos y modernos.',
                'descripcion' => 'Hasbro anuncia una wave de Marvel Legends con articulación mejorada y accesorios únicos para cada personaje, ideal para poseadores.',
                'imagen' => 'https://picsum.photos/seed/marvel-legends-wave/1600/900',
                'url' => 'https://example.com/noticia/marvel-legends-wave',
            ],
            [
                'titulo' => 'Star Wars Black Series: edición limitada de trooper',
                'resumen' => 'Trooper con pintura exclusiva y casco intercambiable en tirada limitada.',
                'descripcion' => 'La línea Black Series incorpora un trooper con detalles de batalla, múltiples manos y blasters, pensado para coleccionistas de figuras de acción.',
                'imagen' => 'https://picsum.photos/seed/black-series-trooper/1600/900',
                'url' => 'https://example.com/noticia/black-series-trooper',
            ],
            [
                'titulo' => 'Dragon Ball SH Figuarts: nueva figura de Vegeta',
                'resumen' => 'Vegeta con articulación premium, rostros intercambiables y efectos de energía.',
                'descripcion' => 'Bandai Tamashii Nations lanza una figura de acción de Vegeta con amplio rango de movimiento, manos y rostros, perfecta para escenas dinámicas.',
                'imagen' => 'https://picsum.photos/seed/vegeta-sh-figuarts/1600/900',
                'url' => 'https://example.com/noticia/vegeta-sh-figuarts',
            ],
        ];
        foreach ($noticiasData as $data) {
            $n = new Noticia();
            $n->setTitulo($data['titulo'])
              ->setResumen($data['resumen'])
              ->setDescripcion($data['descripcion'])
              ->setImagen($data['imagen'])
              ->setUrl($data['url']);
            $manager->persist($n);
        }

        $manager->flush();
    }
}
