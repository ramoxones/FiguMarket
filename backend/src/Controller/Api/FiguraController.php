<?php

namespace App\Controller\Api;

use App\Entity\Figura;
use App\Entity\Imagen;
use App\Entity\Mensaje;
use App\Entity\ConversacionArchivada;
use App\Repository\FiguraRepository;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/figuras')]
class FiguraController
{
    public function __construct(private EntityManagerInterface $em, private FiguraRepository $repo, private UsuarioRepository $usuarios) {}

    #[Route('', name: 'api_figuras_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $limitParam = $request->query->get('limit');
        $offsetParam = $request->query->get('offset');
        $limit = is_null($limitParam) ? null : max(1, min(200, (int)$limitParam));
        $offset = max(0, (int)($offsetParam ?? 0));

        $now = new \DateTimeImmutable();
        $expired = $this->repo->createQueryBuilder('f0')
            ->where('f0.destacado = 1')
            ->andWhere('f0.destacadoFin IS NOT NULL')
            ->andWhere('f0.destacadoFin <= :now')
            ->setParameter('now', $now)
            ->getQuery()->getResult();
        if (count($expired) > 0) {
            foreach ($expired as $fx) { $fx->setDestacado(false)->setDestacadoInicio(null)->setDestacadoFin(null); }
            $this->em->flush();
        }

        $paramsAll = $request->query->all();
        $escala = $paramsAll['escala'] ?? [];
        $categoria = $paramsAll['categoria'] ?? [];
        $estado = $paramsAll['estado'] ?? [];
        $estadoFigura = $paramsAll['estado_figura'] ?? [];
        $precioMin = $request->query->get('precioMin');
        $precioMax = $request->query->get('precioMax');
        $fecha = $request->query->get('fecha');
        $fechaDia = $request->query->get('fechaDia');
        $ordenPrecio = $request->query->get('ordenPrecio');
        $ordenFecha = $request->query->get('ordenFecha');

        $qbIds = $this->repo->createQueryBuilder('f')
            ->select('f.id AS fid')
            ->andWhere('f.disponible = :disp')
            ->setParameter('disp', true)
            ->andWhere('LOWER(f.estado) <> :vend')
            ->setParameter('vend', 'vendido');

        if (is_array($escala) && count($escala) > 0) { $qbIds->andWhere('f.escala IN (:esc)')->setParameter('esc', $escala); }
        if (is_array($categoria) && count($categoria) > 0) { $qbIds->andWhere('f.categoria IN (:cat)')->setParameter('cat', $categoria); }
        if (is_array($estadoFigura) && count($estadoFigura) > 0) { $qbIds->andWhere('f.estadoFigura IN (:ef)')->setParameter('ef', $estadoFigura); }
        if (is_array($estado) && count($estado) > 0) { $qbIds->andWhere('f.estado IN (:est)')->setParameter('est', $estado); }

        if ($precioMin !== null) { $qbIds->andWhere('f.precio >= :pmin')->setParameter('pmin', (string)($precioMin)); }
        if ($precioMax !== null) { $qbIds->andWhere('f.precio <= :pmax')->setParameter('pmax', (string)($precioMax)); }

        if ($fechaDia) {
            try {
                $day = new \DateTimeImmutable($fechaDia);
                $start = $day->setTime(0,0,0);
                $end = $day->setTime(23,59,59);
                $qbIds->andWhere('f.fechaPublicacion BETWEEN :dstart AND :dend')
                   ->setParameter('dstart', $start)
                   ->setParameter('dend', $end);
            } catch (\Exception $e) {}
        } elseif ($fecha) {
            try {
                $dt = new \DateTimeImmutable($fecha . '-01');
                $start = $dt->setTime(0,0,0);
                $end = $start->modify('last day of this month')->setTime(23,59,59);
                $qbIds->andWhere('f.fechaPublicacion BETWEEN :mstart AND :mend')
                   ->setParameter('mstart', $start)
                   ->setParameter('mend', $end);
            } catch (\Exception $e) {}
        }

        if ($ordenPrecio === 'asc' || $ordenPrecio === 'desc') {
            $qbIds->orderBy('f.precio', strtoupper($ordenPrecio));
        } elseif ($ordenFecha === 'newest' || $ordenFecha === 'oldest') {
            $dir = $ordenFecha === 'newest' ? 'DESC' : 'ASC';
            $qbIds->orderBy('f.fechaPublicacion', $dir);
        } else {
            $qbIds->orderBy('f.destacado', 'DESC')->addOrderBy('f.fechaPublicacion', 'DESC')->addOrderBy('f.id', 'ASC');
        }

        if (!is_null($limit)) { $qbIds->setMaxResults($limit); }
        if ($offset > 0) { $qbIds->setFirstResult($offset); }

        $idRows = $qbIds->getQuery()->getScalarResult();
        $ids = array_map(fn($r) => (int)($r['fid'] ?? $r['id'] ?? $r[1] ?? $r[0] ?? 0), $idRows);
        $ids = array_values(array_filter($ids, fn($n) => $n > 0));
        if (empty($ids)) { return new JsonResponse([], 200); }

        $qb = $this->repo->createQueryBuilder('f')
            ->leftJoin('f.imagenes', 'i')
            ->addSelect('i')
            ->where('f.id IN (:ids)')
            ->setParameter('ids', $ids);
        $items = $qb->getQuery()->getResult();
        $pos = [];
        foreach ($ids as $idx => $fid) { $pos[$fid] = $idx; }
        usort($items, fn(Figura $a, Figura $b) => ($pos[$a->getId()] ?? 0) <=> ($pos[$b->getId()] ?? 0));
        $figuras = array_map(fn(Figura $f) => $f->toArray(), $items);
        return new JsonResponse($figuras, 200);
    }

    #[Route('/metadata', name: 'api_figuras_metadata', methods: ['GET'])]
    public function metadata(): JsonResponse
    {
        $qbPrice = $this->repo->createQueryBuilder('f')
            ->select('MIN(f.precio) AS minPrice, MAX(f.precio) AS maxPrice')
            ->andWhere('f.disponible = :disp')->setParameter('disp', true)
            ->andWhere('LOWER(f.estado) <> :vend')->setParameter('vend', 'vendido');
        $priceRow = $qbPrice->getQuery()->getOneOrNullResult();
        $min = isset($priceRow['minPrice']) ? (string)$priceRow['minPrice'] : null;
        $max = isset($priceRow['maxPrice']) ? (string)$priceRow['maxPrice'] : null;

        $meses = [];
        try {
            $qbMonths = $this->repo->createQueryBuilder('f')
                ->select("DISTINCT FUNCTION('DATE_FORMAT', f.fechaPublicacion, '%Y-%m') AS ym")
                ->andWhere('f.disponible = :disp')->setParameter('disp', true)
                ->andWhere('LOWER(f.estado) <> :vend')->setParameter('vend', 'vendido')
                ->orderBy('ym', 'DESC');
            $monthsRows = $qbMonths->getQuery()->getScalarResult();
            $meses = array_values(array_map(fn($r) => $r['ym'], $monthsRows));
        } catch (\Throwable $e) {
            $meses = [];
        }

        return new JsonResponse([
            'min_precio' => $min,
            'max_precio' => $max,
            'meses' => $meses,
        ], 200);
    }

    #[Route('/{id}', name: 'api_figuras_update', methods: ['PUT','PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $f = $this->repo->find($id);
        if (!$f) { return new JsonResponse(['error' => 'Figura no encontrada'], 404); }

        $data = json_decode($request->getContent() ?: '{}', true);
        // Actualizar solo campos permitidos
        $allowed = ['nombre','descripcion','categoria','escala','estado','estado_figura','precio','disponible','destacado','destacado_inicio','destacado_fin'];
        foreach ($allowed as $field) {
            if (!array_key_exists($field, $data)) { continue; }
            $val = $data[$field];
            switch ($field) {
                case 'nombre': $f->setNombre((string)$val); break;
                case 'descripcion': $f->setDescripcion((string)$val); break;
                case 'categoria': $f->setCategoria((string)$val); break;
                case 'escala': $f->setEscala((string)$val); break;
                case 'estado': $f->setEstado((string)$val); break;
                case 'estado_figura': $f->setEstadoFigura((string)$val); break;
                case 'precio': $f->setPrecio((string)$val); break;
                case 'disponible': $f->setDisponible((bool)$val); break;
                case 'destacado':
                    $flag = (bool)$val;
                    $f->setDestacado($flag);
                    if ($flag) {
                        $start = isset($data['destacado_inicio']) ? new \DateTimeImmutable((string)$data['destacado_inicio']) : new \DateTimeImmutable();
                        $f->setDestacadoInicio($start);
                        if (isset($data['destacado_fin'])) {
                            $f->setDestacadoFin(new \DateTimeImmutable((string)$data['destacado_fin']));
                        }
                    } else {
                        $f->setDestacadoInicio(null)->setDestacadoFin(null);
                    }
                    break;
                case 'destacado_inicio':
                    $f->setDestacadoInicio($val ? new \DateTimeImmutable((string)$val) : null);
                    break;
                case 'destacado_fin':
                    $f->setDestacadoFin($val ? new \DateTimeImmutable((string)$val) : null);
                    break;
            }
        }

        $this->em->flush();
        return new JsonResponse($f->toArray(), 200);
    }

    #[Route('/{id}', name: 'api_figuras_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $figura = $this->repo->find($id);
        if (!$figura) {
            return new JsonResponse(['error' => 'Figura no encontrada'], 404);
        }
        $now = new \DateTimeImmutable();
        if ($figura->isDestacado() && $figura->getDestacadoFin() && $figura->getDestacadoFin() <= $now) {
            $figura->setDestacado(false)->setDestacadoInicio(null)->setDestacadoFin(null);
            $this->em->flush();
        }
        return new JsonResponse($figura->toArray(), 200);
    }

    #[Route('', name: 'api_figuras_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['usuario_id','nombre','descripcion','categoria','escala','estado','precio','disponible'] as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => "Falta el campo '$field'"], 400);
            }
        }
        $usuario = $this->usuarios->find((int)$data['usuario_id']);
        if (!$usuario) { return new JsonResponse(['error' => 'Usuario no válido'], 400); }
        $f = new Figura();
        $f->setUsuario($usuario)
          ->setNombre($data['nombre'])
          ->setDescripcion($data['descripcion'])
          ->setCategoria($data['categoria'])
          ->setEscala($data['escala'])
          ->setEstado($data['estado'])
          ->setPrecio((string)$data['precio'])
          ->setDisponible((bool)$data['disponible'])
          ->setDestacado(isset($data['destacado']) ? (bool)$data['destacado'] : false);
        if (isset($data['estado_figura'])) { $f->setEstadoFigura((string)$data['estado_figura']); }
        if (isset($data['fecha_publicacion'])) {
            $f->setFechaPublicacion(new \DateTimeImmutable($data['fecha_publicacion']));
        }
        // Adjuntar imágenes si se proporcionan (array de strings data URL o {url})
        if (isset($data['imagenes']) && is_array($data['imagenes'])) {
            $uploadDir = dirname(__DIR__, 3) . '/public/uploads';
            if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0777, true); }
            foreach ($data['imagenes'] as $img) {
                $url = is_array($img) ? ($img['url'] ?? null) : (is_string($img) ? $img : null);
                if (!$url) { continue; }

                // Si es un data URL (base64), decodificar y guardar en /uploads
                if (preg_match('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i', $url, $m)) {
                    $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
                    $commaPos = strpos($url, ',');
                    $base64 = $commaPos !== false ? substr($url, $commaPos + 1) : '';
                    $binary = $base64 ? base64_decode($base64) : false;
                    if ($binary !== false) {
                        $filename = 'fig_' . uniqid('', true) . '.' . $ext;
                        $path = $uploadDir . '/' . $filename;
                        file_put_contents($path, $binary);
                        // Guardar como ruta relativa servida por el backend
                        $url = '/uploads/' . $filename;
                    }
                }

                $imagen = new Imagen();
                $imagen->setUrl($url);
                $f->addImagen($imagen);
                $this->em->persist($imagen);
            }
        }
        $this->em->persist($f);
        $this->em->flush();
        return new JsonResponse($f->toArray(), 201);
    }

    #[Route('/{id}', name: 'api_figuras_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $f = $this->repo->find($id);
        if (!$f) { return new JsonResponse([], 404); }
        // Transacciones eliminadas del modelo: no hay que borrar relación
        $mRepo = $this->em->getRepository(Mensaje::class);
        $mens = $mRepo->createQueryBuilder('m')->where('m.figura = :fig')->setParameter('fig', $f)->getQuery()->getResult();
        foreach ($mens as $m) { $this->em->remove($m); }
        $cRepo = $this->em->getRepository(ConversacionArchivada::class);
        $archs = $cRepo->findBy(['figura' => $f]);
        foreach ($archs as $a) { $this->em->remove($a); }
        $this->em->remove($f);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
