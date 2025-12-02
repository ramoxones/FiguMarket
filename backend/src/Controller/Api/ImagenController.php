<?php

namespace App\Controller\Api;

use App\Entity\Imagen;
use App\Repository\ImagenRepository;
use App\Repository\FiguraRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/imagenes')]
class ImagenController
{
    public function __construct(private EntityManagerInterface $em, private ImagenRepository $repo, private FiguraRepository $figuras) {}

    #[Route('', name: 'api_imagenes_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $imagenes = array_map(fn(Imagen $i) => $i->toArray(), $this->repo->findAll());
        return new JsonResponse($imagenes, 200);
    }

    #[Route('/{id}', name: 'api_imagenes_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $imagen = $this->repo->find($id);
        if (!$imagen) {
            return new JsonResponse(['error' => 'Imagen no encontrada'], 404);
        }
        return new JsonResponse($imagen->toArray(), 200);
    }

    #[Route('', name: 'api_imagenes_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['figura_id','url'] as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => "Falta el campo '$field'"], 400);
            }
        }
        $figura = $this->figuras->find((int)$data['figura_id']);
        if (!$figura) { return new JsonResponse(['error' => 'Figura no válida'], 400); }
        $url = (string)$data['url'];

        // Si viene como data URL (base64), decodificar y guardar archivo en /public/uploads
        if (preg_match('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i', $url, $m)) {
            $uploadDir = dirname(__DIR__, 3) . '/public/uploads';
            if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0777, true); }
            $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
            $commaPos = strpos($url, ',');
            $base64 = $commaPos !== false ? substr($url, $commaPos + 1) : '';
            $binary = $base64 ? base64_decode($base64) : false;
            if ($binary !== false) {
                $filename = 'fig_' . uniqid('', true) . '.' . $ext;
                $path = $uploadDir . '/' . $filename;
                file_put_contents($path, $binary);
                // Sustituir por ruta relativa servida por el backend
                $url = '/uploads/' . $filename;
            }
        }

        $i = new Imagen();
        $i->setFigura($figura)->setUrl($url);
        $this->em->persist($i);
        $this->em->flush();
        return new JsonResponse($i->toArray(), 201);
    }

    #[Route('/{id}', name: 'api_imagenes_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $i = $this->repo->find($id);
        if (!$i) { return new JsonResponse([], 404); }
        $this->em->remove($i);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}